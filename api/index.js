require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT;
const bodyParser = require('body-parser');
var cors = require('cors')

app.use(cors({
	credentials: true,
	origin: true
}))

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())

require('./db');

app.get('/', function (req, res) {
	let data = {
		"Get real data": {
			"GET ALL": "To get all real data groups use GET /real",
			"GET GROUP DATA": "To get real data of one group use GET /real/:id",
			"INSERT IN GROUP": "To insert real data in one group use INSERT /real/:group",
			"UPDATE DATA IN GROUP": "To update real data use PUT /real/:group/:dataid",
			"DELETE DATA IN GROUP": "To delete real data use DELETE /real/:group/:id"
		},
		"Get fake data": {
			"GET ALL": "To get all fake data groups use GET /fake",
			"GET GROUP DATA": "To get fake data of one group use GET /fake/:id",
			"INSERT IN GROUP": "To insert fake data in one group use INSERT /fake/:group",
			"UPDATE DATA IN GROUP": "To update fake data use PUT /fake/:group/:dataid",
			"DELETE DATA IN GROUP": "To delete fake data use DELETE /fake/:group/:id"
		},
		"Generate fake data": {
			generateInt: {
				url: "POST: URL + /fake/generateInt",
				params: {
					createGroup: "True/False (defaultt: false)",
					groupName: "String  (default: null)",
					minVal: "Number (default: 0)",
					maxVal: "Number (default: 0)",
					beginDate: "Date (default: new Date)",
					endDate: "Date (default: new Date)",
					beginTime: "String (default: 0:0)",
					endTime: "String (default: 23:59)",
					recordCount: "Number (default: 200)",
				}
			},
			generateString: {
				url: "POST: URL + /fake/generateString",
				params: {
					createGroup: "True/False (defaultt: false)",
					groupName: "String  (default: null)",
					words: "Array (default: ['Random', 'String', 'Cool', 'Nice'])",
					beginDate: "Date (default: new Date)",
					endDate: "Date (default: new Date)",
					beginTime: "String (default: 0:0)",
					endTime: "String (default: 23:59)",
					recordCount: "Number (default: 200)",
				}
			},
			generateBoolean: {
				url: "POST: URL + /fake/generateBoolean",
				params: {
					createGroup: "True/False (defaultt: false)",
					groupName: "String  (default: null)",
					beginDate: "Date (default: new Date)",
					endDate: "Date (default: new Date)",
					beginTime: "String (default: 0:0)",
					endTime: "String (default: 23:59)",
					recordCount: "Number (default: 200)",
				}
			},
			generateFloat: {
				url: "POST: URL + /fake/generateFloat",
				params: {
					createGroup: "True/False (defaultt: false)",
					groupName: "String  (default: null)",
					minVal: "Number (default: 0)",
					maxVal: "Number (default: 0)",
					decimals: "Number (default: 2)",
					beginDate: "Date (default: new Date)",
					endDate: "Date (default: new Date)",
					beginTime: "String (default: 0:0)",
					endTime: "String (default: 23:59)",
					recordCount: "Number (default: 200)",
				}
			}
		}
	}
	res.send(data)
})

// admin routes
require('./routes/RealDataRoutes')(app);
// user api routes
require('./routes/FakeDataRoutes')(app);

app.listen(port, () => console.log(`Admin panel listening on port ${port}!`))