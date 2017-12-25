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
            user.update({username: username},{avatar_url: avatar_url}, function(err,affected,resp){
                if(err) throw err;
            })
            res.redirect("/home");
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

app.get("/home", function(req,res){
    if(req.user) {
        var username = req.user.username;
        user.findOne({username: username},function(err,data){
            if(err) throw err;
            if(data) res.render("home", {
                username: req.user.username,
                pin: data.pin
            });
        })
    } else {
        res.redirect("/");
    }
})

app.get("/add", function(req,res){
    if(req.user) {
        var description = req.query.description;
        var url         = req.query.url;
        var add = {description : description, url: url, like: []};
        var username = req.user.username;
        user.add(username,add,function(err,result){
            if(err) throw err;
            console.log(result);
            res.redirect("/home");
        })
    }
})

app.get("/remove", function(req,res){
    if(req.user) {
        var username = req.user.username;
        var remove   = req.query.remove;
        user.remove(username,remove,function(err,result){
            if(err) throw err;
            console.log(result);
            res.redirect("/home");
        })
    }
})

app.get("/recent", function(req,res){
    var pin = [];
    var username = req.user? req.user.username : null;
    user.find({},function(err,data){
        if(err) throw err;
        data.forEach(function(element){
            if(element.pin.length > 0) {
                element.pin.forEach(function(e) {
                    var isLiked = false;
                    for( var i = 0; i < e.like.length; i++) {
                        if (e.like[i] == username) isLiked = true;
                    }
                    e.ofWho = element.username;
                    e.avatar_url = element.avatar_url;
                    e.isLiked = isLiked;
                    pin.push(e);
                })
            }
        })
        res.render("recent",{username:username, pin: pin});
    })
})

app.get("/like",function(req,res){
    if(req.user) {
        var whoLike     = req.user.username;
        var pin         = req.query.like.split(",")[0];
        var ofWho       = req.query.like.split(",")[1];
        user.like(whoLike,pin,ofWho,function(err,result){
            if(err) throw err;
            res.redirect("/recent");
        })
    }
})

app.get("/unlike", function(req,res){
    if(req.user) {
        var whoUnlike = req.user.username;
        var pin = req.query.unlike.split(",")[0];
        var ofWho =  req.query.unlike.split(",")[1];
        user.unlike(whoUnlike,pin,ofWho, function(err,result){
            if(err) throw err;
            res.redirect("recent");
        })
    }
})

app.get("/browse/:ofWho",function(req,res){
    var username = req.user? req.user.username: null;
    var ofWho = req.params.ofWho;
    var pin = [];
    user.findOne({username: ofWho},function(err,data){
        if(err) throw err;
        if(data) {
            data.pin.forEach(function(e){
                var isLiked = false;
                for( var i = 0; i < e.like.length; i++) {
                    if (e.like[i] == username) isLiked = true;
                }
                e.ofWho = data.username;
                e.avatar_url = data.avatar_url;
                e.isLiked = isLiked;
                pin.push(e);
            })
        }
        res.render("browse", {username : username, pin: pin});
    })
})

app.listen(process.env.PORT || 3000);