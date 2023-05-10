const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

let bcrypt = require('bcrypt');

var User= new Schema;({
  username: {
        type: String, require: true
    },
  password: {
        type: String, require: true
    }
});

User.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next (err);
      this.password = hashed;
      next();
  });
} else {
    next();
  }
});
User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);