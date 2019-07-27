const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

//For fetching all posts
router.get("/posts", feedController.getPosts);

//For creating a post
router.post("/post", [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 })
], feedController.createPost);

//For fetching a particular post
router.get("/post/:postId", feedController.getPost);

//For editing a particular post
router.put("/post/:postId", [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 })
], feedController.updatePost);

//For deleting a particular post
router.delete("/post/:postId",feedController.deletePost);

module.exports = router;