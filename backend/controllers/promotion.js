const connectDB = require("../sqlConfig");
const sql = require("mssql");

async function CreatePromotions(req,res) {
    const pool = connectDB()
    const transaction = new sql.Transaction(pool)
    try {
        await transaction.begin()
        const rq = new sql.Request(transaction)
        const seller_id = req.params.seller_id
        const {
            discount_rate, discount_type, 
            valid_start, valid_end, 
            type, ptype, 
            remain_numbers, min_spend, 
            max_discount
        } = req.body
        if (type !== 'all' && (!ptype || ptype == '')) return res.status(400).json({message: "Ptype mapping to category id or product id is required"}) 
        const idCheckout = await rq
                        .query(`SELECT * FROM promotions`)
        let id = idCheckout.recordset[idCheckout.recordset.length - 1]?.promotion_id + 1 || 0
        await rq
        .input("id", sql.Int, id)
        .input("sid", sql.NVarChar(50), seller_id)
        .input("rate", sql.Decimal(10,2), discount_rate)
        .input("discount_type", sql.NVarChar(10), discount_type)
        .input("start", sql.DateTime, valid_start)
        .input("end", sql.DateTime, valid_end)
        .input("type", sql.NVarChar(10), type)
        .input("ptype", sql.NVarChar(10), ptype)
        .input("rm", sql.Int, remain_numbers)
        .input("min", sql.Decimal(10,2), min_spend)
        .input("max", sql.Decimal(10,2), max_discount)
        .query(`
            INSERT INTO promotions 
            VALUES (@id, @rate, @discount_type, @start, @end, @type, @rm, @min, @max, @ptype);
            INSERT INTO seller_has_promotions
            VALUES (@id, @sid);
        `)
        await transaction.commit()
        res.status(200).json({message: "Successfully create a new voucher!"})
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({message: "Network Error!"})
    }
}

async function GetPromotionsBySellers(req, res) {
    const pool = connectDB();
    try {
        const rq = new sql.Request(pool);
        const seller_id = req.params.seller_id;
        const result = await rq
            .input("sid", sql.NVarChar(50), seller_id)
            .query(`
                SELECT p.* FROM promotions p
                INNER JOIN seller_has_promotions shp ON p.promotion_id = shp.promotion_id
                WHERE shp.seller_id = @sid
            `);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Network Error!" });
    }
}

function SortedVoucher(lstItems, voucher){
    console.log("Sorted Voucher", voucher)
    console.log("Sorted Voucher Items", lstItems.length)
    const total_price = lstItems.reduce((acc, curr) => {
        return acc + curr.paid_price * curr.quantity
    }, 0) 
    switch(voucher.type){
        case 'all':
            return voucher.discount_type === 'percent' 
            ? Math.min(total_price * voucher.discount_rate, voucher.min_spend)
            : voucher.discount_rate
        case 'category':
            const apply_price = lstItems.filter(p => p.category_id === voucher.ptype)
                                .reduce((acc, curr)=>{
                                    return acc + curr.paid_price * curr.quantity
                                }, 0)
            return voucher.discount_type === 'percent' 
            ? Math.min(apply_price * voucher.discount_rate, voucher.min_spend)
            : voucher.discount_rate
        case 'specific':
            const apply_pricep = lstItems.filter(p => p.product_id === voucher.ptype)
                                .reduce((acc, curr)=>{
                                    return acc + curr.paid_price * curr.quantity
                                }, 0)
            return voucher.discount_type === 'percent' 
            ? Math.min(apply_pricep * voucher.discount_rate, voucher.min_spend)
            : voucher.discount_rate
    }
    return 0;
}

