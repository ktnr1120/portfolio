const express = require("express");
const { engine } = require ("express-handlebars");
const fileUpload = require("express-fileupload");
const app = express();
const mysql = require("mysql");
const { constants } = require("buffer");
const auth = require("./routes/auth");
const post = require("./routes/post");
//const { query } = require('express-validator');

app.use(express.json());
app.use("/auth", auth);
app.use("/post", post);

const PORT = 8000;

app.use(fileUpload());

app.use(express.static("upload"));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//connection pool(DBに最初から接続しておく。オープンな状態)
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "memory",
});


//DBへの画像送信
app.get("/", (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) {
            // エラーハンドリング
            console.error("データベース接続エラー: " + err.message);


            return res.status(500).send("データベース接続エラー");
        }

        console.log("MySQLと接続中・・・🌳");
        
        //データの取得
        connection.query("SELECT * FROM image", (err, rows) => {
            connection.release();

            if (err) {
                // エラーハンドリング
                console.error("データベースクエリエラー: " + err.message);
                
               
                return res.status(500).send("データベースクエリエラー");
            }

            console.log(rows);
            if(!err) {
                res.render("home", { rows });
            }
        });
    });
});

//DBからのレスポンスについて
app.post("/", (req, res) => {
    if(!req.files) {
        return res.status(400).send("何も画像がアップロードされていません");
    }

    let imageFile = req.files.imageFile;
    let uploadPath = __dirname + "/upload/" + imageFile.name;

    //サーバーに画像ファイルを置く場所の指定
    imageFile.mv(uploadPath, function(err) {
        if(err) return res.status(500).send(err);
        //res.send("画像アップロードに成功しました");
    });


        //mysqlに画像ファイルの名前を保存する
        pool.getConnection((err, connection) => {
            if (err) {
                // エラーハンドリング
                console.error("データベース接続エラー: " + err.message);


                return res.status(500).send("データベース接続エラー");
            }

            console.log("MySQLと接続中・・・🌳");
        connection.query(`INSERT INTO image values ("","${imageFile.name}")`,
        (err,rows) => {
            connection.release();

            // console.log(rows);
            if (!err) {
                res.redirect("/");
            } else {
                console.log(err);
            }
        }
        );
    });
});

app.listen(PORT, () => console.log("サーバー起動中🚀"));