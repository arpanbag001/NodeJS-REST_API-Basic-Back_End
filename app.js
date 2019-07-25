const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json());

//Set headers for CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use("/feed", feedRoutes);

mongoose.connect("mongodb+srv://arpan:arpanbag12@cluster0-o4or2.mongodb.net/social?retryWrites=true&w=majority")
    .then(
        app.listen(8080, () => { console.log("Listening at port 8080") })
    )
    .catch(err => console.log(err));
