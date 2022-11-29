const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const guestSchema = new mongoose.Schema({
    user:{
        type:String,
        
    },
    products:{
        type:Array
    }
})

module.exports = mongoose.model('Guest',guestSchema);