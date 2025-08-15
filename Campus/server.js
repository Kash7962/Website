const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
// const session = require('express-session');
// const flash = require('connect-flash');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();

const Academic = require('./Routes/AcademicRoutes.js');
const WhoWeAre = require('./Routes/WhoWeAreRoutes.js');
const StudentRoutes = require('./Routes/StudentRoutes.js');
const StaffRoutes = require('./Routes/StaffRoutes.js');
const AuthRoutes = require('./Routes/AuthRoute.js');
const StaffManageRoutes = require('./Routes/StaffManageRoutes.js');
// const LeaveRoutes = require('./Routes/LeaveRoutes.js');
const AdminRoutes = require('./Routes/AdminRoutes.js');
const cron = require('node-cron');
// const { deleteExpiredLeaves } = require('./Controllers/LeaveController');
const NoticeRoutes = require('./Routes/NoticeRoutes.js');
const PaymentRoutes = require('./Routes/PaymentRoutes.js');
const ResultRoutes = require('./Routes/ResultRoutes.js');
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
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://maps.googleapis.com",
        "https://cdn.jsdelivr.net" // ✅ Added for Bootstrap JS
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://unpkg.com",
        "https://accounts.google.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net" // ✅ Added for Bootstrap CSS
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com"
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https://maps.gstatic.com",
        "https://www.google.com",
        "https://via.placeholder.com",
        "https://www.gstatic.com",
        "https://upload.wikimedia.org",
        "https://images.pexels.com"
      ],

      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://www.google.com/maps",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com"
      ],

      connectSrc: [
        "'self'",
        "https://unpkg.com",
        "https://api.ipify.org",
        "https://accounts.google.com",
        "https://clientservices.googleapis.com",
        "https://oauth2.googleapis.com",
        "https://people.googleapis.com",
        "https://maps.googleapis.com"
      ],

      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);






// Additional Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } // Set true if using HTTPS
// }));

app.use(cookieParser());
// Routes
app.get('/', (req, res) => {
  res.render('Home/Home');
});

app.use('/Academic', Academic);
app.use('/WhoWeAre', WhoWeAre);
app.use('/Student', StudentRoutes);
app.use('/Staff', StaffRoutes);
app.use('/Auth', AuthRoutes);
app.use('/Manage', StaffManageRoutes);
// app.use('/Staff/Leave', LeaveRoutes);
app.use('/Admin', AdminRoutes);
app.use('/Notices', NoticeRoutes);
app.use('/Payment', PaymentRoutes);
app.use('/Result', ResultRoutes);
// cron.schedule('0 0 * * *', async () => {
//   await deleteExpiredLeaves(); // Runs daily at midnight
// });
// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});


