let express = require("express");
let router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");

// file uploading
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const crypto = require("crypto");

let mongoose = require("mongoose");
const db = require("../../config/conenction");
let database = require("../../.secrets/database");
const uri = database.databaseStr;

// init gfs

let gfs;

db.once("open", function() {
    // init stream
    gfs = Grid(db.db, mongoose.mongo);
    gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
    url: uri,
    options: {
        useNewUrlParser: true
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename =
                    buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads" // bucketname should match collection name in gfs.collection()
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/gallery", (req, res) => {
    res.render("gallery");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files
        if (!files || files.length === 0) {
            res.render("dashboard", { name: req.user.name, files: false });
        } else {
            res.render("dashboard", { name: req.user.name, files: files });
        }
    });
});

// file stuff

// upload file
router.post("/upload", upload.single("file"), (req, res) => {
    // res.json({ file: req.file });
    res.redirect("/dashboard");
});

// get all files
router.get("/files", (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "No files exist"
            });
        }

        //files exist
        return res.json(files);
    });
});

// get a single file
router.get("/files/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "No file exists"
            });
        }
        // file exists
        return res.json(file);
    });
});

//delete file
router.delete("/files/:id", (req, res) => {
    gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
        console.log(req.params.id);
        if (err) {
            console.log("err: ", err);
            return res.status(404).json({ err: err });
        }
        console.log("hello");
        res.redirect("/dashboard");
    });
});
// @route GET /download/:filename
// @desc  Download single file object
// app.get('/download/:filename', (req, res) => {
//     gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//       // Check if file
//       if (!file || file.length === 0) {
//         return res.status(404).json({
//           err: 'No file exists'
//         });
//       }
//       // File exists
//       res.set('Content-Type', file.contentType);
//       res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
//       // streaming from gridfs
//       var readstream = gfs.createReadStream({
//         filename: req.params.filename
//       });
//       //error handling, e.g. file does not exist
//       readstream.on('error', function (err) {
//         console.log('An error occurred!', err);
//         throw err;
//       });
//       readstream.pipe(res);
//     });
//   });

module.exports = router;
