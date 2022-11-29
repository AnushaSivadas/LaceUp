const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const orderSchema = new mongoose.Schema({
   deliveryDetails:Object,
   userId:ObjectId,
   paymentMethod:String,
   products:Array,
   totalAmount:Number,
   placedDate:Date,
   couponDiscount:Number  
})

module.exports = mongoose.model('Order',orderSchema);