const router = require("express").Router();
const { query, body, validationResult } = require('express-validator');
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
router.get("/", (req,res) => {
    res.send("Hello Authjs");
});
//DBの接続設定
const dbConfig = {
    connectionLimit: 10,//接続回数
    host: "localhost",
    user: "root",
    password: "",
    database: "memory",
};
//pool＝＞DB接続準備、必要に応じて接続と開放を行う
const pool = mysql.createPool(dbConfig);

//1.ユーザー新規登録
router.post(
    "/register",
    //バリデーションチェック
    body("email").isEmail(),
    body("password").isLength({min: 6 }),
    async (req,res) => {
        const errors = validationResult(req);
        
        if(!erros.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    //DBにユーザーが存在しているか確認
    const email = req.body.email;
    const password = req.body.password;

    const user = User.find((user) => user.email === email);
    if(user) {
        return res.status(400).json([
            {
                message: "すでにユーザーは存在しています",
            },
        ]);
    }

    //パスワードの暗号化
    let hashedPassword = await bcrypt.hash(password, 10)
    //console.log(hashedPassword);

    //DBへの保存
    User.push({
        email,
        password: hashedPassword,
    });
        
    //4-2.クライアントへJWTの発行
    const token = await JWT.sign(
        {
            email,
        },
        process.env.SECRETKEY,
        {
            expiresIn: "24h",
        }
    );
});

//4.DBからユーザー情報の取得(取り出し)
const { email,password } = req.body;

pool.getConnection((connectionError, connection) => {
    if(connectionError) {
        console.error("データベース接続エラー: " + err.message);
        return res.status(500).send("データベース接続エラー");
    }

    connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {

        if(err) {
            console.error("データベースクエリエラー: " + err.message);
            return res.status(500).send("データベースクエリーエラー");
        }

        if(rows.length === 0) {
            return res.status(400).json({ message: "ユーザーが存在しません"});
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ message: "パスワードが異なります"});
        }

        //4-1.ログイン成功時のトークン発行
            const token = JWT.sign({ email }, process.env.SECRETKEY, {expiresIn: "24h"});
        res.json({ token });
     });
});
//2.DBへの保存

//2-1パスワードの暗号化

//3.DBにユーザーが存在しているか確認

//4.DBからユーザー情報を取り出す

//4-1.ログイン成功時のトークン発行



//5.ログイン用のAPI
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    const user = User.find((user) => user.email === email);
    if(!user) {
        return res.status(400).json([
            {
                message: "ユーザーが存在しません",
            },
        ]);
    }

    //パスワードの複合、照合
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        return res.status(400).json([
            {
                massage: "パスワードが異なります",
            },
        ]);
    }
    const token = await JWT.sign(
        {
            email,
        }
    process.env.SECRETKEY,
        {
            expiresIn: "24h",
        }
    );

    return res.json({
        token: token,
    });
});

//6.DBのユーザーを確認するAPI
router.get("/allUsers", (req, res) => {
    return res.json(User);
})

module.exports = router;