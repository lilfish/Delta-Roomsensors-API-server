require('dotenv').config()

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

var debug = process.env.DEBUG_MODE == "true";
var connection_string;
if (debug) {
	connection_string = process.env.MONGO_CONNECTION_STRING_DEBUG;
} else {
	connection_string = process.env.MONGO_CONNECTION_STRING_PROD;
}

mongoose.connect(connection_string, {
		useUnifiedTopology: true,
		useNewUrlParser: true
	})
	.then(() => console.log('DB Connected!'))
	.catch(err => {
		console.log("Couldn't connect to DB");
	});