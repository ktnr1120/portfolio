const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

//データベースの設定
const dbConfig = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "memory",
};

//データベースのonoff
const pool = mysql.createPool(dbConfig);

//ユーザー新規登録
router.post(
    "/register",
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;
        const password = req.body.password;

        // ユーザーの存在確認
        pool.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
            if (err) {
                console.error("データベースクエリエラー :" + err.message);
                return res.status(500).send("データベースクエリエラー");
            }

            if (rows.length > 0) {
                return res.status(400).json({
                    message: "すでにユーザーは存在しています",
                });
            } else {
                // パスワードの暗号化
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error("パスワードの暗号化エラー: " + err.message);
                        return res.status(500).send("パスワードの暗号化エラー");
                    }

                    // ユーザーをDBに保存
                    pool.query(
                        "INSERT INTO users (email, password) VALUES (?, ?)",
                        [email, hashedPassword],
                        (err, result) => {
                            if (err) {
                                console.error("データベースクエリエラー: " + err.message);
                                return res.status(500).send("データベースクエリエラー");
                            }

                            // JWTの発行とクライアントへのレスポンス
                            const token = JWT.sign(
                                {
                                    email,
                                },
                                process.env.SECRETKEY, // ここでSECRETKEYを設定している必要があります
                                {
                                    expiresIn: "24h",
                                }
                            );
                            res.json({ token });
                        }
                    );
                });
            }
        });
    }
);

//ログイン用のAPI
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
        if (err) {
            console.error("データベースクエリエラー: " + err.message);
            return res.status(500).send("データベースクエリエラー");
        }

        if (rows.length === 0) {
            return res.status(400).json({ message: "ユーザーが存在しません" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "パスワードが異なります" });
        }

        //ログイン成功時にトークンの発行
        const token = JWT.sign(
            { email },
            process.env.SECRETKEY,
            { expiresIn: "24h" }
        );
        res.json({ token });
    });
});

router.get("/allUsers", (req, res) => {
    // ユーザー情報を取得するための処理が不足
    // このエンドポイントの処理を追加する
    res.status(501).send("Not Implemented");
});

module.exports = router;
