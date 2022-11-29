const Admin = require("../models/admin");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const { ObjectId } = require("mongodb");
var objectId = require("mongodb").ObjectId;
var moment= require('moment');
const { findById } = require("../models/order");

module.exports={
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
          const { email, password } = adminData;
          const admin = await Admin.findOne({ email });
          if (admin) {
            if (password === admin.password) {
              resolve(admin);
            }
             else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      },

      getAllTheOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await Order.find().sort({placedDate:-1})
            resolve(orders)
        })
      },

      changeOrderStatus : (details)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('hey buddy',details)
            if(details.status=="confirmed"){
                
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.confirmedDate':new Date(),
                            'products.$.deliveryDate':new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }
            else if(details.status=="shipped"){
               
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.shippedDate':new Date(),
                           
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }
            else if(details.status=="outfordelivery"){
                
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                    {
                        $set:{
                            'products.$.status':details.status,
                            'products.$.outfordeliveryDate':new Date(),
                        }
                    },{new:true}).then((response)=>{
                        resolve(response)
                    })
            }else if(details.status=="delivered"){
           
                await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
                {
                    $set:{
                        'products.$.status':details.status,
                        'products.$.deliveredDate':new Date(),
                    }
                },{new:true}).then((response)=>{
                    resolve(response)
                })
         }
         else if(details.status=="returnapproved"){
           
            await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
            {
                $set:{
                    'products.$.status':details.status,
                    'products.$.returnApprovedDate':new Date(),
                }
            },{new:true}).then((response)=>{
                resolve(response)
            })
     }
     else if(details.status=="returnpickuped"){
           
        await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.returnPickupedDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
 }else if(details.status=="refunddone"){
    let order = await Order.findById(details.order)
    let index = order.products.findIndex(pro => pro.item == details.product)
           
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
    await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
    {
        $set:{
            'products.$.status':details.status,
            'products.$.refundDoneDate':new Date(),
        }
    },{new:true}).then((response)=>{
        resolve(response)
    })
}else if(details.status=="returncancelledbyadmin"){
           
    await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
    {
        $set:{
            'products.$.status':details.status,
            'products.$.returnCancelledByAdminDate':new Date(),
        }
    },{new:true}).then((response)=>{
        resolve(response)
    })
}

     else{
        let order = await Order.findById(details.order)
      
      if(order.paymentMethod!="cod"){
    let index = order.products.findIndex(pro => pro.item == details.product)
           
    let proTotal =  (order.products[index].product.sellingprice*order.products[index].quantity)
    if(order.couponDiscount){
        let couponDis= (order.couponDiscount/(order.totalAmount+order.couponDiscount))*100
        proTotal = Math.floor(proTotal-(proTotal*couponDis)/100)
  
      }    await User.findByIdAndUpdate(order.userId,{
        $inc:{
            "wallet":proTotal
        }
    }) 
}
        await Order.updateOne({_id:objectId(details.order),'products.item':objectId(details.product)},
        {
            $set:{
                'products.$.status':details.status,
                'products.$.cancelledbyadminDate':new Date(),
            }
        },{new:true}).then((response)=>{
            resolve(response)
        })
 }
        })
    
      },

      getUsersCount : ()=>{
        return new Promise(async(resolve,reject)=>{
          let usersCount = await User.count()
          resolve(usersCount)
        })
      },
      getProductsCount: () => {
        return new Promise(async (resolve, reject) => {
            let productsCount = await Product.count()
            resolve(productsCount)
        })
    },

    getOrdersCount: () => {
        return new Promise(async (resolve, reject) => {
            let ordersCount = await Order.find({ status: { $ne: "cancelled" } }).count()
            resolve(ordersCount)
        })
    },

    getTotalAmountOrders: () => {
      return new Promise(async (resolve, reject) => {
       
          let total = await Order.aggregate([
              {
                  $match: { 'products.status': 'delivered' }
              },
              {
                  $project: {
                      _id: 0,
                      total: '$totalAmount'
                  }
              },
              {
                  $group: {
                      _id: null,
                      total: { $sum: '$total' }
                  }
              }
          ])
          resolve(total[0].total)
        
      })
   
  },
 
