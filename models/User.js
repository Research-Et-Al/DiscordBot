const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: "string",
  id: "string",
  wishlist: "array",
  blogs: "array",
  // xp : "number",
  // level : "number",
});
const User = mongoose.model("User", schema);
module.exports = User;
