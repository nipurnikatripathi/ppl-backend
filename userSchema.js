// userSchema : for registration page
// values of user object in registeration component is save in the same order as present in userSchema
var mongoose = require("mongoose");
var userSchema = mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    email: { type: String },
    firstName: { type: String },
    lastName: { type: String },
  },
  { versionKey: false }
);
module.exports = mongoose.model("signupppl", userSchema);
// collection name in backend : "signupppl"
