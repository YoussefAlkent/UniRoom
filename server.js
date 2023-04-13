const http = require("http");
const ejs = require('ejs')
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const session = require('express-session')

var con = mysql.createConnection({
    host: "uni-room.mysql.database.azure.com",
    port: 3306,
    user:"Uniroom_Admin",
    password:"vtaiu@12345",
    multipleStatements:true
});
var transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    auth:{
        user: "", //Use an email here, Until we can create one for the entire team
        pass: "" //Use an app specific password here if using 2fa
    }
})
function createSignUpMail(email){
    return {
        from: "",//Enter your email here
        to:email,
        subject: "You Succesfully signed up!",
        text:"Welcome to UniRoom!, You have been signed up"
    }
}
function createLogInMail(email){
     return {
        from: "",//Enter your email here
        to:email,
        subject: "You have been logged in",
        text:"Someone just logged in with your account, if it was you, please ignore this email, if not, please change your password"
    }
}


var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser())
app.listen(8080);
app.use(express.static('css'));
app.use(express.static('js'));

let r_data;
app.get('/', function(request, res, next){
    let query = "SELECT * FROM aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo = 1";
    console.log("querying");
    let book = require('./public/javascript/booking');
    console.log(book);
    let room_query = "SELECT * FROM aiuroom.room";

    con.query(query, function(error, data){
        if(error){
           throw error; 
           //response.render('pages/booking', {b_data: 0, error:false});
        } else {
            console.log(data);
            res.render('pages/booking', {b_data: data, book:book, error:false});
            //console.log(data);
        }
    });

    //res.render('pages/booking', {book: book, error:false});
   // res.render('pages/booking');
});

app.get('/', function(req, res){
    
});

app.get('/', function(req, res){
    res.render('pages/booking', {css_file:'../../css/style.css'}); 
    
});
app.post('/Signin', async (req, res) =>{
    var name = req.body.name;
    var pass = req.body.pass
    let query = "SELECT * FROM person WHERE NID=? AND Password =?"
    let values = [name, pass];
    con.query(query,[values], function(err, result){
        if(result == null){

        } else{
            transporter.sendMail(createLogInMail(result.email), function(err, info){
                if (err) throw err; else{console.log("email sent" + info.response)}
            })
            res.render(booking)
        }
    })
    app.use(function (req, res, next){
        var cookie = req.cookies.loginCookie;
        if(cookie === undefined){
            res.cookie('loginCookie',name , {maxAge: 900000, httpOnly:true})
            console.log("Created cookie")
        } else{
            console.log('Cookie Existed', cookie)
        }
        next();
    })
})
app.post('/signup', async(req, res)=>{
    console.log(req.body)
    var Fname = req.body.name;
    var email = req.body.uemail;
    var uid = req.body.uid;
    var pass = req.body.pass;
    var phonenum = req.body.phonenum;
    var repeatpass = req.body.repeatpass;
    var gender = req.body.gender;
    var year = req.body.year;
    var field = req.body.fleid;
    var parentnum = req.body.parentnum
    if(pass == repeatpass){
        transporter.sendMail(createSignUpMail(email), function(err, info){
            if(err) throw err; else console.log("email sent" + info.response)
        })
        let query = "INSERT INTO person (Fname, Phone, UniversityEmail, Username, Password, Gender, NID) VALUES ?"
        let values=[Fname, phonenum, email, uid, password, gender, uid]
        con.query(query, [values], function(err, result){
            if (err) throw err;
            console.log("Signup 1 Successful:  ", result)
        })
        let query2 = "INSERT INTO student (SID, NID, Grade, Parentnumber, Parent, StudentName) VALUES ?"
        let values2 = [uid, uid, year, parentnum, parent, Fname]
        con.query(query2, [values2], function(err, result){
            if (err) throw err;
            console.log("Signup 2 Succesful")
        })
    }
})

console.log('Server is running, Port: 8080')
module.exports = app;