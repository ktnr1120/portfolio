const router = require("express").Router();
const { publicPosts, privatePosts } = require("../DB/Post");
const checkJWT = require("../middleware/checkJWT");

//誰でも見れる記事記事閲覧用のAPI
router.get("/public", (req, res) => {
    res.json(publicPosts);
});

//JWTを持っている人が見れる記事閲覧用のAPI
router.get("/private", checkJWT, (req, res) => {
    res.json(privatePosts);
});

module.exports = router;
