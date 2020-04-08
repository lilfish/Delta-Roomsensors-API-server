const mongoose = require('mongoose');

import RealData from './real_data'

const RealGroupSchema = mongoose.Schema({
	groupName: {
		type: String,
		unique: true,
		required: [true, "groupName can't be blank"],
		index: true
	},
	data: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'RealData'
	}],
	valueType: {
		type: String,
		default: "Number",
		enum: ['Number', 'String', 'Boolean', 'Float'],
	}
}, {
	timestamps: true
});

RealGroupSchema.pre('deleteOne', async function (next) {
	var deleted = await RealData.deleteMany({
		group: this.getQuery()._id
	})
	console.log("deleted data rows: ", deleted);
	next();
});

module.exports = mongoose.model('RealGroup', RealGroupSchema);