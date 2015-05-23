// why require these in this file?
// bcrypt because we don't need it anywhere else
// re: mongoose, because we're defining a schema; need mongoose for that
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  // firstName: String,
  // lastName: String,
  passwordDigest: String
});

userSchema.statics.createSecure = function (email, password, cb) {
  // saves the user email and hashs the password
  var _this = this;
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      console.log(hash);
      _this.create({
        email: email,
        passwordDigest: hash
       }, cb);
    });
  });
};

userSchema.statics.encryptPassword = function (password) {
   var hash = bcrypt.hashSync(password, salt);
   return hash;
 };


userSchema.statics.authenticate = function(email, password, cb) {
  this.findOne({
     email: email
    },
    function(err, user) {
      console.log(user);
      if (user === null) {
        throw new Error("Username does not exist");
      } else if (user.checkPassword(password)){
        cb(null, user);
      }
  });
};

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;