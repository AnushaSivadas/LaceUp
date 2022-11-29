const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
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
    subCategory:{
        type:ObjectId,       
        
    }
})

module.exports = mongoose.model('Banner',bannerSchema);