let mongoose = require('mongoose');

let CustomerSchema = new mongoose.Schema({
	name: String,
	email: {
		type: String,
		required: true,
		unique: true,
	},
});

module.exports = mongoose.model('Customer', CustomerSchema);
