require('dotenv').config()
const { Pool } = require('pg');
console.log(process.env.DB_PASSWORD)
const bcrypt = require('bcrypt');
const saltRounds = 5;

const pool = new Pool({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
});


const getUsers = async () => {
	try {
		return await new Promise(function (resolve, reject) {
			pool.query("SELECT * FROM users", (error, results) => {
				if (error) {
					reject(error);
				}
				if (results && results.rows) {
					resolve(results.rows);
				} else {
					reject(new Error("No results found"));
				}
			});
		});
	} catch (error_1) {
		console.error(error_1);
		throw new Error("Internal server error");
	}
};

const createUser = (body) => {
	return new Promise(function (resolve, reject) {
		const { name, email, password } = body;
		bcrypt.hash(password, saltRounds, function (err, hash) {
			console.log(name);
			pool.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *", [name, email, hash],
				(error, results) => {
					if (error) {
						reject(error);
					}
					if (results && results.rows) {
						resolve(
							`A new user has been added: ${JSON.stringify(results.rows[0])}`
						);
					} else {
						reject(new Error("No results found"));
					}
				}
			);
		})
	});
};

const loginUser = (body) => {
	return new Promise(function (resolve, reject) {
		const { email, password } = body;
		pool.query("SELECT password_hash FROM users WHERE email=($1)", [email], 
			(error, results) => {
				if (error) {
					reject(error);
				}
				if (!results.rows.length) {
					return reject(new Error("User not found"));
				}
				if (results && results.rows) {
					bcrypt.compare(password, results.rows[0].password_hash, function (err, match) {
						if (err) {
							return reject(err);
						}
						if (match) {
							resolve({ success: true, message: "Login successful" })
						} else {
							reject(new Error("Invalid credentials"));
						}
					})
				}

			}
		);
	})
}

module.exports = { getUsers, createUser, loginUser };