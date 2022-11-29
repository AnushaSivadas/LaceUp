const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const cartSchema = new mongoose.Schema({
    user:{
        type: ObjectId,
         ref: 'users',
         required: [true,'No user id found']
    },
    products:[{
        item:ObjectId,
        quantity:Number
     }],
    savedforlater:[{
       item:ObjectId,
       quantity:Number
    }]
})

module.exports = mongoose.model('Cart',cartSchema);