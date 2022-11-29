const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema({
    username:{
        type: String,
       
    },
    email:{
        type:String,
        
    },
    password: {
        type: String,
        
    },
    phno: {
        type: Number,
        
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    wishlist:{
        type:Array
    },
    address: [
        {
            fullname:String,
            phoneno: Number,    
            pincode: Number,
            locality: String,
            address_line: String,
            city_district_town: String,
            state: String,
            landmark: String,
            alt_phoneno: Number,
            addresstype:String
        }],
    wallet:{
        type:Number,
        default:0
    },
    referral:{
         type:String,
    },
    referral_code:{
        type:String,
    },
    referred_count:{
        type:Number,
        default:0
    },
    dp: {
        filename:String
    },

},{
    timestamps:true
})

module.exports = mongoose.model('User',userSchema);