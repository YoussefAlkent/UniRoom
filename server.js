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
const paymentAuth = "" //Paymob Key

var con = mysql.createConnection({
    host: "", //Enter the Environment Variable Here
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
app.use(express.static('public/images'));
var urlencodedParser = bodyParser.urlencoded({extended:false})

app.post('/Signin', async (req, res) =>{
    var name = req.body.name;
    var pass = req.body.password;
    let query = "SELECT * FROM aiuroom.person WHERE Universityemail=? OR NID=?";
    let values = [name, name];
    console.log(name);
    con.query(query,values, function(err, result){
        console.log(result[0]);
        if(result[0].Password == pass){
            const token = jwt.sign({id:result[0].NID},secretPhrase, {expiresIn:"3h"})
            console.log(token)
            res.cookie('token', token,{
                httpOnly:true
            });
            console.log("cookie done");
            res.redirect('/Profile');
        } else{
            // transporter.sendMail(createLogInMail(result.email), function(err, info){
            //     //if (err) throw err;
            //     //else{console.log("email sent" + info.response)}
            // })
            res.redirect('/');
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

app.post('/SignupPage', async(req, res)=>{
    try{
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid];
        con.query(query,values, function(err, data){
            
            if(err){
                throw err;
            }
            else if(data == null){
    
            } else{
                //alert("Booking Successfully processed");
                console.log(data);
                res.render('pages/signup', {userdata:data[0][0], message:""});
            }
        });
    } catch {
        res.render('pages/signup', {userdata:null, message:""});
    } 
});
app.post('/signup', async(req, res)=>{
    console.log(req.body)
    var Fname = req.body.name;
    var email = req.body.uemail;
    var uid = req.body.uid;
    var pass = req.body.password;
    var phonenum = req.body.phonenum;
    var repeatpass = req.body.repeatpass;
    var gender = req.body.gender;
    var year = req.body.year;
    var field = req.body.field;
    var parentnum = req.body.parentnum
    let parent = req.body.parent_name;
    if(pass == repeatpass){
        transporter.sendMail(createSignUpMail(email), function(err, info){
            if(err) throw err; else console.log("email sent" + info.response)
        })
        let query = "INSERT INTO aiuroom.person (Fname, Phone, UniversityEmail, Username, Password, Gender, NID) VALUES (?)"
        let values=[Fname, phonenum, email, Fname, pass, gender, uid];
        con.query(query, [values], function(err, result){
            if (err){
                res.render("pages/signup", {userdata:null, message:"An error occurred. Please try again."});
                throw err;
            } 
            console.log("Signup 1 Successful:  ", result)
        })
        let query2 = "INSERT INTO aiuroom.student (SID, year, Parentnumber, Parent, StudentName, Uni_email) VALUES (?)"
        let values2 = [uid, year, parentnum, parent, Fname, email]
        con.query(query2, [values2], function(err, result){
            if (err) {
                res.render("pages/signup", {userdata:null, message:"An error occurred. Please try again."});
                throw err;
            }
            console.log("Signup 2 Succesful", result)
        })
        res.redirect('/');
    } else {
        res.render('pages/signup',{userdata:null, message:"Passwords did not match. Please try again."})
    }
});

app.get('/Booking', function(req, res, next){
    let sDate='2020-01-01';
    let eDate='2999-01-02';
    try{
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let query = "SELECT * FROM aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo = 1 AND RoomNo>=1 AND RoomNo<=12; SELECT * FROM aiuroom.booking WHERE StartTime<=? AND EndTime>=?; SELECT * FROM aiuroom.person WHERE NID=?";
        console.log("querying");
        let book = require('./public/javascript/booking');
        //console.log(book);
        values = [sDate, eDate, nid];
        con.query(query, values, function(error, data){
            if(error){
            throw error; 
            //response.render('pages/booking', {b_data: 0, error:false});
            } else {
            console.log(data[2][0].Gender);
            let selectedBuilding=4;
            if(data[2][0].Gender == 'M'){
                selectedBuilding=1;
            }
            console.log(data[2]);
                res.render('pages/booking', {
                    b_data: data[0], 
                    r_data: data[1], 
                    bookings: data[2],
                    sBuilding:selectedBuilding, 
                    selectedFloor:1,
                    sRoom:1, 
                    eRoom:12, 
                    sDate:sDate, 
                    eDate:eDate,
                    error:false,
                    userdata:data[2][0]
                });
            
            }
        });
    } catch {
        res.redirect('/');
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
                    error:false,
                    userdata:null
                });
            
            }
        });
    }
});
app.post('/Booking', async (req, res) =>{
    let bNo = req.body.bNo;
    let sRoom = req.body.sRoom;
    let eRoom = req.body.eRoom;
    let sDate = req.body.sDate;
    let eDate = req.body.eDate;
    let floor = req.body.floor;

    try{
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let query = "SELECT * from aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo=? AND RoomNo>=? AND RoomNo<=?; \
                     SELECT * FROM aiuroom.booking WHERE (startTime<=? AND endTime>=?) OR (startTime>=? AND endTime<=?) OR (startTime>=? AND startTime<=?) OR (endTime>=? AND endTime<=?); \
                     SELECT * FROM aiuroom.person WHERE NID=?";
        console.log("date"+sDate);
        let values=[bNo, sRoom, eRoom, sDate, eDate, sDate, eDate, sDate, eDate, sDate, eDate, nid, nid];
        con.query(query,values, function(err, data){
            
            if(err){
                throw err;
            }
            else if(data == null){
    
            } else{
                console.log(data[2]);
                console.log(floor+" "+sRoom);
                if(data[3][0].Gender=='F' && bNo <=3){
                    bNo=4;
                } else if(data[3][0].Gender=='M' && bNo >=4){
                    bNo = 1;
                }
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
                    error:false,
                    userdata:data[3][0]
                });
                
            }
        }); 
    } catch {
        let query = "SELECT * from aiuroom.building; SELECT * FROM aiuroom.room WHERE BuildingNo=? AND RoomNo>=? AND RoomNo<=?; SELECT * FROM aiuroom.booking WHERE (startTime<=? AND endTime>=?) OR (startTime>=? AND endTime<=?) OR (startTime>=? AND startTime<=?) OR (endTime>=? AND endTime<=?)";
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
                    error:false,
                    userdata:null
                });
            }
        });
    }         
});

