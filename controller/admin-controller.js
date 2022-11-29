const userHelpers = require("../helpers/user-helpers");
const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const offerHelpers = require("../helpers/offer-helpers");
const Category = require("../models/category");
const Banner = require("../models/banner");
const SubCategory = require("../models/subCategory");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const moment= require('moment')
const Referral = require("../models/referral");


  module.exports = {

    loginGet :  (req, res, next)=> {
        res.render("admin/login");
      },

    loginPost :  async (req, res) => {
      adminHelpers.doAdminLogin(req.body).then((response)=>{
        if (response) {
           req.session.admin = response;
           res.redirect("/admin/dashboard");
         } else {
           req.flash("error", "Incorrect Email/Password");
           res.redirect("/admin");
         }
      })
     },

     dashboardGet : async (req, res)=> {
      let usersCount = await adminHelpers.getUsersCount()
    let ordersCount = await adminHelpers.getOrdersCount()
    let productsCount = await adminHelpers.getProductsCount()
    let delExist = await Order.findOne({'products.status':'delivered'})
    let total = 0
    if(delExist){
     total = await adminHelpers.getTotalAmountOrders()
    }
    res.render("admin/dashboard", { active: "dashboard" ,
    usersCount,productsCount,ordersCount,total});
    },

    catSalesReport :  (req, res) => {
      adminHelpers.findorderbycat().then((data) => {
          res.json(data)
      })
    },

    salesReport :  async (req, res) => {
      try {
        // let details = await adminHelpers.getSalesReport()
        let data=await adminHelpers.monthlyReports()
        let daily=await adminHelpers.dailyReports()
        let weekly=await adminHelpers.weeklyReports()
        let yearly=await adminHelpers.yearlyReports()
        for (value of data.currentOrders){
          value.date = moment(value.placedDate).format('DD-MM-YYYY')
        }
          res.render('admin/salesReport', { active:"dashboard",data,daily,weekly,yearly })
      } catch (error) {
          console.log(error);
      }
    },

   report : async (req,res)=>  {
    let daily =await adminHelpers.dailyReport()
    let monthly = await adminHelpers.monthlyReport()
    let yearly = await adminHelpers.yearlyReport()
    res.json({daily,monthly,yearly})
   },
    
    customReport:async(req,res)=>{
    let start=req.body.starting
    let end=req.body.ending
  
    let data=await adminHelpers.getReports(start,end)
    let daily=await adminHelpers.dailyReports()
    let weekly=await adminHelpers.weeklyReports()
    let yearly=await adminHelpers.yearlyReports()
    for (value of  data.currentOrders){
      value.date = moment( value.placedDate).format('DD-MM-YYYY')
    }
    res.render('admin/salesReport',{active:"dashboard",data,daily,weekly,yearly})
},
   
    
     productsGet :  async (req, res) => {
      productHelpers.doLookupProducts().then((response)=>{
        res.render("admin/products", { active: "products", product:response });
      })
    },

    addProductGet :  async (req, res) => {
      const category = await Category.find();
      const subCategory = await SubCategory.find();
      res.render("admin/addProduct", { active: "products", category ,subCategory});
    },

    addProductPost :  (req, res) => {
      productHelpers.addProduct(req.body, req.files).then((response) => {
        if (response) {
          req.flash("success", "Production Creation Successfull!");
          res.redirect("/admin/products");
        }
      });
    },

    editProductGet : async (req, res) => {
      const { id } = req.params;
      const product = await Product.findById(id);
      const category = await Category.find();
      const cat = await Category.findById(product.category);
      const subCategory = await SubCategory.find();
      const subcat = await SubCategory.findById(product.subCategory);
      res.render("admin/editProduct", { active: "products", product, category,subCategory,categoryname:cat.name,subCategoryname:subcat.name });
    },

    editProductPut :  (req, res) => {
      const { id } = req.params;
      productHelpers.editProduct(id, req.body, req.files).then((response) => {
        if (response) {
          req.flash("success", "Product Updation Successfull!");
          res.redirect("/admin/products");
        }
      });
    },

    deleteProduct :  (req, res) => {
      const { id } = req.params;
      productHelpers.deleteProduct(id).then((response) => {
        req.flash("success", "Deletion Successfull!");
        res.redirect("/admin/products");
      });
    },

    customerGet :  async (req, res) => {
      const user = await User.find();
       res.render("admin/customers", { active: "customers", user });
     },

     blockUser :  (req, res) => {
      const { id } = req.params;
      userHelpers.doBlock(id).then((response) => {
        res.redirect("/admin/customers");
      });
    },

    categoryGet : async (req, res) => {
      const category = await Category.find();
      
      res.render("admin/category", { active: "category", category});
    },

    addCategoryGet :  (req, res) => {
      res.render("admin/addCategory", { active: "category" });
    },

    addCategoryPost :  (req, res) => {
      productHelpers.addCategory(req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Category Creation Successfull!");
          res.redirect("/admin/category");
        } else {
          req.flash("error", "Category Already Exists!");
          res.redirect("/admin/addCategory");
        }
      });
    },

    editCategoryGet :  async (req, res) => {
      const { id } = req.params;
       const category = await Category.findById(id);
       res.render("admin/editCategory", { active: "category", category });
     },

     editCategoryPut : (req, res) => {
      const { id } = req.params;
      productHelpers.editCategory(id, req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Category Updation Successfull!");
          res.redirect("/admin/category");
        }
        else{
          req.flash("error", "Category Already Exists!");
          res.redirect(`/admin/editCategory/${id}`);
        }
      });
    },

    deleteCategory :  (req, res) => {
      const { id } = req.params;
      productHelpers.deleteCategory(id).then((response) => {
        if(response){
        req.flash("success", "Deletion Successfull!");
        res.redirect("/admin/category");
        }
        else{
          req.flash("error", "Category contains Products!");
        res.redirect("/admin/category");
        }
      });
    },


    couponsGet : async (req, res) => {
      let coupons = await offerHelpers.getAllCoupons()
      res.render("admin/coupons", { active: "coupons", coupons});
    },

    addCouponGet :  (req, res) => {
      res.render("admin/addCoupon", { active: "coupons" });
    },

    addCouponPost :  (req, res) => {
      offerHelpers.createCoupon(req.body).then((data)=>{
        req.flash("success", "Coupon Creation Successfull!");
        res.redirect('/admin/coupons')
      }).catch((err)=>{
        req.flash("error", err);
          res.redirect("/admin/addCoupon");
      })
    },

    couponEnable : (req,res)=>{
      const {id} = req.params
      offerHelpers.enableCoupon(id).then((response)=>{
        res.json({status:true})
      }).catch((err)=>{
        next(err)
      })
    },

    couponDisable : (req,res)=>{
      const {id} = req.params
      offerHelpers.disableCoupon(id).then((response)=>{
        res.json({status:true})
      }).catch((err)=>{
        next(err)
      })
    },

    editCouponGet : async(req,res)=>{
      const {id}=req.params
      const coupon = await Coupon.findById(id)
      coupon.validfrom = moment(coupon.valid_from).format('YYYY-MM-DD');
      coupon.validtill = moment(coupon.valid_till).format('YYYY-MM-DD');

      res.render("admin/editCoupon",{active:"coupons",coupon});
    },  

    editCouponPost :  (req, res) => {
      const {id}=req.params
      offerHelpers.editCoupon(req.body,id).then((data)=>{
        req.flash("success", "Coupon Updation Successfull!");

        res.redirect('/admin/coupons')
      }).catch((err)=>{
        req.flash("error", err);
          res.redirect(`/admin/editCoupon/${id}`);
      })
    },  
    
    deleteCoupon : (req,res)=>{
      try{
        offerHelpers.deleteCoupon(req.params.id).then((response) => {
          req.flash("success", "Coupon Deletion Successfull!");

          res.redirect('/admin/coupons')
        }).catch((err)=>{
         next(err);
      })
         }catch(err){
         next(err)
        }
    },

    subCategoryGet : async (req, res) => {
      
      const subCategory = await SubCategory.find();
      res.render("admin/subCategory", { active: "category", subCategory });
    },
    
    addSubCategoryGet :  (req, res) => {
      res.render("admin/addSubCategory", { active: "category" });
    },

    addSubCategoryPost :  (req, res) => {
      productHelpers.addSubCategory(req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Sub Category Creation Successfull!");
          res.redirect("/admin/subCategory");
        } else {
          req.flash("error", "Sub Category Already Exists!");
          res.redirect("/admin/addSubCategory");
        }
      });
    },

    
    editSubCategoryGet :  async (req, res) => {
      const { id } = req.params;
       const category = await SubCategory.findById(id);
       res.render("admin/editSubCategory", { active: "category", category });
     },

     editSubCategoryPut : (req, res) => {
      const { id } = req.params;
      productHelpers.editSubCategory(id, req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Sub Category Updation Successfull!");
          res.redirect("/admin/subCategory");
        }
        else{
          req.flash("error", "Sub Category Already Exists!");
          res.redirect(`/admin/editSubCategory/${id}`);
        }
      });
    },

    deleteSubCategory :  (req, res) => {
      const { id } = req.params;
      productHelpers.deleteSubCategory(id).then((response) => {
        if(response){
        req.flash("success", "Deletion Successfull!");
        res.redirect("/admin/subCategory");
        }
        else{
          req.flash("error", "Sub Category contains Products!");
        res.redirect("/admin/category");
        }
      });
    },

    ordersGet :async(req,res)=>{
      let orders = await adminHelpers.getAllTheOrders()
      for (let val of orders){
      val.products[0].orderedDate = val.products[0].orderedDate.toLocaleDateString()
      
    }
      res.render('admin/orders',{active:"orders",orders})
    },

    orderProductsGet :async(req,res)=>{
      const {id} = req.params;
      
      let order = await Order.findById(id)
      
      
       order.products[0].orderedDate = order.products[0].orderedDate.toLocaleDateString()
        
   
      res.render('admin/orderProducts',{active:"orders",order})
    },

    changeOrderStatusPost:(req,res)=>{
    
      adminHelpers.changeOrderStatus(req.body).then((response)=>{
        res.json(response)
      })
    },

    
    bannersGet :  async (req, res) => {
      const banner = await Banner.find();
       res.render("admin/banners", { active: "banners" ,banner});
     },

     addBannerGet : async (req, res) => {
      const subcategory = await SubCategory.find();
      res.render("admin/addBanner", { active: "banners" ,subcategory});
    },

    addBannerPost :  (req, res) => {
      productHelpers.addBanner(req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Banner Creation Successfull!");
          res.redirect("/admin/banners");
        } else {
          req.flash("error", "Banner Already Exists!");
          res.redirect("/admin/addBanner");
        }
      });
    },

    editBannerGet :  async (req, res) => {
      const { id } = req.params;
       const banner = await Banner.findById(id);
       const subCategory = await SubCategory.find();
      const subcat = await SubCategory.findById(banner.subCategory);
       res.render("admin/editBanner", { active: "banners", banner ,subCategory,subCategoryname:subcat.name});
     },

     editBannerPut : (req, res) => {
      const { id } = req.params;
      
      productHelpers.editBanner(id, req.body, req.file).then((response) => {
        if (response) {
          req.flash("success", "Banner Updation Successfull!");
          res.redirect("/admin/banners");
        }
        else{
          req.flash("error", "Banner Already Exists!");
          res.redirect(`/admin/editBanner/${id}`);
        }
      });
    },

    deleteBanner :  (req, res) => {
      const { id } = req.params;
      productHelpers.deleteBanner(id).then((response) => {
        if(response){
        req.flash("success", "Banner Deletion Successfull!");
        res.redirect("/admin/banners");
        }
      });
    },

    offersGet :  async (req, res) => {
      const referral = await Referral.findOne();
      // const category = await Category.find({offer:{$exists:true}})
      const category = await offerHelpers.getAllOffCategory()
       res.render("admin/offers", { active: "offers",referral,category});
     },

     editReferralsGet :  async (req, res) => {
      offerHelpers.editReferrals(req.body).then((response)=>{
        req.flash("success", "Referral Offer Updation Successfull!");
        res.redirect('/admin/offers')
      }).catch((err)=>{
        next(err)
      })
     },


     addCatgeoryOfferGet :  async (req, res) => {
      const categories = await Category.find();
       res.render("admin/addCategoryOffer", { active: "offers",categories});
     },

     addCategoryOfferPost: async  (req, res, next) =>{ 
      await offerHelpers.addCategoryOffer(req.body).then(()=>{
        req.flash("success", "Catgeory Offer Added!");
        res.redirect('/admin/offers')
      })
      
  },

  catOffEnable : (req,res)=>{
    const {id} = req.params
    offerHelpers.enableCatOff(id).then((response)=>{
      res.json({status:true})
    }).catch((err)=>{
      next(err)
    })
  },

  catOffDisable : (req,res)=>{
    const {id} = req.params
    offerHelpers.disableCatOff(id).then((response)=>{
      res.json({status:true})
    }).catch((err)=>{
      next(err)
    })
  },

  editCatOffGet : async(req,res)=>{
    const {id}=req.params
    const category = await Category.findById(id)
    category.offer.validfrom = moment(category.offer.valid_from).format('YYYY-MM-DD');
    category.offer.validtill = moment(category.offer.valid_till).format('YYYY-MM-DD');

    res.render("admin/editCategoryOffer",{active:"offers",category});
  }, 

  editCatOffPost :  (req, res) => {
    const {id}=req.params
    offerHelpers.editCatOff(req.body,id).then((data)=>{
      req.flash("success", "Category Offer Updation Successfull!");

      res.redirect('/admin/offers')
    }).catch((err)=>{
      req.flash("error", err);
        res.redirect(`/admin/editCategoryOffer/${id}`);
    })
  }, 

  deleteCatOff : (req,res)=>{
    try{
      offerHelpers.deleteCatOff(req.params.id).then((response) => {
        req.flash("success", "Category Offer Deletion Successfull!");

        res.redirect('/admin/offers')
      }).catch((err)=>{
       next(err);
    })
       }catch(err){
       next(err)
      }
  },


    logout :  (req, res) => {
      req.session.admin = null;
      req.flash("success", "Logout Successfull!");
      res.redirect("/admin");
    },

  
    getChartData: async function (req, res, next) {
    
      Order.aggregate([
        { $match: { "products.status": "delivered" } },
        {
          $project: {
            date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
          }
        },
        {
          $match: {
            date: {
              $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
            }
          }
        },
        {
          $group: {
            _id: { $month: "$date" },
            total: { $sum: "$total" }
          }
        },
        {
          $project: {
            month: "$_id",
            total: "$total",
            _id: 0
          }
        }
      ]).then(result => {
          Order.aggregate([
          { $match: { "products.status": "delivered" } },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
            }
          },
          {
            $match: {
              date: {
                $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
              }
            }
          },
          {
            $group: {
              _id: { $dayOfWeek: "$date" },
              total: { $sum: "$total" }
            }
          },
          {
            $project: {
              date: "$_id",
              total: "$total",
              _id: 0
            }
          },
          {
            $sort: { date: 1 }
          }
        ]).then(weeklyReport => {
          
          adminHelpers.getReport().then(details=>{
            console.log(weeklyReport)
            console.log(details)
            console.log(result)
            res.status(200).json({ data: result, weeklyReport,details })
            
          })
         
        })
      })
    }     
   
}
  