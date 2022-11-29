const { ObjectId } = require("mongodb");
var objectId = require("mongodb").ObjectId;
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");

const Guest = require("../models/guest");
const Order = require("../models/order");
const userHelpers = require("./user-helpers");
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk')

paypal.configure({
  'mode' : 'sandbox',
  'client_id' : 'AbItc1rCeWExJ8b4DkA9V3qZQ2nNVc4R-9MW1hzOicUAxU3-8IO0-vJFcA-zbJ_qwGyG70iklw59Kpyc',
  'client_secret' : 'EHx8JrHD5o6PoZbnAALjXbhxOLcWIkMk-gcYPMZCg7ZyBWjKHApy2FXpLtjXvhFtVsXuZxii7JTGDCo4'
});

var instance = new Razorpay({
  key_id: 'rzp_test_uEQM9Ijif03z6w',
  key_secret: '0cpljPQqSyPHh8o83e7ph23V',
});


module.exports = {
  addToWishlist: (proId, userData) => {
    return new Promise(async (resolve, reject) => {
      let wishlistObj = await User.findByIdAndUpdate(
        userData._id,
        { $addToSet: { wishlist: objectId(proId) } },
        { new: true }
      );
      resolve(wishlistObj);
    });
  },

  getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await User.aggregate([
        {
          $match: { _id: objectId(userId) },
        },
        {
          $unwind: "$wishlist",
        },
        {
          $lookup: {
            from: "products",
            localField: "wishlist",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            products: { $arrayElemAt: ["$product", 0] },
          },
        },
      ]);

      resolve(wishlistItems);
    });
  },

  getWishlistCount: (userData) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      if (userData.wishlist) {
        count = userData.wishlist.length;
      }
      resolve(count);
    });
  },

  deleteWishlist: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      let del = await User.findByIdAndUpdate(userId,{ $pull: { wishlist: objectId(proId) } },{ new: true });
      resolve(del);
    });
  },

  removeWishlistItem: (details) => {
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ _id: objectId(details.user) },
                {
                    $pull: { wishlist: objectId(details.product)} 
                }
            ).then((response) => {
                resolve(response)
            })
    })
},

  inWishlist : (userData,proId)=>{
    return new Promise(async(resolve,reject)=>{
      // let wishlist=await User.findOne({_id:(userId),wishlist:{$in:[objectId(proId)]}})
      let index = userData.wishlist.findIndex(pro=> pro == (proId))
      console.log('wishlist index',index)
      resolve(index)
    })
  },

  allInWishlist : (userData,products)=>{
    return new Promise(async(resolve,reject)=>{
      
      for(let item of userData.wishlist){
        
        let index = products.findIndex(pro=>pro._id==item.toString())
        console.log('allProducts index',index)
        if(index!=-1)
        
        products[index].inWishlist=true
      }
      resolve(products)
    })
  },

  allInCart : (userId,products)=>{
    return new Promise(async(resolve,reject)=>{
      let userCart = await Cart.findOne({user:userId})
      for(let p of userCart.products){
        let index = products.findIndex(pro=>pro.products._id==p.item.toString())
        console.log('allProducts index',index)
        if(index!=-1)
        products[index].inCart=true
      }
      resolve(products)
    })
  },


  
  inCart : (userId,proId)=>{
    return new Promise(async(resolve,reject)=>{
      // let wishlist=await User.findOne({_id:(userId),wishlist:{$in:[objectId(proId)]}})
      let userCart = await Cart.findOne({user:userId})
      if(userCart){
      let index = userCart.products.findIndex(pro=> pro.item == (proId))
      console.log('cart index',index)
      resolve(index)
      }
      else{
        resolve(-1)
      }
      
    })
  },

  inGuestCart : (sessionId,proId)=>{
    return new Promise(async(resolve,reject)=>{
      // let wishlist=await User.findOne({_id:(sessionId),wishlist:{$in:[objectId(proId)]}})
      let guestCart = await Guest.findOne({user:sessionId})
      if(guestCart){
      let index = guestCart.products.findIndex(pro=> pro.item == (proId))
      console.log('guestcart index',index)
      resolve(index)
      }
      else{
        resolve(-1)
      }
    })
  },

  getCartCount: (userId) => {
      return new Promise(async (resolve, reject) => {
          let count = 0
          let cart = await Cart.findOne({user: objectId(userId) })
          if (cart) {
              count = cart.products.length
          }
          resolve(count)
      })
  },
  getGuestCartCount: (sessionId) => {
    return new Promise(async (resolve, reject) => {
        let count = 0
        let cart = await Guest.findOne({user: sessionId })
        if (cart) {
            count = cart.products.length
        }
        resolve(count)
    })
},

  addToCart:(proId,userId)=>{
      let proObj={
          item : ObjectId(proId),
          quantity:1
      }
      return new Promise(async(resolve,reject)=>{
        let [userCart] = await Cart.find({ user:objectId(userId) })
              if(userCart){
          
          let proExist = userCart.products.findIndex(products => products.item == proId)
                if (proExist != -1) {
                    await Cart.updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve()
                            })
                } else {
                    await Cart.updateOne( { user: objectId(userId)} ,
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve(response)
                        })
                }
        }
        else{
          let cartObj = {
            user: (objectId(userId)),
            products: [proObj]
        }
        const cart = new Cart(cartObj)
        await cart.save().then((response) => {
            resolve(response)
        })
        }

      })

   },

   addToGuestCart:(proId,sessionId)=>{
    let proObj={
        item : ObjectId(proId),
        quantity:1
    }
    return new Promise(async(resolve,reject)=>{
      let [guestCart] = await Guest.find({ user:sessionId })
            if(guestCart){
        
        let proExist = guestCart.products.findIndex(products => products.item == proId)
              if (proExist != -1) {
                  await Guest.updateOne({ user: sessionId, 'products.item': objectId(proId) },
                          {
                              $inc: { 'products.$.quantity': 1 }
                          }).then(() => {
                              resolve()
                          })
              } else {
                  await Guest.updateOne( { user: sessionId} ,
                          {
                              $push: { products: proObj }
                          }
                      ).then((response) => {
                          resolve()
                      })
              }
      }
      else{
        let cartObj = {
          user: sessionId,
          products: [proObj]
      }
      const guest = new Guest(cartObj)
      await guest.save().then((response) => {
          resolve()
      })
      }

    })

 },

  getCartProducts:(userId)=>{
      return new Promise(async(resolve,reject)=>{

          let cartItems = await Cart.aggregate([
              {
                  $match: { user: objectId(userId) }
              },

              {
                  $unwind: '$products'
              },
              {
                  $project: {
                      item: '$products.item',
                      quantity: '$products.quantity'
                  }
              },
              {
                  $lookup: {
                      from: "products",
                      localField: 'item',
                      foreignField: '_id',
                      as: 'product'
                  }
              },
              {
                  $project: {
                      item: 1, quantity: 1, product : { $arrayElemAt: ['$product', 0] }
                  }
              },
            
              
          ])
          resolve(cartItems)
      })
  },

  getGuestCartProducts:(sessionId)=>{
    return new Promise(async(resolve,reject)=>{

        let cartItems = await Guest.aggregate([
            {
                $match: { user: sessionId }
            },

            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, product : { $arrayElemAt: ['$product', 0] }
                }
            }
        ])
        
        resolve(cartItems)
    })
},

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise(async(resolve,reject)=>{
      if(details.count==-1 && details.quantity==1){
        Cart.updateOne({_id:objectId(details.cart)},
        {
          
          $pull:{products:{item:objectId(details.product)}}

        }).then((response)=>{
          resolve({removeProduct:true})
        })
      }
      else{
        Cart.updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
      {
          $inc: { 'products.$.quantity': details.count }
      }).then((response) => {
          resolve({status:true})
      })
      }
       
    })
   
  },

  changeGuestProductQuantity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise(async(resolve,reject)=>{
      if(details.count==-1 && details.quantity==1){
        Guest.updateOne({_id:details.cart},
        {
          
          $pull:{products:{item:objectId(details.product)}}

        }).then((response)=>{
          resolve({removeProduct:true})
        })
      }
      else{
        Guest.updateOne({ _id: details.cart, 'products.item': objectId(details.product) },
      {
          $inc: { 'products.$.quantity': details.count }
      }).then((response) => {
          resolve({status:true})
      })
      }
       
    })
   
  },
  removeCartItem: (details) => {
    return new Promise(async (resolve, reject) => {
       Cart.updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
            ).then((response) => {
                resolve(response)
            })
    })
},

