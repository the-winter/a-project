let CustomerModel = require('../models/customer.model');
let express = require('express');
let router = express.Router();

//create a new cust
// post method  POST localhost:3000/customer
// pass the cust creation data into the req body as json object
// need bodyparser package to do above
// bp looks at the incoming request. if the content-type of that req is application/json, that means the data in the body is
// a json string. in this case bodyparser will take that string  and convert it to json and create a property in the req
// object called 'body' and set the value there.
router.post('/customer', (req, res) => {
	if (!req.body) {
		// means bad request
		// http status package in real world project
		res.status(400).send('Request body is missing');
	}

	let model = new CustomerModel(req.body);

	//communicates from mongoose to the mongo driver , which will talk to mongo db telling it to take the req.body
	//object, validate it via the customermodel and save it to the db
	model
		.save()
		.then(doc => {
			// if unable to save document or no document
			if (!doc || doc.length === 0) {
				return res.status(500).send(doc);
			}

			// 201 resource was created
			res.status(201).send(doc);
		})
		.catch(err => {
			//re these status codes and responses, its up to you how you want to respond inur project
			res.status(500).json(err);
		});

	router.get('/customer', (req, res) => {
		if (!req.query.email) {
			return res.status(400).send('Missing URL parameter email');
		}

		CustomerModel.findOne({
			email: req.query.email,
		})
			.then(doc => {
				res.json(doc);
			})
			.catch(err => {
				res.status(500).json(err);
			});
	});
});

module.exports = router;
