const mongoose = require('mongoose');

const RealDataSchema = mongoose.Schema({
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'RealGroup'
	},
	value: {
		type: String
	},
}, {
	timestamps: true
});

module.exports = mongoose.model('RealData', RealDataSchema);