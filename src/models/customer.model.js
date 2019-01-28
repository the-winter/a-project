let mongoose = require('mongoose');
let database = require('../../.secrets/database');
// connect to db - normally this would be in a separate file
const uri = database.databaseStr;

mongoose.connect(
	uri,
	{ useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);

var db = mongoose.connection;

let CustomerSchema = new mongoose.Schema({
	name: String,
	email: {
		type: String,
		required: true,
		unique: true,
	},
});

module.exports = mongoose.model('Customer', CustomerSchema);
