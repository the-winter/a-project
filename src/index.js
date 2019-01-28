const express = require('express');
const app = express();

let personRoute = require('./routes/person');
let customerRoute = require('./routes/customer');

let path = require('path');

// gives us access to req.body. w/o this we'd have to look at the raw data
let bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

// taking in any incoming json string and creating an attribute called body.

app.use((req, res, next) => {
	console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
	next();
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(expressLayouts);
app.use(personRoute);
app.use(customerRoute);

// express.static enables to serve static content via express
// tells express to use a specific static file handler
//relative to the root of the project
app.use(express.static('views'));
app.use(express.static('public'));

// Handler for 404 - Resource Not Found
app.use((req, res, next) => {
	res.status(404).send('We think you are lost!');
});

// handler for error 500
app.use((err, req, res, next) => {
	console.error(err);
	// dirname is the directory of the current file
	res.sendFile(path.join(__dirname, '../public/500.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.info('server listening on port ' + PORT);
});
