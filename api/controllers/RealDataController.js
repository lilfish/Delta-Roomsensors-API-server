import {
	RealData,
	RealGroup
} from '../db/models'
// GET 
exports.getGroups = async function (req, res) {
	RealGroup.find({}).then(function (groups) {
		res.send(groups);
	})
}
exports.getData = async function (req, res) {
	var groupName = req.params.group;

	RealGroup.findOne({
		groupName: groupName
	}).populate({
		path: 'data',
		model: 'RealData'
	}).exec(function (err, group) {
		console.log(group);
		res.send(group);
	})
}
// POST
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
	RealGroup.create({
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

	RealGroup.findOne({
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
						let newData = new RealData({
							group: group._id,
							value: parseInt(element)
						});
						validData.push(newData);
					});
					break;
				case "String":
					groupData.forEach(element => {
						let newData = new RealData({
							group: group._id,
							value: element.toString()
						});
						validData.push(newData);
					});
					break;
				case "Boolean":
					groupData.forEach(element => {
						let newData = new RealData({
							group: group._id,
							value: new Boolean(element).toString()
						});
						validData.push(newData);
					});
					break;
				case "Float":
					groupData.forEach(element => {
						let newData = new RealData({
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
		RealData.insertMany(validData).then((data) => {
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
// PUT
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
	RealGroup.findOne({
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
	let group = await RealGroup.findOne({
		groupName: groupName
	});
	let data_object = await RealData.findOne({
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
// DELETE
exports.deleteGroup = async function (req, res) {
	var groupName = req.params.group;
	if (!groupName) {
		res.status(400).send("group cannot be NULL")
		return
	}
	var group = await RealGroup.findOne({
		groupName: groupName
	});
	if (!group) {
		res.status(400).send("Group not found")
		return
	}
	RealGroup.deleteOne({
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

	let group = await RealGroup.findOne({
		groupName: groupName
	});
	let data_object = await RealData.findOne({
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

	RealData.deleteOne({
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