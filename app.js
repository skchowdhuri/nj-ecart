var express=require('express');
var path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const session=require('express-session');
var expressValidator = require('express-validator');
var fileUpload=require('express-fileupload');


//require for custom file
const config=require('./config/database');

//Connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected mongoose')
});

//Init app
var app=express();

//View Engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Local Errors variable
app.locals.errors=null;

//Body Parser Middleware

//** parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
//** parse application/json
app.use(bodyParser.json())

//Express fileUpload middleware
app.use(fileUpload());

//Express Session middleear

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}));

//Express Validator
app.use(expressValidator({
  customValidators: {
    isImage: (value, filename)=>{
                var extension= (path.extname(filename)).toLowerCase();
                switch (extension){
                  case '.jpg':
                    return '.jpg';
                  case '.jpeg':
                    return '.jpeg';
                  case '.png':
                    return '.png';
                  default:
                    return false;
                }
              }
  }
}));


//Express messages middlewear
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Set path
const pages=require('./routes/pages');
const adminPages=require('./routes/admin_pages');
const adminCategories=require('./routes/admin_categories');
const adminProducts=require('./routes/admin_products');

app.use('/', pages);
app.use('/admin/pages/', adminPages);
app.use('/admin/categories/', adminCategories);
app.use('/admin/products/', adminProducts);



//Start the server
var port=3000;
app.listen(port,()=>{
    console.log('Server started at  '+ port);
});