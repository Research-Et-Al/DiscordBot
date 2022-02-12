const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: 'string', id: 'string' , wishlist: 'array'});
const User = mongoose.model('User', schema);
module.exports = User;