import {
	fakeDataChecker
} from '../middleware';

import {
	FakeDataController
} from '../controllers'

module.exports = function (app) {
	app.post('/fake/generateInt', fakeDataChecker, FakeDataController.generateInt)
	app.post('/fake/generateString', fakeDataChecker, FakeDataController.generateString)
	app.post('/fake/generateBoolean', fakeDataChecker, FakeDataController.generateBoolean)
	app.post('/fake/generateFloat', fakeDataChecker, FakeDataController.generateFloat)


	app.get('/fake', fakeDataChecker, FakeDataController.getGroups)
	app.get('/fake/:group', fakeDataChecker, FakeDataController.getData)

	app.post('/fake', fakeDataChecker, FakeDataController.postGroup)
	app.post('/fake/:group', fakeDataChecker, FakeDataController.postData)

	app.put('/fake/:group', fakeDataChecker, FakeDataController.updateGroup)
	app.put('/fake/:group/:id', fakeDataChecker, FakeDataController.updateData)

	app.delete('/fake/:group', fakeDataChecker, FakeDataController.deleteGroup)
	app.delete('/fake/:group/:id', fakeDataChecker, FakeDataController.deleteData)

}