findSavedItem : (userId,proId)=>{
  return new Promise((resolve,reject)=>{
    Cart.findOne({user:userId,'savedforlater.item':proId}).then((response)=>{
      resolve(response)
    })
  })
},

removeSavedItem: (details) => {
  return new Promise( (resolve, reject) => {
     Cart.updateOne({ _id: objectId(details.cart) },
              {
                  $pull: { savedforlater: { item: objectId(details.product) } }
              }
          ).then((response) => {
              resolve(response)
          })
  })
},

removeSavedItemCart: (userId,proId) => {
  return new Promise(async (resolve, reject) => {
     Cart.updateOne({ user: objectId(userId) },
              {
                  $pull: { savedforlater: { item: objectId(proId) } }
              }
          ).then((response) => {
              resolve(response)
          })
  })
},

removeGuestCartItem: (details) => {
  return new Promise(async (resolve, reject) => {
     Guest.updateOne({ _id: details.cart },
              {
                  $pull: { products: { item: objectId(details.product) } }
              }
          ).then((response) => {
              resolve(response)
          })
  })
},

addToSaveForLater: ((userid, productid, qty) => {

  return new Promise(async (resolve, reject) => {
      let userCart = await Cart.findOne({ user: objectId(userid) })

      let proObj = {
          item: objectId(productid),
          quantity: qty
      }
          await Cart.updateOne({ user: objectId(userid) },
              {
                  $push: { savedforlater: proObj }
              }
          ).then((response) => {
              resolve()
          })
      
  })
}),

