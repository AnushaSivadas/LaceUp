const Referral = require('../models/referral')
const Coupon = require('../models/coupon')
const Category = require('../models/category')
const ObjectId = require('mongoose').Types.ObjectId;


module.exports={

   
    editReferrals : (referralData)=>{
        return new Promise(async(resolve,reject)=>{
        const { referrer_offer: refOffer, referee_offer: refreOffer } = referralData
        let refData = {
            "referrer_offer": refOffer,
            "referee_offer": refreOffer
        }
        let referralCheck = await Referral.findOne()
        if(referralCheck){
        Referral.findByIdAndUpdate(referralCheck._id,
            {
                $set:{
                    "referrer_offer": refOffer,
                    "referee_offer": refreOffer
                }
            }).then((data)=>{
            resolve(data)
            }).catch((err)=>{
            reject(err)            
        })
        }else{
           const referral = new Referral(refData)
            await referral.save().then((data)=>{
                 resolve(data)   
            }).catch((err)=>{
                reject(err)
            })
        }
    })
},

createCoupon : (couponData)=>{
    return new Promise(async (resolve,reject)=>{
        const { coupon_code, amount_off, minimum_purchase } = couponData
        let couponCheck = await Coupon.findOne({ "coupon_code": coupon_code })
        if (couponCheck) {
            reject("Coupon code already exist")
        } else {
           
            const coupon = new Coupon(couponData)
            await coupon.save().then((data)=>{
                 resolve(data)   
            }).catch((err)=>{
                reject(err)
            })
        }

    })
},

editCoupon : (couponData,couponId)=>{
    return new Promise(async (resolve, reject) => {
       
           
            let couponCheck = await Coupon.findOne({ _id: { $ne: couponId }, "coupon_code": couponData.coupon_code })
            if (couponCheck) {
                let err = 'Coupon code already exist'
                reject(err)
            } else {
                await Coupon.findByIdAndUpdate(couponId,couponData).then(() => {
                        resolve()
                    }).catch((err) => {
                        err = "something went wrong"
                        reject(err)
                    })
                }
    })
},

deleteCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndDelete(couponId).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
},



getAllCoupons : ()=>{
    return new Promise(async(resolve,reject)=>{
        let currentDate = new Date()
       
        await Coupon.find().then(async(couponData)=>{
            for(let data of couponData){
                
                if(data.valid_till <= currentDate){
                    await Coupon.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                "status":false,
                                "isExpired":true,
                            }
                        })
                    data.status=false
                    data.isExpired=true

                }
                else if(data.valid_till >= currentDate){
                    await Coupon.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                
                                "isExpired":false,
                            }
                        })
                   
                    data.isExpired=false
                }
                data.validfrom=data.valid_from.toLocaleDateString()
                data.validtill=data.valid_till.toLocaleDateString()
            }
            
            resolve(couponData)
        }).catch((err)=>{
            reject(err)
        })
    })
},

enableCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndUpdate(couponId,
                {
                    $set: { "status": true }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        } catch (err) {
            reject(err)
        }
    })

},

disableCoupon: (couponId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Coupon.findByIdAndUpdate(couponId, 
            {
                $set: { "status": false }
            }).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })

},

getCoupons: () => {
    return new Promise(async(resolve, reject) => {
        try {
            let currentDate =new Date()
           await Coupon.find().then(async(couponData) => {
                for (let data of couponData) {
                    if (data.valid_till <= currentDate) {
                        await Coupon.findByIdAndUpdate(data._id,
                            {
                                $set: {
                                    "status": false,
                                    "isExpired": true
                                }
                            })
                    }
                }
               await Coupon.find({ status: true }).then((coupons) => {
                    resolve(coupons)
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => { reject(err) })
        } catch (err) {
            reject(err)
        }
    })
},

couponOncedUsed :(userId,couponId)=>{
    return new Promise(async (resolve,reject)=>{
        await Coupon.findByIdAndUpdate(couponId,
            {
                $addToSet: { users: userId} 
            }).then((response)=>{
           resolve(response)
        })
   })
},

getCouponDetails : (couponCode)=>{
    return new Promise(async (resolve,reject)=>{
         await Coupon.findOne({coupon_code:couponCode,status:true,isExpired:false}).then((response)=>{
            resolve(response)
         })
    })
},

getAllOffCategory : ()=>{
    return new Promise(async(resolve,reject)=>{
        let currentDate = new Date()
       
        await Category.find({offer:{$exists:true}}).then(async(catOffData)=>{
            for(let data of catOffData){
                
                if(data.offer.valid_till <= currentDate){
                    await Category.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                "offer.status":false,
                                "offer.isExpired":true,
                            }
                        })
                    data.offer.status=false
                    data.offer.isExpired=true

                }
                else if(data.offer.valid_till >= currentDate){
                    await Category.findByIdAndUpdate(data._id,
                        {
                            $set:{
                                
                                "offer.isExpired":false,
                            }
                        })
                   
                    data.offer.isExpired=false
                }
                data.offer.validfrom=data.offer.valid_from.toLocaleDateString()
                data.offer.validtill=data.offer.valid_till.toLocaleDateString()
            }
            
            resolve(catOffData)
        }).catch((err)=>{
            reject(err)
        })
    })
},

enableCatOff: (catId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Category.findByIdAndUpdate(catId,
                {
                    $set: { "offer.status": true }
                }).then(() => {
                    resolve()
                }).catch((err) => {
                    reject(err)
                })
        } catch (err) {
            reject(err)
        }
    })

},

disableCatOff: (catId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Category.findByIdAndUpdate(catId, 
            {
                $set: { "offer.status": false }
            }).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })

},

addCategoryOffer : (offerData) => {
    return new Promise(async (resolve, reject) => {
    offerData.status=true
    offerData.isExpired=false
     await Category.findByIdAndUpdate(ObjectId(offerData.category), {offer:offerData}, { new: true }).then((data)=>{
        resolve(data)
     })      
       
    });

},

editCatOff : (catData,catId)=>{
    return new Promise(async (resolve, reject) => {
        await Category.findByIdAndUpdate(ObjectId(catId), {offer:catData}, { new: true }).then((data)=>{
            resolve(data)
         })  .catch((err) => {
                        err = "something went wrong"
                        reject(err)
                    })
                
    })
},

deleteCatOff: (catId) => {
    return new Promise(async(resolve, reject) => {
        try {
            await Category.findByIdAndUpdate(catId,
                {
                    $unset:{offer:''}
                }).then((data) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
},


}
