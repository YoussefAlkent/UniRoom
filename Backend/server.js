const http = require("http");
var mysql = require('mysql');
var fs = require('fs');

var con = mysql.createConnection({
    host: "DESKTOP-TD40LLD",
    user:"Bedair",
    password:"12345"

});
var sql = "SELECT * FROM aiuroom.person";
con.connect(function(err){
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, function(err,result, fields){
        if (err) throw err;
        console.log("Result: " + result[0].Fname)
    })
})
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