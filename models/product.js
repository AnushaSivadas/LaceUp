const mongoose = require('mongoose');

const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const productSchema = new mongoose.Schema({
    name:{
        type: String,
         
    },
    category:{
        type:ObjectId,       
        
    },
    subCategory:{
        type:ObjectId,       
        
    },
    discount:{
        type:Number
    },
    actualprice: {
        type: Number,
        
    },
    sellingprice: {
        type: Number,
        
    },
    stock: {
        type: Number,
       
    },
    images: [{
        url:String,
        filename:String
    }],
    description: {
        type:String,
        
    },
    reviews:[
        {
            type:ObjectId,
            ref:'Review'
        }
    ]
})

module.exports = mongoose.model('Product',productSchema);