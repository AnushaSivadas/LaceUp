const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({

    referrer_offer : {
        type:Number,
        default:0
    },
    referee_offer : {
        type:Number,
        default:0
    }
    
})

module.exports = mongoose.model('Referral',referralSchema);