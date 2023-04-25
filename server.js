const http = require("http");
const ejs = require('ejs')
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const secretPhrase = 'ThisIsTheSecretPhrasePleaseChangeMeOkayIMPORTANT' //what the variable said
const bodyParser = require('body-parser')
const paymentAuth = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TnpVeU5UY3dMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuNDFiTDBadWdjWTZZV19PRURha2pjUVNDNnNDZXlSR2pwVjVLWGhmbVdCS1BtX2J1bXA3LWRrS0E2T29ybmx5WWRtdTVxVWFSeWp2SjRWR2FrclNETWc=" //Our paymob Key

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
        text:"Someone just logged in with your account. If it was you, please ignore this email-- if not, please change your password."
    }
}

var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser())
app.listen(8080);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public/stylesheets'));
app.use(express.static('../public/javascript'));

app.use(express.static('css'));
app.use(express.static('js'));
var urlencodedParser = bodyParser.urlencoded({extended:false})


app.get('/Booking', function(request, res, next){
    let sDate='2023-01-01';
    let eDate='2999-01-02';
    let query = "SELECT * FROM aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo = 1 AND RoomNo>=1 AND RoomNo<=12; SELECT * FROM aiuroom.booking WHERE StartTime<=? AND EndTime>=?";
    console.log("querying");
    let book = require('./public/javascript/booking');
    //console.log(book);
    values = [sDate, eDate];
    con.query(query, values, function(error, data){
        if(error){
           throw error; 
           //response.render('pages/booking', {b_data: 0, error:false});
        } else {
           // console.log(data);
           console.log(data[2]);
            res.render('pages/booking', {
                b_data: data[0], 
                r_data: data[1], 
                bookings: data[2],
                sBuilding:1, 
                selectedFloor:1,
                sRoom:1, 
                eRoom:12, 
                sDate:sDate, 
                eDate:eDate,
                error:false
            });
           
        }
    });
});

app.post('/Signin', async (req, res) =>{
    var name = req.body.name;
    var pass = req.body.pass
    let query = "SELECT * FROM person WHERE NID=?";
    let values = [name];
    con.query(query,[values], function(err, result){
        if(result.password == pass){
            const token = jwt.sign(user,secretPhrase, {expiresIn:"3h"})
            res.cookie('token', token,{
                httpOnly:true
            })

        } else{
            transporter.sendMail(createLogInMail(result.email), function(err, info){
                if (err) throw err; else{console.log("email sent" + info.response)}
            })
            res.redirect('/')
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
            console.log("Signup 2 Succesful", result)
        })
    }
})
app.post('/Booking', async (req, res) =>{
    let bNo = req.body.bNo;
    let sRoom = req.body.sRoom;
    let eRoom = req.body.eRoom;
    let sDate = req.body.sDate;
    let eDate = req.body.eDate;
    let floor = req.body.floor;
    let query = "SELECT * from aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo=? AND RoomNo>=? AND RoomNo<=?; SELECT * FROM aiuroom.booking WHERE (startTime<=? AND endTime>=?) OR (startTime>=? AND endTime<=?) OR (startTime>=? AND startTime<=?) OR (endTime>=? AND endTime<=?)"
    console.log("date"+sDate);
    let values=[bNo, sRoom, eRoom, sDate, eDate, sDate, eDate, sDate, eDate, sDate, eDate];
    con.query(query,values, function(err, data){
        
        if(err){
            throw err;
        }
        else if(data == null){

        } else{
            console.log(data[2]);
            console.log(floor+" "+sRoom);

            return res.render('pages/booking', {
                b_data:data[0], 
                r_data: data[1], 
                bookings:data[2], 
                sBuilding:bNo, 
                selectedFloor:floor, 
                sRoom:sRoom, 
                eRoom:eRoom, 
                sDate:sDate, 
                eDate:eDate, 
                error:false
            });
            
        }
    });
});

app.get('/', async (req, res) => {
    console.log("home");
    res.render('pages/index');
});

app.post('/Home', async (req, res) => {
    console.log("home");
    res.render('pages/index');
});

app.post('/About', async (req, res) => {
    // Data 
    const data = {
        mission: 'our mission is to create a simple and efficient online system for any student at Alamein International University to book housing for short- and long-term stays..',
        teams: [
            { name: 'member 1:', description: 'Youssef Bedair' },
            { name: 'member 2:', description: 'Omar El-Hamraway' },
            { name: 'member 3:', description: ' Rebecca Whitten' },
            { name: 'member 4:', description: 'Tedy Huang' },
            { name: 'member 5:', description: 'Khaled Bahaaeldin' }
        ]
    };
    res.render('pages/about', data);
});
app.get('/About', (req, res) => {
    // Data 
    const data = {
        mission: 'our mission is to create a simple and efficient online system for any student at Alamein International University to book housing for short- and long-term stays..',
        teams: [
            { name: 'member 1:', description: 'Youssef Bedair' },
            { name: 'member 2:', description: 'Omar El-Hamraway' },
            { name: 'member 3:', description: ' Rebecca Whitten' },
            { name: 'member 4:', description: 'Tedy Huang' },
            { name: 'member 5:', description: 'Khaled Bahaaeldin' }
        ]
    };
    res.render('pages/about', data);
});

app.post('/SignInPage', async (req, res) => {
    console.log("home");
    res.render('pages/Signin');
});

app.post('/Payment', async (req, res) => {
    let bNo = req.body.bNo;
    let rNo = req.body.rNo;
    let sDate = req.body.sDate;
    let eDate = req.body.eDate;
    let sFloor = req.body.floor;
    
    res.render('pages/Payment', {user:"TBD", bNo:bNo, rNo:rNo, sDate:sDate, eDate:eDate, sFloor:sFloor})
});

app.post('/ConfirmBooking', async (req, res) => {
    let bNo = req.body.bNo;
    let rNo = req.body.rNo;
    let sDate = req.body.sDate;
    let eDate = req.body.eDate;
    let roomid = bNo+rNo;

    let query = "INSERT INTO aiuroom.booking (NID, StartTime, EndTime, RoomNo, roomid) VALUES (?)"
    let values=[111111111, sDate, eDate, rNo, roomid];
    con.query(query,[values], function(err, data){
        
        if(err){
            throw err;
        }
        else if(data == null){

        } else{
            //alert("Booking Successfully processed");
            console.log(data);
            res.render('pages/paymentSuccess');
        }
    });
});


// app.get('/bookingStart/', urlencodedParser , (req,res,next)=>{
//     const token = req.cookies.token;
//     try{
//         const user = jwt.verify(token,secretPhrase)
//         req.user = user;
//         next();
//     }
//     catch{
//         res.clearCookie('token')
//         return res.redirect('/Signin')
//     }
// }, (req,res)=>{
//     res.redirect('/')
// })
console.log('Server is running, Port: 8080')
module.exports = app;

app.post('/Profile', (req,res)=>{
    res.render('pages/Profile');
});