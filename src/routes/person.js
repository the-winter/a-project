let express = require('express');
let router = express.Router();

router.get('/person', (req, res) => {
	// e.g. http://localhost:3000/person?name=%22Helen%22
	if (req.query.name) {
		res.send(`you have requested a person ${req.query.name}`);
	} else {
		res.render('test');
	}
});

// Params property on the request object
// localhost:3000/person/thomas
router.get('/person/:name', (req, res) => {
	res.send(`you have requested a person ${req.params.name}`);
});

router.get('/error', (req, res) => {
	throw new Error('this is a forced error');
});

module.exports = router;