getReport : ()=>{
    return new Promise(async (resolve, reject) => {
        let dailyCodCount=0
        let dailyPaypalCount=0
        let dailyRazorCount=0
        const totalSales = await Order.find({ "products.status": { $eq: "delivered" } })       
        for (let x of totalSales) {
          
            
            x.paymentMethod === 'cod' ? dailyCodCount++ : (x.paymentMethod === 'razorpay' ? dailyRazorCount++ : dailyPaypalCount++)
         
        }
        let details={
            dailyCodCount,dailyPaypalCount,dailyRazorCount
        }
        resolve(details)
    })
},





findorderbycat: () => {
    return new Promise(async (resolve, reject) => {
        let data = await Order.aggregate([
            {
                $match: {
                    placedDate: {
                        $gte: new Date(new Date().getMonth() - 10)
                    },
                    "products.status": "delivered" 
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'pro'
                }
            },
            {
                $unwind: '$pro'
            },
            {
                $project: {
                    cat: '$pro.category'
                }
            },
            {
                $group: {
                    _id: '$cat',
                    count: { $sum: 1 },
                    detail: { $first: "$$ROOT" }
                }
            },
            {
                $sort: { detail: -1 }
            }
        ])
      
        let cattt=[]
        let i=0
        for(let item of data){            
                cattt[i] = await Category.findById(item.detail.cat)
                item.detail.cat=cattt[i].name
           i++
        }        
        resolve(data)
    })
},



// salesReport 


dailyReport:()=>{
    return new Promise((resolve, reject) =>{
     Order.aggregate([
        {$match:{
           placedDate:{
            //    $gte: new Date(new Date().getDate() -7 )
            $gte: new Date(new Date().getDate()-5)

            //  $gte: new Date(new Date() - 7 * 7 * 60 * 60 * 24 * 1000 )

           }
        }},
    
        {
            $project:{
                year:{$year:'$placedDate'},
                month: { $month: "$placedDate" },
                day: { $dayOfMonth: "$placedDate" },
                dayOfWeek: { $dayOfWeek: "$placedDate" },
                week: { $week: "$placedDate" },
                date:{$toDate:"$placedDate" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{day:'$day'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:-1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ])
  
    .then((data)=>{resolve(data)})
   
    })
    
},


monthlyReport:()=>{
    return new Promise((resolve, reject) =>{
     Order.aggregate([
       
        {$match:{
           placedDate:{

                 $gte: new Date(new Date().getMonth-5)
 
        }
        }},
    
        {
            $project:{
                year:{$year:'$placedDate'},
                month: { $month: "$placedDate" },
                day: { $dayOfMonth: "$placedDate" },
                dayOfWeek: { $dayOfWeek: "$placedDate" },
                week: { $week: "$placedDate" },
                date:{$toDate:"$placedDate" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{month:'$month'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ]) 
  
    .then((data)=>{
        console.log(data)
        resolve(data)})
   
    })
    
},


yearlyReport:()=>{
    return new Promise((resolve, reject) =>{
    Order.aggregate([
        {$match:{
            placedDate:{
               $gte: new Date(new Date().getFullYear -5)
           }
        }},
    
        {
            $project:{
                year:{$year:'$placedDate'},
                month: { $month: "$placedDate" },
                day: { $dayOfMonth: "$placedDate" },
                dayOfWeek: { $dayOfWeek: "$placedDate" },
                week: { $week: "$placedDate" },
                date:{$toDate:"$placedDate" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{year:'$year'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ])
  
    .then((data)=>{resolve(data)})
   
    })
    
},








monthlyReports: () => {
  return new Promise(async (resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*30)
      let end = new Date()

      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      var i;
      for(i=0;i<orderSuccess.length;i++){
          orderSuccess[i].date=moment(orderSuccess[i].date).format('lll')
      }
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].totalAmount
          if (orderSuccess[i].paymentMethod === 'cod') {
              cod++
          } else if (orderSuccess[i].paymentMethod === 'paypal') {
              paypal++
          }else if (orderSuccess[i].paymentMethod === 'razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          
      }

      let productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled",'cancelledbyadmin']}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])
      


      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,         
          currentOrders: orderSuccess
      }
      resolve(data)
})



},


dailyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24)

      
      let end = new Date()
      
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].totalAmount
          if (orderSuccess[i].paymentMethod === 'cod') {
              cod++
          } else if (orderSuccess[i].paymentMethod === 'paypal') {
              paypal++
          }else if (orderSuccess[i].paymentMethod === 'razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



      productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled,cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          averageRevenue:total/productCount[0].total,
          currentOrders: orderSuccess
      }
      resolve(data)
  })
},

weeklyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*7)

      let end = new Date()
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].totalAmount
          if (orderSuccess[i].paymentMethod === 'cod') {
              cod++
          } else if (orderSuccess[i].paymentMethod === 'paypal') {
              paypal++
          }else if (orderSuccess[i].paymentMethod === 'razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



      productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled",'cancelledbyadmin']}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          averageRevenue:total/productCount[0].total,
          
          currentOrders: orderSuccess
      }

      resolve(data)
  })
},

