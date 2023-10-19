const router = require("express").Router();

router.get("/", (req,res) => {
    res.send("Hello Authjs");
});


//ユーザー新規登録
router.post("/register", (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    console.log(email, password);
});

module.exports = router;
