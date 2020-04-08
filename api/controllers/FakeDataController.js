import {
	FakeData,
	FakeGroup
} from '../db/models'

var moment = require('moment');
const momentRandom = require('moment-random');

moment().format();
//GET
exports.getGroups = async function (req, res) {
	FakeGroup.find({}).then(function (groups) {
		res.send(groups);
	})
}
exports.getData = async function (req, res) {
	var groupName = req.params.group;

	FakeGroup.findOne({
		groupName: groupName
	}).populate({
		path: 'data',
		model: 'FakeData'
	}).exec(function (err, group) {
		console.log(group);
		res.send(group);
	})
}
//POST
exports.postGroup = async function (req, res) {
	var groupName = req.body.group;
	var valueType = req.body.valueType;
	if (!groupName) {
		res.status(400).send("group cannot be null")
		return
	}
	if (!valueType) {
		res.status(400).send("valueType cannot be null")
		return
	}
	FakeGroup.create({
		groupName: groupName.toString(),
		valueType: valueType.toString()
	}).then((group) => {
		var status = {
			status: "Created group " + group.groupName,
			group: group
		}
		res.send(status)
	}).catch((error) => {
		var status = {
			status: "Error while making group " + groupName,
			error: error
		}
		res.send(status)
	})
}
exports.postData = async function (req, res) {
	var groupName = req.params.group;
	var groupData;

	if (!groupName) {
		res.status(400).send("group cannot be null")
		return
	}
	try {
		groupData = Array.from(JSON.parse(req.body.data));
	} catch (error) {
		var status = {
			status: "Couldn't cast data to array",
			error: error
		}
		res.status(400).send(status)
		return
	}
	if (!groupData) {
		res.status(400).send("data cannot be null")
		return
	}

	FakeGroup.findOne({
		groupName: groupName
	}).then((group) => {
		if (!group) {
			res.status(400).send("Couldn't find group")
			return
		}
		// Get valid data
		var validData = [];
		var errorStatus = null;
		try {
			switch (group.valueType) {
				case "Number":
					groupData.forEach(element => {
						let newData = new FakeData({
							group: group._id,
							value: parseInt(element)
						});
						validData.push(newData);
					});
					break;
				case "String":
					groupData.forEach(element => {
						let newData = new FakeData({
							group: group._id,
							value: element.toString()
						});
						validData.push(newData);
					});
					break;
				case "Boolean":
					groupData.forEach(element => {
						let newData = new FakeData({
							group: group._id,
							value: new Boolean(element).toString()
						});
						validData.push(newData);
					});
					break;
				case "Float":
					groupData.forEach(element => {
						let newData = new FakeData({
							group: group._id,
							value: parseFloat(element)
						});
						validData.push(newData);
					});
					break;
				default:
					throw "Couldn't validate data to " + group.valueType
			}
		} catch (error) {
			errorStatus = {
				status: "Couldn't validate data.",
				error: error
			}
		}
		if (errorStatus) {
			res.status(400).send(errorStatus);
			return
		}
		FakeData.insertMany(validData).then((data) => {
			var ids = data.map(data => {
				return data._id
			});
			ids.forEach(element => {
				group.data.push(element);
			});
			group.save();
			res.status(200).send({
				savedIds: ids
			})
		}).catch((error) => {
			var status = {
				status: "Couldn't save data to database",
				error: error
			}
			res.status(400).send(status)
		});
	})


}
//PUT
exports.updateGroup = async function (req, res) {
	var groupName = req.params.group;
	if (!groupName) {
		res.status(400).send("group cannot be null")
		return
	}
	if (!req.body.groupName && !req.body.valueType) {
		res.status(400).send("Need some update variables [groupName, valueType]")
		return
	}
	FakeGroup.findOne({
		groupName: groupName
	}).then(function (group) {
		if (!group) {
			res.status(400).send("Couldn't find group " + groupName)
			return
		}
		if (req.body.groupName)
			group.groupName = req.body.groupName;
		if (req.body.valueType)
			group.groupName = req.body.valueType;
		group.save().then(() => {
			res.status(200).send("Group " + groupName + " successfully updated")
		}).catch((error) => {
			var status = {
				status: "Couldn't update group " + groupName,
				error: error
			}
			res.status(400).send(status)
		});
	}).catch((error) => {
		var status = {
			status: "Couldn't update group " + groupName,
			error: error
		}
		res.status(400).send(status)
	})

}
exports.updateData = async function (req, res) {
	// Validate params
	var groupName = req.params.group;
	var data_id = req.params.id;
	var update_val = req.body.value;
	if (!groupName) {
		res.status(400).send("group cannot be null")
		return
	}
	if (!data_id) {
		res.status(400).send("id cannot be null")
		return
	}
	if (!update_val) {
		res.status(400).send("value cannot be null")
		return
	}
	// Get group
	let group = await FakeGroup.findOne({
		groupName: groupName
	});
	let data_object = await FakeData.findOne({
		group: group._id,
		_id: data_id
	});
	if (!group) {
		res.status(400).send("Group not found")
		return
	}
	if (!data_object) {
		res.status(400).send("Data object not found");
		return;
	}

	var validVal;
	var errorStatus = null;
	try {
		switch (group.valueType) {
			case "Number":
				console.log(update_val);
				validVal = parseInt(update_val);
				break;
			case "String":
				validVal = update_val.toString()
				break;
			case "Boolean":
				validVal = new Boolean(update_val).toString()
				break;
			case "Float":
				validVal = parseFloat(update_val)
				break;
			default:
				throw "Couldn't validate data to " + group.valueType
		}
	} catch (error) {
		errorStatus = {
			status: "Couldn't validate data.",
			error: error
		}
	}
	if (errorStatus) {
		res.status(400).send(errorStatus);
		return
	}

	console.log(validVal);
	data_object.value = validVal;

	data_object.save().then(() => {
		res.status(200).send(data_object)
	}).catch((error) => {
		var status = {
			status: "Couldn't update data object",
			error: error,
			object: data_object
		}
		res.status(400).send(status)
	});
}
//DELETE
exports.deleteGroup = async function (req, res) {
	var groupName = req.params.group;
	if (!groupName) {
		res.status(400).send("group cannot be NULL")
		return
	}
	var group = await FakeGroup.findOne({
		groupName: groupName
	});
	if (!group) {
		res.status(400).send("Group not found")
		return
	}
	FakeGroup.deleteOne({
		_id: group._id
	}).then(() => {
		res.status(200).send({
			removedGroup: group
		})
	}).catch((error) => {
		console.log(error)
		var status = {
			status: "Couldn't delete group",
			error: error,
		}
		res.status(400).send(status)
	})
}
exports.deleteData = async function (req, res) {
	var groupName = req.params.group;
	var data_id = req.params.id;
	if (!groupName) {
		res.status(400).send("group cannot be NULL")
		return
	}
	if (!data_id) {
		res.status(400).send("id cannot be NULL");
		return;
	}

	let group = await FakeGroup.findOne({
		groupName: groupName
	});
	let data_object = await FakeData.findOne({
		group: group._id,
		_id: data_id
	});
	if (!group) {
		res.status(400).send("Group not found")
		return
	}
	if (!data_object) {
		res.status(400).send("Data object not found");
		return;
	}

	FakeData.deleteOne({
		_id: data_object._id
	}).then(() => {
		res.status(200).send({
			removedData: data_object
		})
	}).catch((error) => {
		var status = {
			status: "Couldn't delete data object",
			error: error,
		}
		res.status(400).send(status)
	})
}

