const mongoose = require('mongoose');

import FakeData from './fake_data'

const FakeGroupSchema = mongoose.Schema({
	groupName: {
		type: String,
		unique: true,
		required: [true, "groupName can't be blank"],
		index: true
	},
	data: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FakeData'
	}],
	valueType: {
		type: String,
		default: "Number",
		enum: ['Number', 'String', 'Boolean', 'Float'],
	}
}, {
	timestamps: {
		createdAt: 'created_at',
		overwriteable: true
	}
});

FakeGroupSchema.pre('deleteOne', async function (next) {
	var deleted = await FakeData.deleteMany({
		group: this.getQuery()._id
	})
	console.log("deleted data rows: ", deleted);
	next();
});

module.exports = mongoose.model('FakeGroup', FakeGroupSchema);