app.get('/', async (req, res) => {
    
    // if cookie has expired, delete cookie
    if(req.cookies.token && JSON.parse(atob(req.cookies.token.split('.')[1])).exp < (Date.now()/1000)){
        await res.clearCookie("token");
        console.log("cookie"+req.cookies.token);
    }
    if(req.cookies.token){
        console.log();
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        try{
            let token = jwt.verify(req.cookies.token, secretPhrase);
            console.log(token.getExpiresAt());
            let nid = token.id;
            let values=[nid];


        con.query(query,values, function(err, result){
            
            if(err){
                res.render('pages/index', {userdata:null});
            }
            else if(result == null){
                res.render('pages/index', {userdata:null});
            } else{
                //alert("Booking Successfully processed");
                console.log(result);
                res.render('pages/index', {userdata:result[0]});
            }
        });
    } catch{
        res.render('pages/index', {userdata:null});
    }
    } else {
        res.render('pages/index', {userdata:null});
    }
});

app.post('/Home', async (req, res) => {
    try{
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid];
        con.query(query,values, function(err, result){
            
            if(err){
                throw err;
            }
            else if(result == null){

            } else{
                //alert("Booking Successfully processed");
                console.log(result);
                res.render('pages/index', {userdata:result[0]});
            }
        });
    } catch {
        res.render('pages/index', {userdata:null});
    }
});

