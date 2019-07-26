const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

//Set headers for CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//For feeds
app.use("/feed", feedRoutes);

//For error handling
app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500; //Use status code 500 if status code is not set
    const errorMessage = error.message;
    res.status(statusCode).json({ message: errorMessage });
});

mongoose.connect("mongodb://localhost/social")
    .then(
        app.listen(8080, () => { console.log("Listening at port 8080") })
    )
    .catch(err => console.log(err));
