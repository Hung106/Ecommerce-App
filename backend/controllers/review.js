const connectDB = require("../sqlConfig");
const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");

class Review{
    async CreateReview(req, res){
        const pool = await connectDB()
        const transaction = new sql.Transaction(pool)
        try {
            await transaction.begin()
            const rq = new sql.Request(transaction)
            const {id} = req.params
            const date = new Date()
            const review_id = uuidv4()
            const {product_id, comment, rating} = req.body
            await rq 
            .input("id", sql.NVarChar(50), id)
            .input("rid", sql.NVarChar(50), review_id)
            .input("pid", sql.NVarChar(50), product_id)
            .input("date", sql.DateTime, date)
            .input("comment", sql.NVarChar(sql.MAX), comment)
            .input("rate", sql.Int, rating)
            .query(`
                INSERT INTO reviews (product_id, review_id, date_post, comment, rating, customer_id)
                VALUES (@pid, @rid, @date, @comment, @rate, @id)
            `)
            await transaction.commit()
            res.status(200).json({message: "Your review has been posted!"})
        } catch (error) {
            await transaction.rollback()
            res.status(500).json({message: "Network Error!"})
        }
    }

    async GetReviewByProduct(req, res){
        try {
            const {id} = req.params
            const pool = await connectDB()
            const result = await pool.request()
                        .input("id", sql.NVarChar(50), id)
                        .query(`SELECT * FROM reviews WHERE product_id = @id`)
            res.status(200).json({data: result.recordset || []})
        } catch (error) {
            res.status(500).json({message: "Network Error"})
        }
    }

    async UpdateReviewByUser(req, res){
        const pool = await connectDB()
        const transaction = new sql.Transaction(pool)
        try {
            await transaction.begin()
            const {review_id} = req.params
            const {content, customer_id, product_id, rating} = req.body
            const date = new Date()
            const rq = new sql.Request(transaction)
            await rq 
            .input("rid", sql.NVarChar(50), review_id)
            .input("cid", sql.NVarChar(50), customer_id)
            .input("pid", sql.NVarChar(50), product_id)
            .input("content", sql.NVarChar(sql.MAX), content)
            .input("date". sql.DateTime, date)
            .input("rate", sql.Int, rating)
            .query(`
                UPDATE reviews
                SET content = @content, date_post = @date, rating = @rate
                WHERE review_id = @rid AND product_id = @pid AND customer_id = @cid
            `)
            await transaction.commit()
            res.status(200).json({message: "Update review successfully!"})
        } catch (error) {
            res.status(500).json({message: "Network Error!"})
        }
    }

    async DeleteReview(req, res){
        const pool = await connectDB()
        const transaction = new sql.Transaction(pool)
        try {
            await transaction.begin()
            const {id} = req.params
            const rq = new sql.Request(transaction)
            await rq
            .input("id", sql.NVarChar(50), id)
            .query(`DELETE reviews WHERE review_id = @id`)
            await transaction.commit()
            res.status(200).json({message: "Delete review successfully!"})
        } catch (error) {
            res.status(500).json({message: "Network Error!"})
        }
    }
}

module.exports= new Review()

