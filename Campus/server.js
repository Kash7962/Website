const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

const Academic = require('./Routes/AcademicRoutes.js');
const WhoWeAre = require('./Routes/WhoWeAreRoutes.js');
const Form = require('./Routes/AdmissionFormRoutes.js');
const UserRoutes = require('./Routes/UserRoutes.js');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helmet configuration for strict protection

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://maps.gstatic.com",
        "https://www.google.com",
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.google.com/maps",
      ],
      connectSrc: ["'self'", "https://unpkg.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);




// Additional Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('Home/Home');
});

app.use('/Academic', Academic);
app.use('/WhoWeAre', WhoWeAre);
app.use('/Form', Form);
app.use('/User', UserRoutes);
// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
