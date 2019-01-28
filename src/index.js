const express = require("express");
const app = express();

let personRoute = require("./routes/person");
let customerRoute = require("./routes/customer");
let routes = require("./routes/routes");
let users = require("./routes/users");

let path = require("path");

// gives us access to req.body. w/o this we'd have to look at the raw data
let bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
let mongoose = require("mongoose");
let database = require("../.secrets/database");

// get the connection string
const uri = database.databaseStr;

// connect to mongo
mongoose
    .connect(
        uri,
        { useNewUrlParser: true }
    )
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => console.log(err));
mongoose.set("useCreateIndex", true);

var db = mongoose.connection;

// taking in any incoming json string and creating an attribute called body.

app.use((req, res, next) => {
    console.log(
        `${new Date().toString()} => ${req.originalUrl}`,
        path.join(__dirname, "../views")
    );
    next();
});

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));
// express also has its own bodyparser in current version, we didn't need to import it like this
app.use(bodyParser.json());
app.use(expressLayouts);

app.use("/", routes);
app.use("/users", users);
// app.use(personRoute);
// app.use(customerRoute);
app.use;

// express.static enables to serve static content via express
// tells express to use a specific static file handler
//relative to the root of the project
app.use(express.static("public"));

// Handler for 404 - Resource Not Found
app.use((req, res, next) => {
    res.status(404).send("We think you are lost!");
});

// handler for error 500
app.use((err, req, res, next) => {
    console.error(err);
    // dirname is the directory of the current file
    res.sendFile(path.join(__dirname, "../public/500.html"));
});

// process env PORT in case we deploy
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.info("server listening on port " + PORT);
});
