const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const path = require('path');

mongoose.connect(process.env.DB_URL,{});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  // res.send("Hello World!");
})
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
})