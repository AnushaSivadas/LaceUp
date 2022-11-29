const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        
    },
    image: {
        url:String,
        filename:String
    },
    description: {
        type:String,
        
    },
    offer:{
        discount:Number,
        valid_from:Date,
        valid_till:Date,
        status:Boolean,
        isExpired:Boolean
    }
})

module.exports = mongoose.model('Category',categorySchema);