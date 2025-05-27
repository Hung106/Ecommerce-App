const connectDB = require("../sqlConfig");
const sql = require("mssql");
const {checkIfTableExists} = require("./helper")

async function createNotice(id, content){
    try {
        const pool = await connectDB();
        const curTime = new Date().toISOString();
        const checkout = await checkIfTableExists("notice");
        if (!checkout){
            await pool.request()
            .query(`
                CREATE TABLE notice (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    content NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE(),
                    isread  BIT DEFAULT 0,
                    uid NVARCHAR(50) NOT NULL,
                    foreign key(uid) references	customers(user_id)
                )
            `);
        }
        await pool.request()
            .input("id", sql.NVarChar(255), id)
            .input("content", sql.NVarChar(255), content)
            .input("date", sql.DateTime, curTime)
            .query(`
                INSERT INTO notice (content, created_at, uid)
                VALUES (@content, @date, @id)
                `)
        return ({content: content, isread: false, time: curTime})
    } catch (error) {
        console.log(id)
        return ({error: error.message})
    }
}

async function getAllNotice(req, res) {
    try{
        const id = req.params.id
        const pool = await connectDB()
        const checkout = await checkIfTableExists("notice")
        console.log("Checkout: ", checkout)
        if (!checkout) return res.status(200).json({message: "No notices found"})
        else
        {
        const response = await pool.request()
                        .input("id", sql.NVarChar(255), id)
                        .query(`
                            SELECT content, create_at, isread
                            FROM notice WHERE uid = @id
                            `)
        if (response.recordset.length == 0) return res.status(200).json({message: "No notice found"})
        else return res.status(200).json({notice: response.recordset})
        }
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Network Error"})
    }
}

module.exports = {
    createNotice,
    getAllNotice
}