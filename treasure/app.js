var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./public/database/db');

var indexRouter = require('./routes/index');
var trailRouter = require('./routes/trail');
var playerRouter = require('./routes/player');

const cors = require('cors');
const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Dynamic CORS setup (Supports Localhost & all Vercel Previews)
const allowedOrigins = [
  'http://localhost:3001',
  'https://treasure-hunt-six-olive.vercel.app', // Current deployment
  'https://treasure-hunt-ha23jyaut-ajayram-rjs-projects.vercel.app' // Legacy
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  req.io = app.get('io'); // ✅ Get the io instance set in www.js
  next();
});


app.use('/', indexRouter);
app.use('/trail', trailRouter);
app.use('/player', playerRouter);
app.use("/uploads", express.static("uploads"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Export the app for use in www.js
module.exports = app;
