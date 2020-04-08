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
			"INSERT IN GROUP":"To insert real data in one group use INSERT /real/:group",
			"UPDATE DATA IN GROUP":"To update real data use PUT /real/:group/:dataid",
			"DELETE DATA IN GROUP": "To delete real data use DELETE /real/:group/:id"
		},
		"Get fake data": {
			"GET ALL": "To get all fake data groups use GET /fake",
			"GET GROUP DATA": "To get fake data of one group use GET /fake/:id",
			"INSERT IN GROUP":"To insert fake data in one group use INSERT /fake/:group",
			"UPDATE DATA IN GROUP":"To update fake data use PUT /fake/:group/:dataid",
			"DELETE DATA IN GROUP": "To delete fake data use DELETE /fake/:group/:id"
		},
	}
	res.send(data)
})

// admin routes
require('./routes/RealDataRoutes')(app);
// user api routes
require('./routes/FakeDataRoutes')(app);

app.listen(port, () => console.log(`Admin panel listening on port ${port}!`))