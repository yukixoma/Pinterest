var express         = require("express");
var cookieParser    = require("cookie-parser");
var bodyParser      = require("body-parser");
var passport        = require("passport");
var Strategy        = require("passport-twitter").Strategy;
var session         = require("express-session");
var mongoose        = require("mongoose");
var user            = require("./model/user.js");
var expressLayouts  = require("express-ejs-layouts");
var app             = express();


//Connect Mongodb
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/local", {
    useMongoClient: true
});

// Server Settings
    // Set Viewengine and Layout
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({secret:"*", resave:true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

// Twitter Login Process
passport.use(new Strategy({
    consumerKey: 	"iy4ap7WexAIixxqh3yHPXDZcb",
    consumerSecret: "nXx9sCbZRAzhHnhgldMfXFs4rwrCENoKLA63Qq0TfjkHEMH7Qh",
    callbackURL:    "http://localhost:3000/twitter/return"
}, function(token, tokenSecret, profile, callback) {
    return callback(null, profile);
}))

passport.serializeUser( function(user, callback){
    callback(null,user);
})

passport.deserializeUser ( function(obj, callback){
    callback(null, obj);
})

app.get("/twitter/login", passport.authenticate("twitter"));

app.get("/twitter/return", passport.authenticate("twitter", {
    failureRedirect: '/'
}), function (req,res){
    var username = req.user.username;
    var avatar_url = req.user.photos[0].value;
    user.findOne({username: username},function(err,data){
        if(err) throw err;
        if(data) {
            console.log("registed user logging");
            res.redirect("/");
        } else {
            var newUser = new user ({
                username: username,
                avatar_url: avatar_url,
                pin: [],
            });
            newUser.save(function(err) {
                if(err) throw err;
                console.log("new user registed");
                res.redirect("/");
            })
        }
    })
})

// Logout
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
})





app.get("/", function(req, res) {
    if(req.user) var username = req.user.username;
    else var username = null;
    console.log(username);
    res.render("index" , {username: username});
})














app.listen(process.env.PORT || 3000);