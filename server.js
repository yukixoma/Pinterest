var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;
var session = require("express-session");
var app = express();


passport.use(new Strategy({
    consumerKey: 	"iy4ap7WexAIixxqh3yHPXDZcb",
    consumerSecret: "nXx9sCbZRAzhHnhgldMfXFs4rwrCENoKLA63Qq0TfjkHEMH7Qh",
    callbackURL: "http://localhost:3000/twitter/return"
}, function(token, tokenSecret, profile, callback) {
    return callback(null, profile);
}))

passport.serializeUser( function(user, callback){
    callback(null,user);
})

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static("public"));
app.use(session({secret:"*", resave:true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", function(req, res) {
    res.render("index");
})

app.get("/twitter/login", passport.authenticate("twitter"));

app.get("/twitter/return", passport.authenticate("twitter", {
    failureRedirect: '/'
}), function (req,res){
    res.json(req.user);
})












app.listen(process.env.PORT || 3000);