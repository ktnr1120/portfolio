const router = require("express").Router();
const { query, body, validationResult } = require('express-validator');
const { User } = require("../DB/user");
const bcrypt = require("bcrypt");

router.get("/", (req,res) => {
    res.send("Hello Authjs");
});


//ユーザー新規登録
router.post(
    "/register", 
    //バリデーションチェック
    body("email").isEmail(),
    body("password").isLength({min: 6 }),
    async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const erros = validationResult(req);
    if(!erros.isEmpty()) {
        return res.status(400).json({ erros: erros.array() });
    }
    //↓公式ドキュメント
    // const result = validationResult(req);
    // if(result.isEmpty()) {
    //     return res.send(`Hello, ${req.query.person}!`);
    // }

    // res.send({ erros: result.array() });

    //DBにユーザーが存在しているか確認
    const user = User.find((user) => user.email === email);
    if(user) {
        return res.status(400).json([
            {
                massage: "すでにそのユーザーは存在しています。",
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

    //クライアントへJWTの発行

})

module.exports = router;
