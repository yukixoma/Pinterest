var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    username: String,
    avatar_url: String,
    pin : Array,
})

var ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;

//Add New Pin
module.exports.add = function (username,add, callback) {
    ModelClass.findOne({username: username}, function(err,data){
        if(err) callback(err,null);
        if(data) {
            data.pin.push(add);
            ModelClass.find({username: username}).remove(function(err){
                if(err) callback(err,null);
                var newUser = new ModelClass ({
                    username: data.username,
                    avatar_url: data.avatar_url,
                    pin: data.pin
                })
                newUser.save(function(err){
                    if(err) callback(err,null);
                    callback(null,newUser);
                })
            })
        }
    })
}

//Remove Pin
module.exports.remove = function (username,remove,callback) {
    ModelClass.findOne({username: username}, function (err,data){
        if(err) callback(err,null);
        if(data) {
            for (var i = 0; i < data.pin.length; i++) {
                if(data.pin[i].url == remove) data.pin.splice(i,1);
            }
            ModelClass.find({username: username}).remove(function(err){
                if(err) callback(err,null);
                var newUser = new ModelClass ({
                    username: data.username,
                    avatar_url: data.avatar_url,
                    pin: data.pin
                })
                newUser.save(function(err){
                    if(err) callback(err,null);
                    else callback(null,newUser);
                })
            })
        }
    })
}

//Like 
module.exports.like = function (whoLike,pin,ofWho,callback) {
    ModelClass.findOne({username: ofWho}, function(err,data){
        if(err) callback(err,null);
        if(data) {
            for(var i = 0; i < data.pin.length; i++) {
                if(data.pin[i].url == pin) data.pin[i].like.push(whoLike);
            }
            ModelClass.find({username: ofWho}).remove(function(err){
                if(err) callback(err,null)
                var newUser = new ModelClass ({
                    username: data.username,
                    avatar_url: data.avatar_url,
                    pin: data.pin
                })
                newUser.save(function(err){
                    if(err) callback(err,null);
                    else callback(null,newUser);
                })
            })
            
        }
    })
}

//Unlike 
module.exports.unlike = function (whoUnlike,pin,ofWho, callback) {
    ModelClass.findOne({username: ofWho}, function(err,data){
        if(err) callback(err,null);
        if(data) {
            for (var i = 0; i < data.pin.length; i++) {
                for (var x = 0; x < data.pin[i].like.length; x++) {
                    if(data.pin[i].like[x] == whoUnlike && data.pin[i].url == pin) 
                    data.pin[i].like.splice(x,1);
                }
            }
            ModelClass.find({username: ofWho}).remove(function(err){
                if(err) callback(err,null);
                var newUser = new ModelClass ({
                    username: data.username,
                    avatar_url: data.avatar_url,
                    pin: data.pin
                })
                newUser.save(function(err){
                    if(err) callback(err,null);
                    else callback(null,newUser);
                })
            })
        }
    })
}