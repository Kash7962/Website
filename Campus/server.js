const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const path = require('path');
const Academic = require('./Routes/AcademicRoutes.js');
const WhoWeAre = require('./Routes/WhoWeAreRoutes.js');
const Form = require('./Routes/AdmissionFormRoutes.js');

mongoose.connect(process.env.DB_URL,{});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('Home/Home');
})

app.use('/Academic',Academic);
app.use('/WhoWeAre',WhoWeAre);
app.use('/Form',Form);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
})