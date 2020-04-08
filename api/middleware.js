require('dotenv').config()
var debug = process.env.DEBUG_MODE == "true";

exports.realDataChecker = (req, res, next) => {
	if (debug)
		console.log(req.body)
	next();
};

exports.fakeDataChecker = (req, res, next) => {
	if (debug)
		console.log(req.body)
	next();
};