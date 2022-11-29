const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name:{
        type: String,
        
    },
    image: {
        url:String,
        filename:String
    },
    description: {
        type:String,
        
    }
})

module.exports = mongoose.model('Subcategory',subCategorySchema);