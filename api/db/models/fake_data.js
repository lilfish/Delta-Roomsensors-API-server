const mongoose = require('mongoose');

const FakeDataSchema = mongoose.Schema({
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FakeGroup'
	},
	value: {
		type: String
	},
}, {
	timestamps: {
		createdAt: 'created_at',
		overwriteable: true
	}
});

module.exports = mongoose.model('FakeData', FakeDataSchema);