const express = require("express");
const { engine } = require ("express-handlebars");
const fileUpload = require("express-fileupload");
const app = express();

const PORT = 8000;

app.use(fileUpload());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.get("/", (req, res) => {
    res.render("home");
});

app.post("/", (req, res) => {
    if(!req.files) {
        return res.status(400).send("何も画像がアップロードされていません");
    }

    let imageFile = req.files.imageFile;
    let uploadPath = __dirname + "/upload/" + imageFile.name;

    //サーバーに画像ファイルを置く場所の指定
    imageFile.mv(uploadPath, function(err) {
        if(err) return res.status(500).send(err);
        res.send("画像アップロードに成功しました");
    });
});

app.listen(PORT, () => console.log("サーバー起動中🚀"));