yearlyReports:()=>{
  return new Promise(async(resolve, reject) => {
      
      let start=new Date(new Date()-1000*60*60*24*365)

      let end = new Date()
      
     
      let orderSuccess = await Order.find({ placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].totalAmount
          if (orderSuccess[i].paymentMethod === 'cod') {
              cod++
          } else if (orderSuccess[i].paymentMethod === 'paypal') {
              paypal++
          }else if (orderSuccess[i].paymentMethod === 'razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



      productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled","cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])



      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,

          averageRevenue:total/productCount[0].total,

          currentOrders: orderSuccess
      }

      resolve(data)
  })
},

getReports : (startDate,endDate) => {
  return new Promise(async (resolve, reject) => {
      let start=new Date(startDate)
      let end = new Date(endDate)      
     
      let orderSuccess = await Order.find({placedDate: { $gte: start, $lte: end }, "products.status": { $nin: ['cancelled','cancelledbyadmin'] } }).sort({ Date: -1, Time: -1 })
      
      let orderTotal = await Order.find({ placedDate: { $gte: start, $lte: end } })
      let orderSuccessLength = orderSuccess.length
      let orderTotalLength = orderTotal.length
      let orderFailLength = orderTotalLength - orderSuccessLength
      let total = 0
      // let discount=0


      let razorpay = 0
      let cod = 0
      let paypal = 0
      let wallet=0
      let productCount=0
      for (let i = 0; i < orderSuccessLength; i++) {
          total = total + orderSuccess[i].totalAmount
          if (orderSuccess[i].paymentMethod === 'cod') {
              cod++
          } else if (orderSuccess[i].paymentMethod === 'paypal') {
              paypal++
          }else if (orderSuccess[i].paymentMethod === 'razorpay') {
              razorpay++
          }
           else {
              wallet++
          }
          //  if (orderSuccess[i].discount) {
          
          //     discount = discount + parseInt(orderSuccess[i].discount)
          //     discount++
          // }
      }



       productCount=await Order.aggregate([
          {
              $match:{
                 $and:[{"products.status":{$nin:["cancelled","cancelledbyadmin"]}
              },
          { placedDate: { $gte: start, $lte: end }}]

              },
              
          },
          {
              $project:{
                  _id:0,
                  quantity:'$products.quantity'
                  
              }
          },
          {
              $unwind:'$quantity'
          },
          {
              $group: {
                  _id: null,
                  total: { $sum:'$quantity' }
              }
          }
        ])      





      var data = {
          start: moment(start).format('YYYY/MM/DD'),
          end: moment(end).format('YYYY/MM/DD'),
          totalOrders: orderTotalLength,
          successOrders: orderSuccessLength,
          failOrders: orderFailLength,
          totalSales: total,
          cod: cod,
          paypal: paypal,
          razorpay: razorpay,
          wallet:wallet,
          // discount:discount,
          productCount:productCount[0].total,
          
         
          currentOrders: orderSuccess
      }
     
      resolve(data)
})
},







}