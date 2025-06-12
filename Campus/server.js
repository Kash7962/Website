const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const path = require('path');

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
app.get('/Academic/Achievements', (req, res) => {
  res.render('Academic/Achievements');
});
app.get('/Academic/CampusLife', (req, res) => {
  res.render('Academic/CampusLife');
});
app.get('/Academic/Convocation', (req, res) => {
  res.render('Academic/Convocation');
});
app.get('/Academic/Courses', (req, res) => {
  res.render('Academic/Courses');
});
app.get('/Academic/Examination', (req, res) => {
  res.render('Academic/Examination');
});
app.get('/Academic/FACILITIES', (req, res) => {
  res.render('Academic/FACILITIES');
});



app.get('/WhoWeAre/AboutKASH-LOGO', (req, res) => {
  res.render('WhoWeAre/AboutKASH-LOGO');
});
app.get('/WhoWeAre/AboutSOLID_KASH', (req, res) => {
  res.render('WhoWeAre/AboutSOLID_KASH');
});
app.get('/WhoWeAre/Aboutus1', (req, res) => {
  res.render('WhoWeAre/Aboutus1');
});
app.get('/WhoWeAre/Faculty', (req, res) => {
  res.render('WhoWeAre/Faculty');
});
app.get('/WhoWeAre/Government', (req, res) => {
  res.render('WhoWeAre/Government');
});
app.get('/WhoWeAre/KASHEXECUTIVE', (req, res) => {
  res.render('WhoWeAre/KASHEXECUTIVE');
});
app.get('/WhoWeAre/PrincipalsDesk', (req, res) => {
  res.render('WhoWeAre/PrincipalsDesk');
});
app.get('/WhoWeAre/Vision&Mission', (req, res) => {
  res.render('WhoWeAre/Vision&Mission');
});
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
})