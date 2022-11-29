const bcrypt = require("bcrypt");
const Referral = require('../models/referral')
const Order = require("../models/order");
const User = require("../models/user");
const ObjectId = require('mongoose').Types.ObjectId;
let referralCodeGenerator = require('referral-code-generator')

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let { username, email, phno, password ,referral,referral_code,wallet} = userData;
      referral_code=referralCodeGenerator.custom('lowercase', 3, 6,username);
      const useremailexist = await User.findOne({ email });
      const userphnoexist = await User.findOne({ phno });
      if (useremailexist) {
      let err="Email Already Exists!"
        reject(err)
      } else if (userphnoexist) {
        let err="Phone Number Already Exists!"
        reject(err)
      } else {
        
        if(referral){
          let referralCheck = await User.findOne({referral_code:referral})
          let referralOffers = await Referral.findOne()
          const { referrer_offer, referee_offer } = referralOffers
          if(referralCheck){
            await User.findByIdAndUpdate(referralCheck._id,{
              $inc : {
                "referred_count":1,
                "wallet":referrer_offer
              }
            })
          wallet = referee_offer
          password = await bcrypt.hash(password, 10);
        const user = new User({username,  email,  phno,  password, referral, referral_code,wallet});
        user.dp.filename="profileavatar.png"
        await user.save().then((data) => {
          resolve(data);
        });
          }
          else{
            let err="Invalid Referral Code"
            reject(err)
          }
        }
        password = await bcrypt.hash(password, 10);
        const user = new User({username,  email,  phno,  password, referral_code});
        user.dp.filename="profileavatar.png"
        await user.save().then((data) => {
          resolve(data);
        });
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = userData;
      const user = await User.findOne({ email });
      if (user) {
        bcrypt.compare(password, user.password).then((data) => {
          if (data) resolve(user);
          else 
          reject("Invalid Password!");
        });
      } else {
        reject("Invalid Email Id!");
      }
    });
  },
  doBlock: (id) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findById(id);
      if (user.isBlocked) {
        const userUnblock = await User.findByIdAndUpdate(
          id,
          { isBlocked: false },
          { new: true }
        );
        resolve(userUnblock);
      } else {
        const userBlock = await User.findByIdAndUpdate(
          id,
          { isBlocked: true },
          { new: true }
        );
        resolve(userBlock);
      }
    });
  },
 

  changeProPic : (file,userId)=>{
    return new Promise(async(resolve,reject)=>{
      await User.findByIdAndUpdate(userId,
        {
          $set:{
            'dp.filename':file.filename
          }
        }).then((data)=>{
          resolve(data)
        })
    })
  },

  addAddress : (details,userId)=>{
    return new Promise(async(resolve,reject)=>{
      const address = await User.findByIdAndUpdate(userId,{
        $addToSet:{address:details}},{new:true})
        resolve(address)
    })
  },

  getAddressIndex : (user,addressId)=>{
      return new Promise(async(resolve,reject)=>{
        let index = user.address.findIndex(address => address._id == addressId)
        resolve(index)
      })
  },

  editAddress : (details,userId,addressId)=>{
    return new Promise(async(resolve,reject)=>{
     const editedAddress = await User.updateOne({_id:userId,'address._id':addressId},
      {
        $set:{'address.$':details}
      },{new:true})
      resolve(editedAddress)
    })
  },

  deleteAddress : (userId,addressId)=>{
    return new Promise(async(resolve,reject)=>{
      const deleteAddress = await User.findByIdAndUpdate(userId,
        {
          $pull:{address:{_id:addressId}}
        },{new:true})
      resolve(deleteAddress)
    })
  },

  changeUsername : (newUsername,userId)=>{
    return new Promise(async(resolve,reject)=>{
      let name = await User.findByIdAndUpdate(userId,
        {
          $set:{username:newUsername}
        })
        resolve(name)
    })
  },

  checkPassword : (password,userData)=>{
    return new Promise(async (resolve, reject) => {
      console.log(userData)
        bcrypt.compare(password, userData.password).then((data) => {
          if (data)
           resolve(data);
          else
           resolve();
        });
      
    });
  },
 
  changePassword : (newpassword,userData)=>{
    return new Promise(async(resolve,reject)=>{
      newpassword = await bcrypt.hash(newpassword, 10);
      let hash = await User.findByIdAndUpdate(userData._id,{
        password:newpassword
      },{new:true})
      console.log(hash)
      resolve(hash)
    })
  },

  getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders = await Order.find({userId:userId}).sort({_id:-1})
      resolve(orders)
    })
  },

 confirmUser:(userData)=>{
  return new Promise(async (resolve, reject) => {
    const { email, password } = userData;
    const user = await User.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password).then(async(data) => {
        if (data){
          const deactive=await User.findByIdAndDelete(user._id)
           resolve(deactive);}
        else reject("Invalid Password!");
      });
    } else {
      reject("Invalid Email Id!");
    }
  });
 }
 
};
