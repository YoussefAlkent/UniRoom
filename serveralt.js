const http = require("http");
const ejs = require('ejs')
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const bodyParser = require('body-parser')
var con = mysql.createConnection({
    host: "uni-room.mysql.database.azure.com",
    port: 3306,
    user:"Uniroom_Admin",
    password:"vtaiu@12345",
    multipleStatements:true
});

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
app.set('views', __dirname + '\\views\\pages');

app.listen(8080);
app.use(express.static('css'));
app.use(express.static('js'));
app.get('/', (req, res)=>{
    res.render('signup')
})


app.post('/signup', async (req, res) =>{
    console.log(req.body)
})