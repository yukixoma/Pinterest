var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    username: String,
    avatar_url: String,
    pin : Array,
})

var ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;