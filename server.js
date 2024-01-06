const express= require('express');
const app=express();
const bodyparser = require('body-parser');
const { postgres } = require('./app/config/database.js');
const indexRouter = require('./app/router/route.js')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
postgres.connect();


app.use(express.static('public'));

app.set('view engine','ejs');
app.set('views','app/views/pages');

app.use(cookieParser('a98dbd38-68c4-4d74-b36a-2e5bbdc7ecdd'));

app.use(session({
    secret:'cvekg-cvekvgwk-vwvgw-vwgv-cwhv',
    resave:false,
    saveUninitialized:true,
    cookie: { maxAge: 360000 }
}));

app.use(flash());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

 app.use('/elective', indexRouter)

app.listen(8080);
