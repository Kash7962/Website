const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
// const session = require('express-session');
// const flash = require('connect-flash');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();

const Academic = require('./routes/academicRoutes.js');
const WhoWeAre = require('./routes/whoWeAreRoutes.js');
const StudentRoutes = require('./routes/studentRoutes.js');
const StaffRoutes = require('./routes/staffRoutes.js');
const AuthRoutes = require('./routes/authRoute.js');
const StaffManageRoutes = require('./routes/staffManageRoutes.js');
const LeaveRoutes = require('./routes/leaveRoutes.js');
const AdminRoutes = require('./routes/adminRoutes.js');
const cron = require('node-cron');
// const { deleteExpiredLeaves } = require('./Controllers/LeaveController');
const NoticeRoutes = require('./routes/noticeRoutes.js');
const PaymentRoutes = require('./routes/paymentRoutes.js');
const ResultRoutes = require('./routes/resultRoutes.js');
const FaceRoutes = require('./routes/faceRoutes.js');
const calendarRoutes = require('./routes/calendarRoutes.js');
const LessonPlanRoutes = require('./routes/lessonPlanRoutes.js');
const ProcurementRoutes = require('./routes/procurementRoutes.js');
const InventoryRoutes = require('./routes/InventoryRoutes.js');
const BudgetRoutes = require('./routes/budgetRoutes.js');
const InventoryRecordRoutes = require('./routes/inventoryRecordRoutes.js');
const AssetRoutes = require('./routes/assetsRoutes.js');

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
         "data:",
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
  res.render('Home/Home'), { title: 'Home' };
});

app.get('/mis', (req, res) => {
  res.render('Home/Mis_homepage', { title: 'MIS Home' });
});

app.use('/academic', Academic);
app.use('/whoweare', WhoWeAre);
app.use('/student', StudentRoutes);
app.use('/staff', StaffRoutes);
app.use('/auth', AuthRoutes);
app.use('/manage', StaffManageRoutes);
app.use('/leaves', LeaveRoutes);
app.use('/admin', AdminRoutes);
app.use('/notices', NoticeRoutes);
app.use('/payment', PaymentRoutes);
app.use('/result', ResultRoutes);
app.use('/face', FaceRoutes);
app.use('/calendar', calendarRoutes);
app.use('/curriculum', LessonPlanRoutes);
app.use('/procurement', ProcurementRoutes);
app.use('/inventory', InventoryRoutes);
app.use('/budget', BudgetRoutes);
app.use('/inventoryrecords', InventoryRecordRoutes);
app.use('/assets', AssetRoutes);
// cron.schedule('0 0 * * *', async () => {
//   await deleteExpiredLeaves(); // Runs daily at midnight
// });
// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});


