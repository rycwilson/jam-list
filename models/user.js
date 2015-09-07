/*
  User model
*/
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

var UserSchema = new mongoose.Schema({
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

/*
  Static methods operate at the class level
  this points to UserSchema
*/
UserSchema.statics.createSecure = function (user, cb) {
  // create the user account, hash the password
  // cb = function(err, newUser)
  var _this = this;
  bcrypt.genSalt(function (saltErr, salt) {
    if (saltErr) { return cb(saltErr, null); }
    bcrypt.hash(user.password, salt, function (hashErr, hash) {
      if (hashErr) { return cb(hashErr, null); }
      _this.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordDigest: hash
      }, cb);
    });
  });
};

// UserSchema.statics.encryptPassword = function (password) {
//   var hash = bcrypt.hashSync(password, salt);
//   return hash;
// };

UserSchema.statics.authenticate = function (user, cb) {
  this.findOne({ email: user.email }, function (err, foundUser) {
    if (!foundUser) {
      return cb('No account associated with that email address', null);
    } else if (foundUser.checkPassword(user.password)) {
      return cb(null, foundUser);
    } else {  // bad password
      return cb('Invalid password', null);
    }
  });
};

UserSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordDigest);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
