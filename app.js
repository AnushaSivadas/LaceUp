var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mongoose = require('mongoose')
const session = require('express-session')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override')
const flash = require('connect-flash')
var easyinvoice = require('easyinvoice')
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

mongoose.connect('mongodb://localhost:27017/Bootie')
.then(()=>{
  console.log('CONNECTION OPEN')
})
.catch((err)=>{
  console.log('CONNECTION ERROR')
  console.log(err)
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'secretkey',
  resave:false,
  saveUninitialized:false
}))
app.use(flash())

app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next()
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
