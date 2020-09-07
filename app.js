//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require('md5');
const bcrypt = require("bcrypt");
const app = express();
const saltRounds = 10;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection established to the database.");
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.route("/")
  .get(function(req, res){
    res.render("home");
  });

app.route("/login")
  .get(function(req, res){
    res.render("login");
  })
  .post(function(req, res){
    const username = req.body.username;
    const password = req.body.password;


    User.findOne({email: username}, function(err, found){
      if(!err) {
        if(found){
          bcrypt.compare(password, found.password, function(err, result){
            if(result === true) {
              res.render("secrets");
            }
          });
        }

      } else {
        res.send("<h1>User not found!</h1>");
        console.log(err);
      }
    });
  });

app.route("/register")
  .get(function(req, res){
    res.render("register");
  })
  .post(function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
      const newUser = new User({
        email: req.body.username,
        password: hash
      });

      newUser.save(function(err){
        if(err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    });
  });

app.listen(8888, function(){
  console.log("Server started on Port 8888.");
});
