const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");


const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
        cb(null, true);
    else
        cb(null, false);
}

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

//Set headers for CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//For authentication management
app.use("/auth", authRoutes);

//For feeds
app.use("/feed", feedRoutes);

//For error handling
app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500; //Use status code 500 if status code is not set
    const errorMessage = error.message;
    const data = error.data;
    res.status(statusCode).json({ message: errorMessage, data: data });
});

mongoose.connect("mongodb://localhost/social", { useNewUrlParser: true })
    .then(
        app.listen(8080, () => { console.log("Listening at port 8080") })
    )
    .catch(err => console.log(err));
