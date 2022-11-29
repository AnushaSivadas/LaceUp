const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    
    email:{
        type:String,
        requried: [true, 'Email Id cannot be blank']
    },
    password: {
        type: String,
        requried: [true, 'Password cannot be blank']
    }
})

module.exports = mongoose.model('Admin',adminSchema);