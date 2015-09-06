// why require these in this file?
// bcrypt because we don't need it anywhere else
// re: mongoose, because we're defining a schema; need mongoose for that
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
    index: {
      unique: true
    }
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  passwordDigest: {
    type: String,
    required: true
  }
});

// Static methods operate at the class level
// this refers to userSchema
userSchema.statics.createSecure = function (user_params, cb) {
  // saves the user email and hashs the password
  var _this = this;
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(user_params.password, salt, function (err, hash) {
      _this.create({
        email: user_params.email,
        firstName: user_params.first,
        lastName: user_params.last,
        passwordDigest: hash
       }, cb);  // cb = function(err, user)
    });
  });
};

userSchema.statics.encryptPassword = function (password) {
  var hash = bcrypt.hashSync(password, salt);
  return hash;
};

userSchema.statics.authenticate = function (user_params, cb) {
  this.findOne({email: user_params.email}, function (err, found_user) {
    console.log('Found user: ', found_user);
    if (found_user === null) {  // no user found
      cb('No account associated with that email address', null);
    } else if (found_user.checkPassword(user_params.password)) {  // password matches
      console.log('Authenticated user (in userSchema.statics.authenticate): ', found_user);
      cb(null, found_user);
    } else {  // bad password
      cb('Password does not match', null);
    }
  });
};

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordDigest);
};

var User = mongoose.model("User", userSchema);

module.exports = User;