app.post('/About', async (req, res) => {
    // Data 
    const data = {
        mission: 'our mission is to create a simple and efficient online system for any student at Alamein International University to book housing for short- and long-term stays..',
        teams: [
            { name: 'Member 1:', description: 'Youssef Bedair' },
            { name: 'Member 2:', description: 'Omar El-Hamraway' },
            { name: 'Member 3:', description: ' Rebecca Whitten' },
            { name: 'Member 4:', description: 'Tedy Huang' },
            { name: 'Member 5:', description: 'Khaled Bahaaeldin' }
        ]
    };
    try{
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid];
        con.query(query,values, function(err, result){
            
            if(err){
                throw err;
            }
            else if(result == null){

            } else{
                //alert("Booking Successfully processed");
                console.log(result);
                res.render('pages/about', {data:data, userdata:result[0]});
            }
        });
    } catch {
        res.render('pages/about', {data:data, userdata:null});
    }
    
});
app.get('/About', (req, res) => {
    // Data 
    const data = {
        mission: 'our mission is to create a simple and efficient online system for any student at Alamein International University to book housing for short- and long-term stays..',
        teams: [
            { name: 'Member 1:', description: 'Youssef Bedair' },
            { name: 'Member 2:', description: 'Omar El-Hamraway' },
            { name: 'Member 3:', description: 'Rebecca Whitten' },
            { name: 'Member 4:', description: 'Tedy Huang' },
            { name: 'Member 5:', description: 'Khaled Bahaaeldin' }
        ]
    };
    try {
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid];
        con.query(query,values, function(err, result){
            
            if(err){
                throw err;
            }
            else if(result == null){

            } else{
                //alert("Booking Successfully processed");
                console.log(result);
                res.render('pages/about', {data:data, userdata:result[0]});
            }
        });
    } catch {
        res.render('pages/about', {data:data, userdata:null});
    }
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
    try {
        query="SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid];
        con.query(query,values, function(err, data){
            
            if(err){
                throw err;
            }
            else if(data == null){

            } else{
                //alert("Booking Successfully processed");
                console.log(data);
                res.render('pages/Payment', {userdata:data[0], bNo:bNo, rNo:rNo, sDate:sDate, eDate:eDate, sFloor:sFloor});
            }
        });
    } catch {
        res.render('pages/Payment', {userdata:null, bNo:bNo, rNo:rNo, sDate:sDate, eDate:eDate, sFloor:sFloor})
    }
});

app.post('/ConfirmBooking', async (req, res) => {
    let bNo = req.body.bNo;
    let rNo = req.body.rNo;
    let sDate = req.body.sDate;
    let eDate = req.body.eDate;
    let roomid = bNo+rNo;
    try{
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let query = "INSERT INTO aiuroom.booking (NID, StartTime, EndTime, RoomNo, roomid) VALUES (?); SELECT * FROM aiuroom.person WHERE NID=?"
        let values=[[nid, sDate, eDate, rNo, roomid], nid];
        con.query(query,values, function(err, data){
            console.log(query);
            console.log(data);
            if(err){
                console.log(err);
                res.render('pages/paymentSuccess', {userdata:data[0], message:"Something went wrong. Booking did not go through"});
            }
            else if(data == null){
    
            } else{
                //alert("Booking Successfully processed");
                console.log(data);
                res.render('pages/paymentSuccess', {userdata:data[0], message:"Booking Success!"});
            }
        });
    } catch {
        res.render('pages/paymentSuccess', {userdata:null, message:"Logout Session ended. Booking did not go through. Please log in again via the Home page and try again."});
    }

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

app.get('/Profile', (req,res)=>{
    try{
        query="SELECT * FROM aiuroom.booking WHERE NID=?; SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid, nid];
        con.query(query,values, function(err, data){
            
            if(err){
                throw err;
            }
            else if(data == null){
    
            } else{
                //alert("Booking Successfully processed");
                console.log(data);
                res.render('pages/Profile', {bookings:data[0],userdata:data[1][0], token:token});
            }
        });
    } catch {
        res.redirect('/');
    } 
});
app.post('/Profile', (req,res)=>{
    try{
        query="SELECT * FROM aiuroom.booking WHERE NID=?; SELECT * FROM aiuroom.person WHERE NID=?";
        let token = jwt.verify(req.cookies.token, secretPhrase);
        let nid = token.id;
        let values=[nid, nid];
        con.query(query,values, function(err, data){
            
            if(err){
                throw err;
            }
            else if(data == null){
    
            } else{
                //alert("Booking Successfully processed");
                console.log(data);
                res.render('pages/Profile', {bookings:data[0],userdata:data[1][0], token:token});
            }
        });
    } catch {
        res.redirect('/');
    } 
});
