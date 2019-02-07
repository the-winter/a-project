let mongoose = require("mongoose");
let database = require("../.secrets/database");

const uri = database.databaseStr;

// connect to mongo
mongoose
    .connect(uri, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => console.log(err));
mongoose.set("useCreateIndex", true);

var db = mongoose.connection;

module.exports = db;
