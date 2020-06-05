// Set up the project
const express = require("express");
const bodyParser=require("body-parser");

// A library to help hash passwords.
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
// Database Code
// Connecting with database
const mongoose=require("mongoose");
const url="mongodb://127.0.0.1:27017/User_DB";
mongoose.connect(url,{useNewUrlParser:true});
// chcek if we are connected
const db=mongoose.connection;
db.once('open',function(){
    console.log("Database Connected.");
});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});
const UserDB=mongoose.model("User",userSchema);

// HOME PAGE
app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
  });
app.get("/register",function(req,res){
     res.render("register");
});

// Post function for signup page
app.post("/register",function(req,res){
    const form_email=req.body.email;
    const form_password=req.body.password;
    // To hash a password using bcrypt
    bcrypt.hash(form_password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        if(!err){
            // Create new User
            const newuser=new UserDB({
            email:form_email,
            password:hash
            })
            newuser.save();
            res.render('myaccount')
        }
    });
    
});
// *****************************************************************

// post function for login
app.post("/login",function(req,res){
    const form_email=req.body.email;
    const form_password=req.body.password;
    UserDB.findOne({email: form_email},function(err,foundItem){
        if(!err){
            // if user does not exists, rediresct to signup page
            if(!foundItem){
                // console.log("User does not exists");
                res.render("register");
            }
            // if user exists, render to the user (Account) page
            else{
                // Load hash from your password DB.
                bcrypt.compare(form_password, foundItem.password, function(err, result) {
                    // result == true
                    res.render("myaccount")
                });
            }
        }
    });
});
// *****************************************************************


app.listen(3000,function(){
    console.log("Server is Running on 3000");
});