addProductsToCartFromSaved: ((userid, productid, qty) => {
  return new Promise(async (resolve, reject) => {
     
      let proObj = {
          item: objectId(productid),
          quantity: qty
      }
      
          await Cart.updateOne({ user: objectId(userid) },
              {
                  $push: { products: proObj }
              }
          ).then((response) => {
              resolve()
          })
      
  })
}),

getSavedForLater: (userId) => {
  return new Promise(async (resolve, reject) => {

      let cartItems = await Cart.aggregate([
          {
              $match: { user: objectId(userId) }
          },

          {
              $unwind: '$savedforlater'
          },
          {
              $project: {
                  item: '$savedforlater.item',
                  quantity: '$savedforlater.quantity'
              }
          },
          {
              $lookup: {
                  from: "products",
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
              }
          },
          {
              $project: {
                  item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
              }
          }
      ])

      resolve(cartItems)
  })
},

getTotalAmount : (userId)=>{
  return new Promise(async(resolve,reject)=>{

    let total = await Cart.aggregate([
        {
            $match: { user: objectId(userId) }
        },

        {
            $unwind: '$products'
        },
        {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity'
            }
        },
        {
            $lookup: {
                from: "products",
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product : { $arrayElemAt: ['$product', 0] }
            }
        },
        {
          $group:{
            _id:null,
            subTotal:{$sum:{$multiply:['$quantity','$product.actualprice']}},
            totalAmount:{$sum:{$multiply:['$quantity','$product.sellingprice']}}
          }
        }
    ])
   
    resolve(total[0])
})

},

getGuestTotalAmount : (sessionId)=>{
  return new Promise(async(resolve,reject)=>{

    let total = await Guest.aggregate([
        {
            $match: { user: sessionId }
        },

        {
            $unwind: '$products'
        },
        {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity'
            }
        },
        {
            $lookup: {
                from: "products",
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product : { $arrayElemAt: ['$product', 0] }
            }
        },
        {
          $group:{
            _id:null,
            subTotal:{$sum:{$multiply:['$quantity','$product.actualprice']}},
            totalAmount:{$sum:{$multiply:['$quantity','$product.sellingprice']}}
          }
        }
    ])
   
    resolve(total[0])
})

},


