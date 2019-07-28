const fileSystem = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;    //Get request page number, or use 1 as default
    const postPerPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find().skip((currentPage - 1) * postPerPage).limit(postPerPage);
        })
        .then(posts => {
            res.status(200).json({ message: "Feteched posts successfully.", posts: posts, totalItems: totalItems });
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect!");
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error("No image provided!");
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Post created successfully!",
                post: post,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            console.log(err)
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: "Post fetched.", post: post });
        })
        .catch(err => {
            console.log(err)
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect!");
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;   //Set the old image URL
    if (req.file)   //If a new image was selected
        imageUrl = req.file.path;   //Use the URL of the new image
    if (!imageUrl) {   //If still no file was found
        const error = new Error("No image is selected!");
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
        .then(post => { //Database connection successful
            if (!post) {    //Could not find post
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            //Check if the user is the creator of the post
            if (post.creator.toString() !== req.userId) {
                const error = new Error("Not authorized!");
                error.statusCode = 403;
                throw error;
            }
            if (imageUrl !== post.imageUrl)    //A new file is uploaded
                clearImage(post.imageUrl);  //Delete the old (outdated) image

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {   //Post saved (updated) successfully
            res.status(200).json({ message: "Post updated!", post: result });
        })
        .catch(err => { //Database connection failed
            console.log(err)
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {    //Could not find post
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            //Check if the user is the creator of the post
            if (post.creator.toString() !== req.userId) {
                const error = new Error("Not authorized!");
                error.statusCode = 403;
                throw error;
            }
            //Delete the image
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: "Post deleted successfully!" });
        })
        .catch(err => { //Database connection failed
            console.log(err)
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
}

//Function to clear the old image
const clearImage = filePath => {
    path.join(__dirname, "..", filePath);
    fileSystem.unlink(filePath, err => console.log(err));
};