const express = require("express");

const app = express();
const user_model = require('./model/userModel');
app.use(express.json());

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Test" });
});

// get all users
app.get('/users', (req, res) => {
	user_model.getUsers()
	.then(response => {
	  res.status(200).send(response);
	})
	.catch(error => {
	  res.status(500).send(error);
	})
})

//create a new user
app.post('/users', (req, res) => {
	console.log(req.body);
	user_model.createUser(req.body)
	.then(response => {
	  res.status(200).send(response);
	})
	.catch(error => {
	  res.status(500).send(error);
	})
})

//authenticate and login a user
app.post('/login', (req, res) => {
	user_model.loginUser(req.body)
	.then(response => {
		res.status(200).send(response);
	})
	.catch(error => {
		res.status(500).send(error);
	})
})

// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