razorpayCreateOrder : (userData,order,products,total,couponApplied)=>{
  return new Promise(async(resolve,reject)=>{
    let couponDiscount = couponApplied ? couponApplied.amount_off : null

    let index = await userHelpers.getAddressIndex(userData,order.address) 
    let location = userData.address[index]
    for(const element of products) {
      element.status = "confirmed";
      element.orderedDate = new Date(),
      element.confirmedDate = new Date(),
      element.deliveryDate = new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
 }
    let orderObj = {
      _id:objectId(),
      deliveryDetails:location,
      userId:objectId(order.userId),
      paymentMethod:order.payment,
      products:products,
      totalAmount:total.totalAmount,
      placedDate:new Date(),
      couponDiscount:couponDiscount
    }
  console.log("orderobj",orderObj)
    resolve(orderObj)
  })

},

razorpayPlaceOrder : (order,sessionId)=>{
  return new Promise(async(resolve,reject)=>{
    let orders = new Order(order)   
    await orders.save().then(async(response) => {
      for(var i=0;i<order.products.length;i++){
      let upd=await Cart.updateOne({user:order.userId},
        {
          $pull:{'products':{'item':order.products[i].item}}
        })
      }
    let delGuest = await Guest.deleteOne({user:sessionId})

        resolve()
    })
  })
},


placeOrder : (userData,order,products,total,couponApplied)=>{
    return new Promise(async(resolve,reject)=>{

    
    let deliveryDate=order.payment==='cod' || 'wallet'? new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10) : null
    let couponDiscount = couponApplied ? couponApplied.amount_off : null
    if(order.payment==='wallet'){
      await User.findByIdAndUpdate(userData._id,{
        $inc:{
          "wallet":-total.totalAmount
        }
      })
    }
    let index = await userHelpers.getAddressIndex(userData,order.address) 
    let location = userData.address[index]
    for(const element of products) {
      element.status = "confirmed";
      element.orderedDate = new Date(),
      element.confirmedDate = new Date(),
      element.deliveryDate = deliveryDate
 }
    let orderObj = {
      deliveryDetails:location,
      userId:order.userId,
      paymentMethod:order.payment,
      products:products,
      totalAmount:total.totalAmount,
      placedDate:new Date(),
      couponDiscount:couponDiscount
    }
 
    let orders = new Order(orderObj)
   
    await orders.save().then(async(response) => {
      for(var i=0;i<products.length;i++){
      let upd=await Cart.updateOne({user:order.userId},
        {
          $pull:{'products':{'item':products[i].item}}
        })
        await Product.updateMany({_id:products[i].item},
          {
            $inc:{
              stock:-products[i].quantity
            }
          })
      }
        resolve(orders._id)
    })
    
  })
   
},


generateRazorpay : (orderId,totalAmount)=>{
  return new Promise((resolve,reject)=>{
    try{
      instance.orders.create({
      amount: totalAmount*100  ,
      currency: "INR",  
      receipt: ""+orderId,
      notes: {
        key1: "value3",
        key2: "value2"
      }
    },(err,order)=>{
      if (err) {
        reject(err)
    } else {
        resolve(order)
    }
    })
  }
  catch(error){
    reject(error)
  }
  })
},

generatePaypal: (orderId, totalPrice) => {
  parseInt(totalPrice).toFixed(2)
    return new Promise(async (resolve, reject) => {
      const create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "http://localhost:3000/success",
              "cancel_url": "http://localhost:3000/cancel"
          },
          "transactions": [{
              "item_list": {
                  "items": [{
                      "name": "Red Sox Hat",
                      "sku": "001",
                      "price": totalPrice,
                      "currency": "USD",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "USD",
                  "total": totalPrice
              },
              "description": "Hat "
          }]
      };

      console.log(create_payment_json)
      let data = paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              console.log(error, 'error ahda kuta');
              throw error;
          } else {
              console.log('payment ayiiii');
              resolve(payment)
          }
      })

  })
},

changePaymentStatusPaypal: (orderId) => {
  return new Promise(async (resolve, reject) => {
      await Order.updateOne({_id:orderId,'products.status':'pending'},
      {
        $set:{
          
          'products.$[].status':'confirmed', 
          'products.$[].confirmedDate':new Date(),
          'products.$[].deliveryDate':new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
        }
      }).then(() => {
          resolve()
      })
  })
},

verifyPayment : (details)=>{
  return new Promise((resolve, reject) => {
    const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256', '0cpljPQqSyPHh8o83e7ph23V')
    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex')
    if (hmac == details['payment[razorpay_signature]']) {
        resolve()
    } else {
        reject()
    }
})
},

