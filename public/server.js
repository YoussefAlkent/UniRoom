const http = require("http");
const ejs = require('ejs')
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
var con = mysql.createConnection({
    host: "uni-room.mysql.database.azure.com",
    port: 3306,
    user:"Uniroom_Admin",
    password:"vtaiu@12345"
});


var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.listen(8080);
app.use(express.static('css'));
app.use(express.static('js'));
app.get('/', function(request, response, next){
    let query = "SELECT * FROM aiuroom.building";
    console.log("querying");
    con.query(query, function(error, data){
        if(error){
           throw error; 
           //response.render('pages/booking', {b_data: 0, error:false});
        } else {
            response.render('pages/booking', {b_data: data, error:false});
            //console.log(data);
        }
    });
});

app.get('/', function(req, res){
    res.render('pages/booking', {css_file:'../../css/style.css'});
    res.render('pages/booking');
    
});

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