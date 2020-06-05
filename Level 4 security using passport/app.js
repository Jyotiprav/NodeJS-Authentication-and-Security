// Set up the project
const express = require("express");
const bodyParser=require("body-parser");

// Modules required for using passport
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

const app=express();

app.use(session({
    secret:"Our little secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

// Database Code
// Connecting with database
const mongoose=require("mongoose");
const url="mongodb://127.0.0.1:27017/User_DB";
mongoose.connect(url,{useNewUrlParser:true});
// To avoid warning while using passport
// Warning:DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set("useCreateIndex",true);
// chcek if we are connected
const db=mongoose.connection;
db.once('open',function(){
    console.log("Database Connected.");
});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});
// Connecting DB with passport
userSchema.plugin(passportLocalMongoose);
const UserDB=mongoose.model("User",userSchema);
// Use authenticate method of model in passport strategy
passport.use(UserDB.createStrategy());
passport.serializeUser(UserDB.serializeUser());
passport.deserializeUser(UserDB.deserializeUser());

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
app.get("/myaccount",function(req,res){
    // Check if user is authenticated or not
    if(req.isAuthenticated()){
        res.render("myaccount")
    }
    else{
        res.render("login")
    }
});
// logout
app.get("/logout",function(req,res){
    req.logout(); //to close the session and destroy the cookie
    res.redirect('/'); 
});

// Post function for signup page
app.post("/register",function(req,res){
    UserDB.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/myaccount")
            })
        }
    })
});
// *****************************************************************

// post function for login
app.post("/login",function(req,res){
    const user=new UserDB({
        username:req.body.username,
        password: req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/myaccount")
            })
        }
    })
});
// *****************************************************************


app.listen(3000,function(){
    console.log("Server is Running on 3000");
});