exports.generateInt = async function (req, res) {
	var params = {
		createGroup: req.body.createGroup ? req.body.createGroup : false,
		groupName: req.body.groupName ? req.body.groupName : null,
		minVal: req.body.minVal ? req.body.minVal : 0,
		maxVal: req.body.maxVal ? req.body.maxVal : 100,
		beginDate: req.body.beginDate ? req.body.beginDate : new Date,
		endDate: req.body.endDate ? req.body.endDate : new Date,
		beginTime: req.body.beginTime ? req.body.beginTime : "0:0",
		endTime: req.body.endTime ? req.body.endTime : "23:59",
		beginHour: null,
		endHour: null,
		beginMinute: null,
		endMinute: null,
		recordCount: req.body.recordCount ? req.body.recordCount : 200,
		created_at: null,
	}
	// validate
	try {
		if (!params.beginTime.split(":"))
			throw "Couldnt split begintime (should be in xx:yy format)"
		if (!params.endTime.split(":"))
			throw "Couldnt split endtime (should be in xx:yy format)"
		if (!new Date(params.beginDate))
			throw "Couldn't cast beginDate to date (should be in yyyy-m-d format)"
		if (!new Date(params.endDate))
			throw "Couldn't cast endDate to date (should be in yyyy-m-d format)"
		// params.minVal = parseInt(params.minVal);
		params.maxVal = parseInt(params.maxVal);
		params.minVal = parseInt(params.minVal);
		params.recordCount = parseInt(params.recordCount);
		params.endHour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
		params.endMinute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);

		// params.endHour = parseInt(params.endTime.split(":")[0])
		// params.endMinute = parseInt(params.endTime.split(":")[1])

	} catch (error) {
		var status = {
			status: "Couldn't cast data to int",
			error: error
		}
		res.status(400).send(status)
		return
	}
	if (!params.groupName) {
		res.status(400).send("groupName cannot be NULL")
		return
	}
	var group;
	group = await FakeGroup.findOne({
		groupName: params.groupName
	})
	if (group && group.valueType != "Number") {
		res.status(400).send("Group value should be " + group.valueType)
		return
	}
	if (params.createGroup == true || params.createGroup == "true") {
		if (!group) {
			group = await FakeGroup.create({
				groupName: params.groupName.toString(),
				valueType: "Number"
			})
		}
	}
	if (!group) {
		res.status(400).send("Couldn't find or make group")
		return
	}
	var generated_data = [];
	for (let x = 0; x < params.recordCount; x++) {
		try {
			let hour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
			let minute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);
			let beginDate = moment(params.beginDate, "YYYY-MM-DD")
			let endDate = moment(params.endDate, "YYYY-MM-DD")
			let created_at = momentRandom(endDate, beginDate)
			created_at.set("hour", hour).set("minute", minute);
			let value = Math.floor(Math.random() * params.maxVal) + parseInt(params.minVal);
			let newData = new FakeData({
				group: group._id,
				value: parseFloat(value),
				created_at: created_at
			});
			generated_data.push(newData);
		} catch (error) {
			var status = {
				status: "Unexpected error",
				error: error
			}
			res.status(400).send(status)
			return
		}
	}
	FakeData.insertMany(generated_data).then((data) => {
		var ids = data.map(data => {
			return data._id
		});
		ids.forEach(element => {
			group.data.push(element);
		});
		group.save();
		res.status(200).send({
			group
		})
	}).catch((error) => {
		var status = {
			status: "Couldn't save data to database",
			error: error
		}
		res.status(400).send(status)
	});
}
exports.generateString = async function (req, res) {
	var params = {
		createGroup: req.body.createGroup ? req.body.createGroup : false,
		groupName: req.body.groupName ? req.body.groupName : null,
		words: req.body.words ? req.body.words : ["Random", "String", "Cool", "Nice"],
		beginDate: req.body.beginDate ? req.body.beginDate : new Date,
		endDate: req.body.endDate ? req.body.endDate : new Date,
		beginTime: req.body.beginTime ? req.body.beginTime : "0:0",
		endTime: req.body.endTime ? req.body.endTime : "23:59",
		beginHour: null,
		endHour: null,
		beginMinute: null,
		endMinute: null,
		recordCount: req.body.recordCount ? req.body.recordCount : 200,
		created_at: null,
	}
	// validate
	try {
		if (!params.beginTime.split(":"))
			throw "Couldnt split begintime (should be in xx:yy format)"
		if (!params.endTime.split(":"))
			throw "Couldnt split endtime (should be in xx:yy format)"
		if (!new Date(params.beginDate))
			throw "Couldn't cast beginDate to date (should be in yyyy-m-d format)"
		if (!new Date(params.endDate))
			throw "Couldn't cast endDate to date (should be in yyyy-m-d format)"
		if (!Array.isArray(params.words))
			throw ("Couldn't cast words to array (should be ['string','string'] format)");
		// params.minVal = parseInt(params.minVal);
		params.maxVal = parseInt(params.maxVal);
		params.minVal = parseInt(params.minVal);
		params.recordCount = parseInt(params.recordCount);
		params.endHour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
		params.endMinute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);

		params.words = Array.from(params.words)
		// params.endHour = parseInt(params.endTime.split(":")[0])
		// params.endMinute = parseInt(params.endTime.split(":")[1])

	} catch (error) {
		console.log(error);
		var status = {
			status: "Couldn't cast data to int",
			error: error
		}
		res.status(400).send(status)
		return
	}
	if (!params.groupName) {
		res.status(400).send("groupName cannot be NULL")
		return
	}
	var group;
	group = await FakeGroup.findOne({
		groupName: params.groupName
	})
	if (group && group.valueType != "String") {
		res.status(400).send("Group value should be " + group.valueType)
		return
	}
	if (params.createGroup == true || params.createGroup == "true") {
		if (!group) {
			group = await FakeGroup.create({
				groupName: params.groupName.toString(),
				valueType: "String"
			})
		}
	}
	if (!group) {
		res.status(400).send("Couldn't find or make group")
		return
	}
	var generated_data = [];
	for (let x = 0; x < params.recordCount; x++) {
		try {
			let hour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
			let minute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);
			let beginDate = moment(params.beginDate, "YYYY-MM-DD")
			let endDate = moment(params.endDate, "YYYY-MM-DD")
			let created_at = momentRandom(endDate, beginDate)
			created_at.set("hour", hour).set("minute", minute);
			let value = Math.floor(Math.random() * params.words.length);
			let newData = new FakeData({
				group: group._id,
				value: params.words[value].toString(),
				created_at: created_at
			});
			generated_data.push(newData);
		} catch (error) {
			var status = {
				status: "Unexpected error",
				error: error
			}
			res.status(400).send(status)
			return
		}
	}
	FakeData.insertMany(generated_data).then((data) => {
		var ids = data.map(data => {
			return data._id
		});
		ids.forEach(element => {
			group.data.push(element);
		});
		group.save();
		res.status(200).send({
			group
		})
	}).catch((error) => {
		var status = {
			status: "Couldn't save data to database",
			error: error
		}
		res.status(400).send(status)
	});
}
exports.generateBoolean = async function (req, res) {
	var params = {
		createGroup: req.body.createGroup ? req.body.createGroup : false,
		groupName: req.body.groupName ? req.body.groupName : null,
		beginDate: req.body.beginDate ? req.body.beginDate : new Date,
		endDate: req.body.endDate ? req.body.endDate : new Date,
		beginTime: req.body.beginTime ? req.body.beginTime : "0:0",
		endTime: req.body.endTime ? req.body.endTime : "23:59",
		beginHour: null,
		endHour: null,
		beginMinute: null,
		endMinute: null,
		recordCount: req.body.recordCount ? req.body.recordCount : 200,
		created_at: null,
	}
	// validate
	try {
		if (!params.beginTime.split(":"))
			throw "Couldnt split begintime (should be in xx:yy format)"
		if (!params.endTime.split(":"))
			throw "Couldnt split endtime (should be in xx:yy format)"
		if (!new Date(params.beginDate))
			throw "Couldn't cast beginDate to date (should be in yyyy-m-d format)"
		if (!new Date(params.endDate))
			throw "Couldn't cast endDate to date (should be in yyyy-m-d format)"
		params.maxVal = parseInt(params.maxVal);
		params.minVal = parseInt(params.minVal);
		params.recordCount = parseInt(params.recordCount);
		params.endHour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
		params.endMinute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);
	} catch (error) {
		console.log(error);
		var status = {
			status: "Couldn't cast data to int",
			error: error
		}
		res.status(400).send(status)
		return
	}
	if (!params.groupName) {
		res.status(400).send("groupName cannot be NULL")
		return
	}
	var group;
	group = await FakeGroup.findOne({
		groupName: params.groupName
	})
	if (group && group.valueType != "Boolean") {
		res.status(400).send("Group value should be " + group.valueType)
		return
	}
	if (params.createGroup == true || params.createGroup == "true") {
		if (!group) {
			group = await FakeGroup.create({
				groupName: params.groupName.toString(),
				valueType: "Boolean"
			})
		}
	}
	if (!group) {
		res.status(400).send("Couldn't find or make group")
		return
	}
	var generated_data = [];
	for (let x = 0; x < params.recordCount; x++) {
		try {
			let hour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
			let minute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);
			let beginDate = moment(params.beginDate, "YYYY-MM-DD")
			let endDate = moment(params.endDate, "YYYY-MM-DD")
			let created_at = momentRandom(endDate, beginDate)
			created_at.set("hour", hour).set("minute", minute);
			let value = Math.floor(Math.random() * 2);
			console.log(value);
			let newData = new FakeData({
				group: group._id,
				value: value == 0 ? true : false,
				created_at: created_at
			});
			generated_data.push(newData);
		} catch (error) {
			var status = {
				status: "Unexpected error",
				error: error
			}
			res.status(400).send(status)
			return
		}
	}
	FakeData.insertMany(generated_data).then((data) => {
		var ids = data.map(data => {
			return data._id
		});
		ids.forEach(element => {
			group.data.push(element);
		});
		group.save();
		res.status(200).send({
			group
		})
	}).catch((error) => {
		var status = {
			status: "Couldn't save data to database",
			error: error
		}
		res.status(400).send(status)
	});
}
exports.generateFloat = async function (req, res) {
	var params = {
		createGroup: req.body.createGroup ? req.body.createGroup : false,
		groupName: req.body.groupName ? req.body.groupName : null,
		minVal: req.body.minVal ? req.body.minVal : 0,
		maxVal: req.body.maxVal ? req.body.maxVal : 100,
		decimals: req.body.decimals ? req.body.decimals : 2,
		beginDate: req.body.beginDate ? req.body.beginDate : new Date,
		endDate: req.body.endDate ? req.body.endDate : new Date,
		beginTime: req.body.beginTime ? req.body.beginTime : "0:0",
		endTime: req.body.endTime ? req.body.endTime : "23:59",
		beginHour: null,
		endHour: null,
		beginMinute: null,
		endMinute: null,
		recordCount: req.body.recordCount ? req.body.recordCount : 200,
		created_at: null,
		someDecimal: null
	}
	// validate
	try {
		if (!params.beginTime.split(":"))
			throw "Couldnt split begintime (should be in xx:yy format)"
		if (!params.endTime.split(":"))
			throw "Couldnt split endtime (should be in xx:yy format)"
		if (!new Date(params.beginDate))
			throw "Couldn't cast beginDate to date (should be in yyyy-m-d format)"
		if (!new Date(params.endDate))
			throw "Couldn't cast endDate to date (should be in yyyy-m-d format)"
		// params.minVal = parseInt(params.minVal);
		params.someDecimal = "1";
		console.log("HOI");
		for (let z = 0; z < params.decimals; z++) {
			params.someDecimal = params.someDecimal + "0";
		}
		console.log(params.someDecimal );
		params.maxVal = parseInt(params.maxVal) * parseInt(params.someDecimal);
		params.minVal = parseInt(params.minVal) * parseInt(params.someDecimal);
		params.recordCount = parseInt(params.recordCount);
		params.endHour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
		params.endMinute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);

		// params.endHour = parseInt(params.endTime.split(":")[0])
		// params.endMinute = parseInt(params.endTime.split(":")[1])

	} catch (error) {
		var status = {
			status: "Couldn't cast data to int",
			error: error
		}
		res.status(400).send(status)
		return
	}
	if (!params.groupName) {
		res.status(400).send("groupName cannot be NULL")
		return
	}
	var group;
	group = await FakeGroup.findOne({
		groupName: params.groupName
	})
	if (group && group.valueType != "Number") {
		res.status(400).send("Group value should be " + group.valueType)
		return
	}
	if (params.createGroup == true || params.createGroup == "true") {
		if (!group) {
			group = await FakeGroup.create({
				groupName: params.groupName.toString(),
				valueType: "Number"
			})
		}
	}
	if (!group) {
		res.status(400).send("Couldn't find or make group")
		return
	}
	var generated_data = [];
	for (let x = 0; x < params.recordCount; x++) {
		try {
			let hour = Math.floor((Math.random() * (params.endTime.split(":")[0] - params.beginTime.split(":")[0] + 1))) + parseInt(params.beginTime.split(":")[0]);
			let minute = Math.floor((Math.random() * (params.endTime.split(":")[1] - params.beginTime.split(":")[1] + 1))) + parseInt(params.beginTime.split(":")[1]);
			let beginDate = moment(params.beginDate, "YYYY-MM-DD")
			let endDate = moment(params.endDate, "YYYY-MM-DD")
			let created_at = momentRandom(endDate, beginDate)
			created_at.set("hour", hour).set("minute", minute);

			let value = Math.floor(Math.random() * params.maxVal) + parseInt(params.minVal);
			value = value / params.someDecimal;
			let newData = new FakeData({
				group: group._id,
				value: parseFloat(value),
				created_at: created_at
			});
			generated_data.push(newData);
		} catch (error) {
			var status = {
				status: "Unexpected error",
				error: error
			}
			res.status(400).send(status)
			return
		}
	}
	FakeData.insertMany(generated_data).then((data) => {
		var ids = data.map(data => {
			return data._id
		});
		ids.forEach(element => {
			group.data.push(element);
		});
		group.save();
		res.status(200).send({
			group
		})
	}).catch((error) => {
		var status = {
			status: "Couldn't save data to database",
			error: error
		}
		res.status(400).send(status)
	});
}


function randomDate(start, end, startHour, endHour, startMinute, endMinute) {
	var date = new Date(+start + Math.random() * (end - start));

	return date;
}