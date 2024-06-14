const express = require('express');
const http = require('http');
const cors = require('cors');
const API = require('./api/index.js');

const DB_CONNECT = require('./config/dbConnect.js');

require('dotenv').config();

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

new DB_CONNECT();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => res.json({ message: 'Welcome to the Fate API' }));

new API(app).registerGroups();



server.listen(PORT, () => console.log(`Server port ${PORT}`));

