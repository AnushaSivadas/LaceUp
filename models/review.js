


const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
   review:String,
   rating:Number,
})
module.exports = mongoose.model('Review', ReviewSchema)