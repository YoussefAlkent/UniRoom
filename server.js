const http = require("http");
const ejs = require('ejs')
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
var con = mysql.createConnection({
    host: "uni-room.mysql.database.azure.com",
    port: 3306,
    user:"Uniroom_Admin",
    password:"vtaiu@12345",
    multipleStatements:true
});


var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

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
            res.render(booking)
        }
    })
})
app.post('/signup', async(req, res)=>{
    var Fname = req.body.name;
    var email = req.body.uemail;
    var uid = req.body.uid;
    var pass = req.body.pass;
    var phonenum = req.body.phonenum;
    var repeatpass = req.body.repeatpass;
    var gender = req.body.gender;
    var year = req.body.year;
    var field = req.body.fleid;
    if(pass == repeatpass){
        let query = "INSERT INTO person (Fname, Phone, UniversityEmail, Username, Password, Gender, NID) VALUES ?"
        let values=[Fname, phonenum, email, uid, password, gender, uid]
        con.query(query, [values], function(err, result){
            if (err) throw err;
            console.log("Signup Successful:  ", result)
        })
    }
})

// var sql = "SELECT * FROM aiuroom.person";
// con.connect(function(err){
//     if (err) throw err;
//     console.log("Connected!");
//     // con.query(sql, function(err,result, fields){
//     //     if (err) throw err;
//     //     console.log("Result: " + result[0].Fname)
//     // })
// })




console.log('Server is running, Port: 8080')
/*

const hostname = '127.0.0.1';
const port = 8080;

var server = null;
fs.readFile('../index.html', function(error, html){
    if(error) throw error;
    server = http.createServer(function(req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(html)
        res.end();
    });
    server.listen(port,hostname,function(){
        console.log("Server running at http://" + hostname + ':' + port +'/')
    })
});

/*
var express = require('express');
const ejs = require('ejs')

var app = express();

*/
module.exports = app;