changePaymentStatus : (orderId)=>{
  return new Promise(async(resolve,reject)=>{
    await Order.updateOne({_id:orderId,'products.status':'pending'},
      {
        $set:{
          
          'products.$[].status':'confirmed', 
          'products.$[].confirmedDate':new Date(),
          'products.$[].deliveryDate':new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
        }
      }).then(()=>{
        resolve()
      })
  })
},

putToCart :(product,userId,guestId)=>{
  
  return new Promise(async(resolve,reject)=>{
    let [userCart] = await Cart.find({ user:objectId(userId) })
   
    if(userCart){
      for(var i=0;i<product.length;i++){
       
      let proExist = userCart.products.findIndex(prod => prod.item == product[i].item.toString())
      console.log(proExist)
            if (proExist != -1) {
                await Cart.updateOne({ user: objectId(userId), 'products.item': product[i].item },
                        {
                            $set: { 'products.$.quantity': product[i].quantity }
                        }).then(() => {
                            resolve()                  
                        })
            } else {
                await Cart.updateOne( { user: objectId(userId)} ,
                        {
                            $push: { products: product[i] }
                        }
                    ).then((response) => {
                        resolve()
                    })
            }
          }
    }
    else{
      let cartObj = {
        user: (objectId(userId)),
        products: product
    }
    
    const cart = new Cart(cartObj)
    await cart.save() .then((response) => {
      resolve()
  })
    
    }
    // await Guest.findByIdAndDelete(guestId)
   
  })

},

changeOrderStatus : (details)=>{
  return new Promise(async(resolve,reject)=>{
    
    if(details.status=="cancelled"){
      let order = await Order.findById(details.orderId)
      
      if(order.paymentMethod!="cod"){
    let index = order.products.findIndex(pro => pro.item == details.proId)
    let proTotal =  (order.products[index].product.sellingprice*order.products[index].quantity)
    if(order.couponDiscount){
      let couponDis= (order.couponDiscount/(order.totalAmount+order.couponDiscount))*100
      proTotal = Math.floor(proTotal-(proTotal*couponDis)/100)
    }
    await User.findByIdAndUpdate(order.userId,{
        $inc:{
            "wallet":proTotal
        }
    }) 
}
       await Order.updateOne({_id:objectId(details.orderId),'products.item':objectId(details.proId)},
       {
           $set:{
               'products.$.status':details.status,
               'products.$.cancelledDate':new Date(),
              //  totalAmount:newTotal
           },
           
       },{new:true}).then((response)=>{
           resolve({cancelled:true})
       })
}else if(details.status=="returncancelled"){

  await Order.updateOne({_id:objectId(details.orderId),'products.item':objectId(details.proId)},
  {
      $set:{
          'products.$.status':details.status,
          'products.$.returnCancelledDate':new Date(),
      },
      
  },{new:true}).then((response)=>{
      resolve({returnCancelled:true})
  })
}
else{
  await Order.updateOne({_id:objectId(details.orderId),'products.item':objectId(details.proId)},
  {
      $set:{
          'products.$.status':'returnrequest',
          'products.$.returnRequestDate':new Date(),
          'products.$.returnReason':details.reason,
          'products.$.returnComments':details.comments,

      },
      
  },{new:true}).then((response)=>{
      resolve(response)
  })
}
    
  })

},


removeCartItemStock: ((userId,proId) => {
        return new Promise(async (resolve, reject) => {

            Cart.updateOne({ user: ObjectId(userId) },
                {
                    $pull: { products: { item: ObjectId(proId) } }

                }).then((response) => {
                    resolve(response)
                })
        })
    }),


    guestRemoveCartItemStock: ((userId,proId) => {
      return new Promise(async (resolve, reject) => {

          Guest.updateOne({ user: userId },
              {
                  $pull: { products: { item: ObjectId(proId) } }

              }).then((response) => {
                  resolve(response)
              })
      })
  }),


doAddproductsToCartStock: ((userid, productid,qty) => {
        return new Promise(async (resolve, reject) => {
            let proObj = {
                item: ObjectId(productid),
                quantity: qty
            }
                
                    await Cart.updateOne({ user: ObjectId(userid) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
        })
    }),




};