function ValidatePromo(lstItems, lstVoucher){
    const total_price = lstItems.reduce((acc, curr) => {
        return acc + curr.paid_price * curr.quantity
    }, 0) 
    console.log("lstItems: ", lstItems.length)
    console.log("lstVoucher: ", lstVoucher.length)
    let validVouchers = []
    for (i in lstVoucher){
        const item = lstVoucher[i]
        switch(item.type){
            case 'all':
                if (total_price >= item.min_spend) 
                    validVouchers.push(item)
                break;
            case 'category':
                const apply_price = lstItems.filter(p => p.category_id === item.ptype)
                                    .reduce((acc, curr)=>{
                                        return acc + curr.paid_price * curr.quantity
                                    }, 0)
                if (apply_price >= item.min_spend)
                    validVouchers.push(item)
                break;
            case 'specific':
                const apply_pricep = lstItems.filter(p => p.product_id === item.ptype)
                                    .reduce((acc, curr)=>{
                                        return acc + curr.paid_price * curr.quantity
                                    }, 0)
                if (apply_pricep >= item.min_spend)
                    validVouchers.push(item)
                break;
        }
    }   
    return validVouchers;
}

async function getAllPromotions(req, res) {
    const pool = await connectDB();
    try {
        const rq = new sql.Request(pool);
        const {lstItems} = req.body;
        const userItems = JSON.parse(lstItems || "[]");
        console.log("User Items: ", userItems)
        const date = new Date()
        const lstVoucher = await rq
        .input("date", sql.DateTime, date)
        .query(`
            SELECT TOP 200 * FROM promotions
            WHERE remain_numbers > 0 AND 
            @date BETWEEN valid_start AND valid_end
            AND type = 'all'
        `);
        if (!userItems || userItems.length <= 0) return res.status(200).json({data: lstVoucher.recordset || []})
        console.log("Pass query")
        console.log(lstVoucher.recordset.length || [])
        const validVoucher = ValidatePromo(userItems, lstVoucher.recordset)
                            .sort((a, b) => SortedVoucher(userItems,b) - SortedVoucher(userItems,a))
        console.log("Valid Voucher: ", validVoucher.length)
        res.status(200).json({data: validVoucher || []});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function UpdatePromotions(req, res) {
    const pool = connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const rq = new sql.Request(transaction);
        const seller_id = req.params.seller_id;
        const promotion_id = req.params.promotion_id;
        const {
            discount_rate, discount_type,
            valid_start, valid_end,
            type, ptype,
            remain_numbers, min_spend,
            max_discount
        } = req.body;
        await rq
            .input("id", sql.Int, promotion_id)
            .input("sid", sql.NVarChar(50), seller_id)
            .input("rate", sql.Decimal(10,2), discount_rate)
            .input("discount_type", sql.NVarChar(10), discount_type)
            .input("start", sql.DateTime, valid_start)
            .input("end", sql.DateTime, valid_end)
            .input("type", sql.NVarChar(10), type)
            .input("ptype", sql.NVarChar(10), ptype)
            .input("rm", sql.Int, remain_numbers)
            .input("min", sql.Decimal(10,2), min_spend)
            .input("max", sql.Decimal(10,2), max_discount)
            .query(`
                UPDATE promotions SET
                    discount_rate = @rate,
                    discount_type = @discount_type,
                    valid_start = @start,
                    valid_end = @end,
                    type = @type,
                    remain_numbers = @rm,
                    min_spend = @min,
                    max_discount = @max,
                    ptype = @ptype
                WHERE promotion_id = @id
            `);
        await transaction.commit();
        res.status(200).json({ message: "Promotion updated successfully!" });
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({ message: "Network Error!" });
    }
}

async function DeletePromotions(req, res) {
    const pool = connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const rq = new sql.Request(transaction);
        const promotion_id = req.params.promotion_id;
        await rq
            .input("id", sql.Int, promotion_id)
            .query(`
                DELETE FROM seller_has_promotions WHERE promotion_id = @id;
                DELETE FROM promotions WHERE promotion_id = @id;
            `);
        await transaction.commit();
        res.status(200).json({ message: "Promotion deleted successfully!" });
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({ message: "Network Error!" });
    }
}

module.exports={
    CreatePromotions, 
    UpdatePromotions, getAllPromotions,
    GetPromotionsBySellers,
    DeletePromotions
}