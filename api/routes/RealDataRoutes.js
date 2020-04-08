import {
	realDataChecker
} from '../middleware';

import {
	RealDataController
} from '../controllers'

module.exports = function (app) {
	app.get('/real', realDataChecker, RealDataController.getGroups)
	app.get('/real/:group', realDataChecker, RealDataController.getData)
	
	app.post('/real', realDataChecker, RealDataController.postGroup)
	app.post('/real/:group', realDataChecker, RealDataController.postData)

	app.put('/real/:group', realDataChecker, RealDataController.updateGroup)
	app.put('/real/:group/:id', realDataChecker, RealDataController.updateData)

	app.delete('/real/:group', realDataChecker, RealDataController.deleteGroup)
	app.delete('/real/:group/:id', realDataChecker, RealDataController.deleteData)
}