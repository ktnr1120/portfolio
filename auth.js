const router = require("express").Router();
const { query, body, validationResult } = require('express-validator');
//const { User } = require("../DB/user");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const auth = require("dotenv");
router.get("/", (req,res) => {
    res.send("Hello Authjs");
});

const dbConfig = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "memory",
};

const pool = mysql.createPool(dbConfig);

router.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

router.post("/login", async (req,res) => {
    const { email, password } = req.body;

    //DBからユーザー情報を取得
    pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: "データベースクエリエラー"});
        }

        if (result.length === 0) {
            return res.status(400).json({ error: "ユーザーが存在しません" });
        }

        const user = result[0];
        const isMatch = await bcrypt.conpara(password, user.password_hash);

        if(!isMatch) {
            return res.status(400).json({ error: "パスワードが異なります"});
        }
    });
});
});

//     // データベースにユーザーを挿入(仮DB用)
//     pool.getConnection((err, connection) => {
//         if (err) {
//             console.error("データベース接続エラー: " + err.message);
//             return res.status(500).send("データベース接続エラー");
//         }

//         connection.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err, result) => {
//             connection.release();
//             if (err) {
//                 console.error("データベースクエリエラー: " + err.message);
//                 return res.status(500).send("データベースクエリエラー");
//             }

//             // ユーザー登録成功の応答
//             res.json({ message: "ユーザー登録が成功しました" });
//         });
//     });
// });

router.post("/login", async (req, res) => {
    const { email, password } =req.body;

    //データベースからユーザーを取得
    pool.getConnection((error, connection) => {
        if(err) {
            console.error("データベース接続エラー: " + err.message);
            return res.status(500).send("データベース接続エラー");
        }

        connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
            connection.release();

            if(err) {
                console.error("データベースクエリエラー:  "+ err.message);
                return res.status(500).send("データベースクエリエラー");
            }
            
            if (rows.length === 0) {
                return res.status(400).json({ message: "ユーザーが存在しません"});
            }

            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({ message: "パスワードが異なります"});
            }

            //ログイン成功時の応答とトークンの発行
            const token = JWT.sign({ email }, process.env.SECRETKEY, {expiresIn: "24h" });
            res.json({ token });
        });
    });
});

// //ユーザー新規登録
// router.post(
//     "/register", 
//     //バリデーションチェック
//     body("email").isEmail(),
//     body("password").isLength({min: 6 }),
//     async (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;

//     const erros = validationResult(req);
//     if(!erros.isEmpty()) {
//         return res.status(400).json({ erros: erros.array() });
//     }

//     //DBにユーザーが存在しているか確認
//     const user = User.find((user) => user.email === email);
//     if(user) {
//         return res.status(400).json([
//             {
//                 massage: "すでにそのユーザーは存在しています。",
//             },
//         ]);
//     }

//     //パスワードの暗号化
//     let hashedPassword = await bcrypt.hash(password, 10)
//     //console.log(hashedPassword);

//     //DBへの保存
//     User.push({
//         email,
//         password: hashedPassword,
//     });

//     //クライアントへJWTの発行
//     const token = await JWT.sign(
//         {
//             email,
//         },
//         process.env.SECRETKEY,//これは直書きしない、見えないファイルを設定する
//         {
//             expiresIn: "24h",
//         }
//     );

//     return res.json({
//         token: token,
//     });
// });

// //ログイン用のAPI
// router.post("/login", async(req, res) => {
//     const { email, password } = req.body;
    
//     const user = User.find((user) => user.email === email);
//     if(!user) {
//         return res.status(400).json([
//             {
//                 message: "ユーザーが存在しません。",
//             },
//         ]);
//     }

//     //パスワードの複合、照合
//     const isMatch = await bcrypt.compare(password, user.password);

//     if(!isMatch) {
//         return res.status(400).json([
//             {
//                 massage: "パスワードが異なります",
//             },
//         ]);
//     }
//     const token = await JWT.sign(
//         {
//             email,
//         },
//         process.env.SECRETKEY,//これは直書きしない、見えないファイルを設定する
//         {
//             expiresIn: "24h",
//         }
//     );

//     return res.json({
//         token: token,
//     });
// });

// //DBのユーザーを確認するAPI
// router.get("/allUsers", (req, res) => {
//     return res.json(User);
// })
module.exports = router;
