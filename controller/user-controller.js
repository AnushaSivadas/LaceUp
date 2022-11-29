const userHelpers = require("../helpers/user-helpers");
const cartHelpers = require("../helpers/cart-helpers");
const offerHelpers = require("../helpers/offer-helpers");
const productHelpers = require("../helpers/product-helpers");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Product = require("../models/product");
const Order = require("../models/order");
const Guest = require("../models/guest");
const Banner = require("../models/banner");
const User = require("../models/user");
const { AnonymizeInstance } = require("twilio/lib/rest/video/v1/room/roomParticipant/roomParticipantAnonymize");
const ObjectId = require("mongoose").Types.ObjectId;
const Referral = require("../models/referral");
const { response } = require("express");


require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const serverSID = process.env.VERIFICATION_SID;

module.exports = {
  homeGet: async (req, res) => {
     const category = await Category.find();
    const subCategory = await SubCategory.find();
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const banner = await Banner.find();
    const product = await productHelpers.doLookupProducts();
    let user = await User.findById(req.session.user);
    let cartCount = null;
    let wishlistCount = null;
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    if (req.session.user) {
      
      await cartHelpers.allInWishlist(user,product)
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }

    for(let i=0;i<product.length;i++){
       let index=category.findIndex((c)=>c._id==product[i].category.toString())
        if(category[index].offer.discount){
          if(category[index].offer.status){
       let p=Math.floor(product[i].actualprice-(category[index].offer.discount*product[i].actualprice/100))
        if(p<product[i].sellingprice){
        await productHelpers.editProductprice(product[i]._id,p)

        product[i].dis=category[index].offer.discount
        }else{
          let p=Math.floor(product[i].actualprice-(product[i].discount*product[i].actualprice/100))
          await productHelpers.editProductprice(product[i]._id,p)
        product[i].dis=product[i].discount

          
      }
        }else{
          let p=Math.floor(product[i].actualprice-(product[i].discount*product[i].actualprice/100))
          await productHelpers.editProductprice(product[i]._id,p)
        product[i].dis=product[i].discount

          
      }
        }else{
          let p=Math.floor(product[i].actualprice-(product[i].discount*product[i].actualprice/100))
          await productHelpers.editProductprice(product[i]._id,p)
        product[i].dis=product[i].discount

          
      }
    }


    let productLength = product.length
    if(product.length>8)
    productLength=8
    res.render("users/home", {user,category,subCategory,product,productLength,wishlistCount,cartCount,guestCartCount,banner,CATEGORY,SUBCATEGORY});
  },

  registerGet: async(req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    res.render("users/register", { user: false,guestCartCount,CATEGORY,SUBCATEGORY });
  },

  registerPost: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      res.redirect('/userLogin')
    }).catch((err)=>{
      req.flash("error", err);
      res.redirect("/userRegister");
    })
  },

  loginGet: async(req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
  
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
      
    }
    if(req.query){
      guestCart = req.query.guestCart
    }
    res.render("users/login", { user: false ,guestCartCount,guestCart,CATEGORY,SUBCATEGORY});
  },

  loginPost: (req, res) => {
    
    userHelpers.doLogin(req.body).then(async(response) => {
      if (response) {
       
        if (!response.isBlocked) {
          let guestExist = await Guest.findOne({user:req.session.id})
          if(guestExist){
            if(guestExist.products.length!=0){
            req.session.user = response;
           await  cartHelpers.putToCart(guestExist.products,response._id,guestExist._id)
            if(req.body.guestCart){
                res.redirect('/guestPlaceOrder')
            }
            else{
              req.session.user = response;
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
            }
          }else{
            req.session.user = response;
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
          }
          
          }
          else{
            req.session.user = response;
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
          }
        } else {
          req.flash("error", "You are Blocked!");
          res.redirect("/userLogin");
        }
      } 
    }).catch((err)=>{
      req.flash("error", err);
        res.redirect("/userLogin");
    });
  },

  productDetailsGet: async (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)) {
      const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
      let user = await User.findById(req.session.user);
      const product = await Product.findById(id);
      let category = null;
      let subCategory =null;
      let relCat=null
      let relSubCat=null
      let relatedProducts=null
      if(product){
       category = await Category.findById(product.category);
       subCategory = await SubCategory.findById(product.subCategory);
       relatedProducts = await productHelpers.findRelatedProductsCategory(product.category,product.subCategory,product._id);
      
      if(relatedProducts.length>0){
       relCat = await Category.findById(relatedProducts[0].category);
       relSubCat = await SubCategory.findById(relatedProducts[0].subCategory);
      }
    }
      let inWishlist = -1;
      let inCart = -1;
      let inGuestCart =-1;
      let cartCount = null;
      let wishlistCount = null;
      let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
      inGuestCart = await cartHelpers.inGuestCart(req.session.id,id);
    }
      if (req.session.user) {
        await cartHelpers.allInWishlist(user,relatedProducts)
        inWishlist = await cartHelpers.inWishlist(user, id);
        inCart = await cartHelpers.inCart(user._id,id);
        wishlistCount = await cartHelpers.getWishlistCount(user);
        cartCount = await cartHelpers.getCartCount(user._id);
      }
      res.render("users/productDetails", {
        product,
        category,subCategory,
        user,relCat,relSubCat,
        cartCount,
        wishlistCount,
        relatedProducts,
        inWishlist,inCart,inGuestCart,
        guestCartCount,
        CATEGORY,SUBCATEGORY
      });
    } else {
      res.redirect('/error');
    }
  },

  categoryViewGet: async (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)) {
      const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
      const product = await Product.find({ category: id });
      const category = await Category.findById(id);
      let user = await User.findById(req.session.user);
      let cartCount = null;
      let wishlistCount = null;
      let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
      if (req.session.user) {
        
        wishlistCount = await cartHelpers.getWishlistCount(user);
        cartCount = await cartHelpers.getCartCount(user._id);
      }
      res.render("users/categoryView", {
        product,
        category,
        user,
        cartCount,
        wishlistCount,
        guestCartCount,CATEGORY,SUBCATEGORY
      });
    } else {
      res.redirect('/error');
    }
  },

  
  subCategoryViewGet: async (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)) {
      const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
      const product = await Product.find({ subCategory: id });
      const subCategory = await SubCategory.findById(id);
      let user = await User.findById(req.session.user);
      let cartCount = null;
      let wishlistCount = null;
      let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    for(item of product){
      let cat = await Category.findById(item.category)
      item.categoryName=cat.name
    }
      if (req.session.user) {
        if(product.length>0)
        await cartHelpers.allInWishlist(user,product)
        wishlistCount = await cartHelpers.getWishlistCount(user);
        cartCount = await cartHelpers.getCartCount(user._id);
      }
      
      res.render("users/subCategoryView", {
        product,
        subCategory,
        user,
        cartCount,
        wishlistCount,
        guestCartCount,CATEGORY,SUBCATEGORY
      });
    } else {
      res.redirect('/error');
    }
  },

  enterphnoGet: async(req, res, next) => {

    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    res.render("users/enterphno", { user: false,CATEGORY,SUBCATEGORY ,guestCartCount});
  },

  enterphnoPost: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    const { phno } = req.body;
    const user = await User.findOne({ phno });
    if (user) {
      client.verify
        .services(serverSID)
        .verifications.create({
          to: `+91${req.body.phno}`,
          channel: "sms",
        })
        .then((data) => {
          res.render("users/otplogin", { phno: req.body.phno, user: false ,CATEGORY,SUBCATEGORY,guestCartCount});
        })
        .catch((err) => {
        });
    } else {
      req.flash("error", "User Doesn't Exist!");
      res.redirect("/enterphno");
    }
  },

  otploginGet: async(req, res, next) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    res.render("users/otplogin", { user: false, phno: false ,CATEGORY,SUBCATEGORY,guestCartCount});
  },

  otploginPost: async (req, res) => {
    
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const { otp, phno } = req.body;
    const user = await User.findOne({ phno });
    client.verify
      .services(serverSID)
      .verificationChecks.create({ to: `+91${phno}`, code: otp })
      .then(async(resp) => {
        if (!resp.valid) {
          req.flash("error", "Otp verification failed");
          res.redirect("/enterphno",{CATEGORY,SUBCATEGORY});
        } else {
          req.session.user = user;


          let guestExist = await Guest.findOne({user:req.session.id})
          if(guestExist){
            if(guestExist.products.length!=0){
           await  cartHelpers.putToCart(guestExist.products,user._id,guestExist._id)
            if(req.body.guestCart){
                res.redirect('/guestPlaceOrder')
            }
            else{
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
            }
          }else{
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
          }
          
          }
          else{
            var redirectTo = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            // is authenticated ?
            res.redirect(redirectTo);
          }



        }
      })
      .catch((err) => {
      });
  },

  loginNeedATCget: async(req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    res.render("users/loginNeedATC", { user: false,CATEGORY,SUBCATEGORY });
  },

  loginNeedWLget: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let guestCartCount = null;
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    res.render("users/loginNeedWL", { user: false,guestCartCount,CATEGORY,SUBCATEGORY });
  },

  

  cartGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let user = await User.findById(req.session.user);
    let cartItems = await cartHelpers.getCartProducts(user._id);
    let guestCartExist = await Guest.findOne({user:req.session.id})
   
    if(guestCartExist){
    await Guest.deleteOne({user:req.session.id})
    }
    let total,
      totalAmount,
      subTotal,
      discount = 0;
    if (cartItems.length > 0) {
      for(item of cartItems){
        let cat = await Category.findById(item.product.category)
        let subcat = await SubCategory.findById(item.product.subCategory)
        item.product.categoryName=cat.name
        item.product.subCategoryName=subcat.name  
      }
      total = await cartHelpers.getTotalAmount(user._id);
      totalAmount = total.totalAmount;
      subTotal = total.subTotal;
      discount = Math.round(subTotal - totalAmount);
    }
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    let saveforlater = await cartHelpers.getSavedForLater(user._id)
    if(saveforlater.length>0){
      for(item of saveforlater){
        let cat = await Category.findById(item.product.category)
        let subcat = await SubCategory.findById(item.product.subCategory)
        item.product.categoryName=cat.name
        item.product.subCategoryName=subcat.name  
      }
    }
    res.render("users/cart", {user,cartItems,wishlistCount,cartCount,totalAmount,subTotal,discount,saveforlater,CATEGORY,SUBCATEGORY});
  },

  guestCartGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let cartItems = await cartHelpers.getGuestCartProducts(req.session.id);
    
    let total,
      totalAmount,
      subTotal,
      discount = 0;
    if (cartItems.length > 0) {
      for(item of cartItems){
        let cat = await Category.findById(item.product.category)
        let subcat = await SubCategory.findById(item.product.subCategory)
        item.product.categoryName=cat.name
        item.product.subCategoryName=subcat.name
  
      }
      total = await cartHelpers.getGuestTotalAmount(req.session.id);
      totalAmount = total.totalAmount;
      subTotal = total.subTotal;
      discount = Math.round(subTotal - totalAmount);
    }
    if(req.session.id){
      guestCartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }
    
    res.render("users/guestCart", {
     guestCartCount,
      cartItems,
      totalAmount,
      subTotal,
      discount,
      user:false,
      CATEGORY,SUBCATEGORY
    });
  },

  addToCartGet:async (req, res) => {
    let { id } = req.params;
    if (ObjectId.isValid(id)) {
      
      let savedItemExist = await cartHelpers.findSavedItem(req.session.user._id,id)
      if(savedItemExist){
      await cartHelpers.removeSavedItemCart(req.session.user._id,id)
      }
      cartHelpers.addToCart(id, req.session.user._id).then((response) => {
        res.redirect(`/productDetails/${id}`);
        // res.redirect('/cart')
      });
    } else {
      res.redirect('/error');
    }
  },

  addItemToCartGet:async (req, res) => {
      let userId = req.body.userId
      let proId = req.body.proId
      let savedItemExist = await cartHelpers.findSavedItem(userId,proId)
      if(savedItemExist){
      await cartHelpers.removeSavedItemCart(userId,proId)
      }
      cartHelpers.addToCart(proId, userId).then((response) => {
        res.json(response);
      });
    
  },

  addToGuestCartGet:(req, res) => {
    let { id } = req.params;
    if (ObjectId.isValid(id)) {
      cartHelpers.addToGuestCart(id, req.session.id).then((response) => {
        res.redirect(`/productDetails/${id}`);
        // res.redirect('/guestCart')
      });
    } else {
      res.redirect('/error');
    }
  },

  changeProductQuantityPost: async(req, res, next) => {
    let user = await User.findById(req.session.user);
    
    cartHelpers.changeProductQuantity(req.body).then(async (response) => {
      let cartItems = await cartHelpers.getCartProducts(user._id);
      if(cartItems.length>0){
      total = await cartHelpers.getTotalAmount(req.body.user);
      response.totalAmount = total.totalAmount;
      response.subTotal = total.subTotal;
      }
      res.json(response);
    });
  },

  changeGuestProductQuantityPost: async(req, res, next) => {
    
    
    cartHelpers.changeGuestProductQuantity(req.body).then(async (response) => {
      let cartItems = await cartHelpers.getGuestCartProducts(req.session.id);
      if(cartItems.length>0){
      total = await cartHelpers.getGuestTotalAmount(req.session.id);
      response.totalAmount = total.totalAmount;
      response.subTotal = total.subTotal;
      }
      res.json(response);
    });
  },

  removeCartItemPost: (req, res) => {
    cartHelpers.removeCartItem(req.body).then((response) => {
      res.json(response);
    });
  },

  removeGuestCartItemPost: (req, res) => {
    cartHelpers.removeGuestCartItem(req.body).then((response) => {
      res.json(response);
    });
  },

  removeSavedItem: (req, res) => {
    cartHelpers.removeSavedItem(req.body).then((response) => {
      res.json(response);
    });
  },

  
  saveForLater :async(req, res) => {
    await cartHelpers.addToSaveForLater(req.session.user._id,req.body.product,req.body.qty)
    cartHelpers.removeCartItem(req.body).then((response) => {
      res.json(response);
    });
  },

  moveToCart :async(req, res) => {
    await cartHelpers.addProductsToCartFromSaved(req.session.user._id,req.body.product,req.body.qty)
    cartHelpers.removeSavedItem(req.body).then((response) => {
      res.json(response);
     });
  },

  addToWishlistGet: (req, res) => {
    let { id } = req.params;
    if (ObjectId.isValid(id)) {
      cartHelpers.addToWishlist(id, req.session.user).then((response) => {
        res.redirect(`/productDetails/${id}`);
      });
    } else {
      res.redirect('/error');
    }
  },

  addToWishlistPost: async(req, res) => {
    {
      let user = await User.findById(req.session.user);
      cartHelpers.addToWishlist(req.body.product,user).then((response) => {
        res.json(response);
      });
    } 
  },

  wishlistGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    let user = await User.findById(req.session.user._id);
    const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
    let wishlistItems = await cartHelpers.getWishlistProducts(user._id);
    let cartCount = null;
    let wishlistCount = null;
        
    if (req.session.user) {
      await cartHelpers.allInCart(user._id,wishlistItems)
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }

    if(wishlistItems.length>0){
      for(item of wishlistItems){
        let cat = await Category.findById(item.products.category)
        let subcat = await SubCategory.findById(item.products.subCategory)
        item.products.categoryName=cat.name
        item.products.subCategoryName=subcat.name  
      }
    }
    res.render("users/wishlist", {
      user,
      wishlistItems,
      wishlistCount,
      cartCount,CATEGORY,SUBCATEGORY,referral,referredUsers
     
    });
  },

  deleteWishlistGet: async (req, res) => {
    let { id } = req.params;
    if (ObjectId.isValid(id)) {
      cartHelpers.deleteWishlist(req.session.user._id, id).then((response) => {
      });
      res.redirect(`/wishlist`);
    } else {
      res.redirect('/error');
    }
  },

  removeWishlistItemPost: (req, res) => {
    cartHelpers.removeWishlistItem(req.body).then((response) => {
      res.json(response);
    });
  },

  placeOrderGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const user = await User.findById(req.session.user._id);
    const coupons = await offerHelpers.getCoupons()
    let products=await cartHelpers.getCartProducts(user._id)
        let unavailable=new Array()
        let k=0;
        for(var i=0;i<products.length;i++){
            if(products[i].quantity>products[i].product.stock){
                
                await cartHelpers.removeCartItemStock(user._id,products[i].item)
                unavailable[k]={
                    name:products[i].product.name  
                }
                k++;
            }
        }
    let cartItems = await cartHelpers.getCartProducts(user._id);
    
    let total,totalAmount,subTotal,discount = 0;
    if (cartItems.length > 0) {
      total = await cartHelpers.getTotalAmount(user._id);
      totalAmount = total.totalAmount;
      subTotal = total.subTotal;
      discount = Math.round(subTotal - totalAmount);

      if (req.session.couponApplied) {

        const {amount_off,minimum_purchase}=req.session.couponApplied 
        if (minimum_purchase <= totalAmount) {       
          let amountOff = amount_off
          
          totalAmount = totalAmount - amountOff  
        }
        else{
          req.session.couponApplied=false
        }    
      }
    }
    for(var i=0;i<products.length;i++){
      if(products[i].quantity>products[i].product.stock){
          await cartHelpers.doAddproductsToCartStock(user._id,products[i].item,products[i].quantity)
      }
  }
    let count = 0;
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    if(user.address.length>2){
       count=4
    }
    res.render("users/placeOrder", {user,cartCount,wishlistCount,totalAmount,subTotal,
      discount,cartItems,count,guestUser:false,coupons,CATEGORY,SUBCATEGORY,unavailable,
    couponApplied:req.session.couponApplied});
           
    },

  guestPlaceOrderGet: async(req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const user = await User.findById(req.session.user._id);
    const coupons = await offerHelpers.getCoupons()
    let products=await cartHelpers.getGuestCartProducts(req.session.id)
    
        let unavailable=new Array()
        let k=0;
        for(var i=0;i<products.length;i++){
            if(products[i].quantity>products[i].product.stock){
                
                await cartHelpers.guestRemoveCartItemStock(req.session.id,products[i].item)
                unavailable[k]={
                    name:products[i].product.name  
                }
                k++;
            }
        }
    let cartItems = await cartHelpers.getGuestCartProducts(req.session.id)
    
    let total,totalAmount,subTotal,discount = 0;
    if (cartItems.length > 0) {
      total = await cartHelpers.getGuestTotalAmount(req.session.id)
      totalAmount = total.totalAmount;
      subTotal = total.subTotal;
      discount = Math.round(subTotal - totalAmount);
      if (req.session.couponApplied) {
        const {amount_off,minimum_purchase}=req.session.couponApplied 
        if (minimum_purchase <= totalAmount) {       
          let amountOff = amount_off
          
          totalAmount = totalAmount - amountOff  
        }
        else{
          req.session.couponApplied=false
        }       
      }
    }
  
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getGuestCartCount(req.session.id)
    }

    res.render("users/placeOrder", {user,cartCount,wishlistCount,cartItems,totalAmount,coupons,subTotal,discount,guestUser:true,CATEGORY,SUBCATEGORY,unavailable
    ,couponApplied:req.session.couponApplied});
  },

  placeOrderPost: async (req, res) => {
    let user = await User.findById(req.session.user._id);
    let product=await cartHelpers.getCartProducts(user._id)
        let unavailable=new Array()
        let k=0;
        for(var i=0;i<product.length;i++){
            if(product[i].quantity>product[i].product.stock){
                
                await cartHelpers.removeCartItemStock(user._id,product[i].item)
                unavailable[k]={
                    name:product[i].product.productname  
                }
                k++;
            }
        }
    let products = await cartHelpers.getCartProducts(user._id);
   
    let total = await cartHelpers.getTotalAmount(user._id);
    if (req.session.couponApplied) {
      const {amount_off}=req.session.couponApplied        
        let amountOff = amount_off
        
        total.totalAmount = total.totalAmount - amountOff
      offerHelpers.couponOncedUsed(user._id,req.session.couponApplied._id)

    }
    for(var i=0;i<product.length;i++){
      if(product[i].quantity>product[i].product.stock){
          await cartHelpers.doAddproductsToCartStock(user._id,product[i].item,product[i].quantity)
      }
    }
   
   

      if(req.body.payment === 'cod'){
        cartHelpers.placeOrder(user, req.body, products, total,req.session.couponApplied).then((response) => {
        res.json({ codSuccess: true });
        })
      }
      else if(req.body.payment === 'wallet'){
        cartHelpers.placeOrder(user, req.body, products, total,req.session.couponApplied).then((response) => {
        res.json({walletSuccess :true})
        })
      } 
      else if (req.body.payment == 'paypal') {
        cartHelpers.placeOrder(user, req.body, products, total,req.session.couponApplied).then((orderId) => {
        cartHelpers.generatePaypal(orderId, total.totalAmount).then(async (response) => {
            await cartHelpers.changePaymentStatusPaypal(orderId)
            res.json({ paypalSuccess: true })
        })
      })
      } 
      else if(req.body.payment === 'razorpay')
      {         
      
      cartHelpers.razorpayCreateOrder(user, req.body, products, total,req.session.couponApplied).then((orderr) => {
        req.session.order=orderr
        cartHelpers.generateRazorpay(orderr._id,total.totalAmount).then((order)=>{
                res.json({order})
        }).catch((err) => {
          res.json({ "status": false })
        
         })
      })
      } 
      else {                                                     
        res.json({ "status": false })
      }     
  },




  guestPlaceOrderPost: async (req, res) => {
    let user = await User.findById(req.session.user._id);
    let products = await cartHelpers.getGuestCartProducts(req.session.id);
    let total = await cartHelpers.getGuestTotalAmount(req.session.id)
    if (req.session.couponApplied) {
      const {amount_off}=req.session.couponApplied        
        let amountOff = amount_off
        
        total.totalAmount = total.totalAmount - amountOff
      offerHelpers.couponOncedUsed(user._id,req.session.couponApplied._id)
  
    }
    
   
      if(req.body.payment === 'cod'){
    let delGuest = await Guest.deleteOne({user:req.session.id})

        cartHelpers.placeOrder(user, req.body, products, total).then((orderId) => {
        res.json({ codSuccess: true });
        })
      }else if(req.body.payment === 'wallet'){
    let delGuest = await Guest.deleteOne({user:req.session.id})

        cartHelpers.placeOrder(user, req.body, products, total).then((response) => {
        res.json({walletSuccess :true})
        })
      } 
      else if (req.body.payment === 'paypal') { 
    let delGuest = await Guest.deleteOne({user:req.session.id})

      cartHelpers.placeOrder(user, req.body, products, total).then((orderId) => {  
        cartHelpers.generatePaypal(orderId, total.totalAmount).then(async (response) => {
            await cartHelpers.changePaymentStatusPaypal(orderId)
            res.json({ paypalSuccess: true })
        })
      })
      } 
      else if(req.body.payment === 'razorpay') {
        cartHelpers.razorpayCreateOrder(user, req.body, products, total).then((orderr) => {
          req.session.order=orderr
        cartHelpers.generateRazorpay(orderr._id,total.totalAmount).then((order)=>{
          res.json({order})
        }).catch((err) => {
          res.json({ "status": false })
        })     
      })
      } 
      else {                                                                
        res.json({ "status": false })
      }     
    
  },

  

  applyCoupon : async(req,res)=>{
  let couponDetails = await offerHelpers.getCouponDetails(req.body.couponCode)
  if(couponDetails){
    const couponUsed = couponDetails.users.includes(req.body.userId)
      if(couponUsed){
      req.flash("error", "Coupon Already Used");
      res.status('200').json('success')
    }
    else{
      if(req.body.total>couponDetails.minimum_purchase){
        req.session.couponApplied=couponDetails
        res.status('200').json('success')

      }
      else{
      req.flash("error", `Minimum purchase must be ${couponDetails.minimum_purchase}`);
      res.status('200').json('success')

      }
    }
  }
  else{
    req.flash("error", "Coupon doesn't exist or has been expired");
    res.status('200').json('success')

  }
  },


  removeCoupon :  async (req, res, next) => {
    try{
      req.session.couponApplied = false
      res.status('200').json('success')
     }catch(err){
     next(err)
    }
  },
 
  userProfileGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const user = await User.findById(req.session.user._id);
    const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    res.render("users/userProfile", { user,referredUsers, cartCount,referral, wishlistCount ,CATEGORY,SUBCATEGORY});
  },

  editProfilePic : async(req,res)=>{
    const user = await User.findById(req.session.user._id);
    userHelpers.changeProPic(req.file,user._id).then((response)=>{
      res.redirect('/userProfile')
    })
  },

  viewAddressGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const referral = await Referral.findOne()
    const user = await User.findById(req.session.user._id);
    const referredUsers = await User.find({referral:user.referral_code})
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    res.render("users/viewAddress", { user,referral,referredUsers, cartCount, wishlistCount,CATEGORY,SUBCATEGORY });
  },

  addAddressGet: async (req, res) => {
    const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const user = await User.findById(req.session.user._id);
    const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    res.render("users/addAddress", { user, cartCount,referral,referredUsers, wishlistCount,CATEGORY,SUBCATEGORY });
  },

  addAddressPost: async (req, res) => {
    const user = await User.findById(req.session.user._id);
    userHelpers.addAddress(req.body, user._id).then((response) => {
      res.redirect("/viewAddress");
    });
  },

  addNewAddressPost: async (req, res) => {
    const user = await User.findById(req.session.user._id);
    userHelpers.addAddress(req.body, user._id).then((response) => {
      res.redirect("/placeOrder");
    });
  },

  editAddressGet: async (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)) {
      const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
      const user = await User.findById(req.session.user._id);
      const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
      let cartCount = null;
      let wishlistCount = null;
      if (req.session.user) {
        wishlistCount = await cartHelpers.getWishlistCount(user);
        cartCount = await cartHelpers.getCartCount(user._id);
      }
      const index = await userHelpers.getAddressIndex(user, id);
      const address = user.address[index];
      res.render("users/editAddress", {user,cartCount,wishlistCount,referral,referredUsers,address,CATEGORY,SUBCATEGORY});
    } else {
      res.redirect('/error');
    }
  },

  editAddressPost: async (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)) {
    const user = await User.findById(req.session.user._id);
    const editedAddress = await userHelpers.editAddress(req.body, user._id, id);
    res.redirect("/viewAddress");
  } else {
    res.redirect('/error');
  }
  },


  editAddressPlaceOrder: async (req, res) => {
    // const user = await User.findById(req.session.user._id);
    // const editedAddress = await userHelpers.editAddress(req.body, user._id, id);
    // res.redirect("/viewAddress");
  },

  logoutGet: (req, res) => {
    req.session.user = null;
    req.flash("success", "Logout Successfull!");
    res.redirect("/");
  },

  deleteAddressGet :async(req,res)=>{
    const {id} =req.params
    if (ObjectId.isValid(id)) {

    const user = await User.findById(req.session.user._id)
         userHelpers.deleteAddress(user._id,id).then((response)=>{
            res.redirect('/viewAddress')
        })
      } else {
        res.redirect('/error');
      } 
},

editUsernamePost :async(req,res)=>{
   
  const user = await User.findById(req.session.user._id)
  userHelpers.changeUsername(req.body.username,user._id).then((response)=>{
    res.json(response);
  })
     
},

changePasswordGet :async(req,res)=>{
  const CATEGORY = await Category.find();
  const SUBCATEGORY = await SubCategory.find();
  const user = await User.findById(req.session.user._id);
  const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    res.render("users/changePassword", { user, cartCount,referral,referredUsers, wishlistCount,CATEGORY,SUBCATEGORY });
     
},

changePasswordPost :async(req,res)=>{
  let user = await User.findById(req.session.user._id)
  
  userHelpers.checkPassword(req.body.password,user).then(async(response)=>{
    if(response){
      await userHelpers.changePassword(req.body.newpassword,user)
      req.flash("success", "Password changed successfully!");
      res.redirect('/changePassword')
    }
    else{
      req.flash("error", "Current Password Doesn't Match");
      res.redirect("/changePassword");
    }
  })
},


myCoupons : async(req,res)=>{
  const CATEGORY = await Category.find();
  const SUBCATEGORY = await SubCategory.find();
  const user = await User.findById(req.session.user._id);
  const referral = await Referral.findOne()
    const referredUsers = await User.find({referral:user.referral_code})
    let cartCount = null;
    let wishlistCount = null;
    if (req.session.user) {
      wishlistCount = await cartHelpers.getWishlistCount(user);
      cartCount = await cartHelpers.getCartCount(user._id);
    }
    res.render("users/myCoupons", { user, cartCount,referral,referredUsers, wishlistCount,CATEGORY,SUBCATEGORY });
    
},

orderSuccess : async(req,res)=>{
  const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
  const user = await User.findById(req.session.user._id)
  req.session.couponApplied = false
  let cartCount = null
      let wishlistCount = null
      if(req.session.user){
          wishlistCount= await cartHelpers.getWishlistCount(user)
          cartCount = await cartHelpers.getCartCount(user._id)
      }
  res.render('users/orderSuccess',{user,cartCount,wishlistCount,CATEGORY,SUBCATEGORY})
},

ordersGet :  async(req,res)=>{
  const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
    const user = await User.findById(req.session.user._id)
   
    let cartCount = null
        let wishlistCount = null
        if(req.session.user){
            wishlistCount= await cartHelpers.getWishlistCount(user)
            cartCount = await cartHelpers.getCartCount(user._id)
        }
    let orders = await userHelpers.getUserOrders(user._id)
    for(item of orders){
        for(p of item.products){
            p.orderedDate = p.orderedDate.toLocaleString('default', { month: 'short' }) + " " +p.orderedDate.getDate()
            p.confirmedDate = p.confirmedDate?.toLocaleString('default', { month: 'short' }) + " " +p.confirmedDate?.getDate()
            p.deliveryDate = p.deliveryDate?.toLocaleString('default', { month: 'short' }) + " " +p.deliveryDate?.getDate()
            p.shippedDate = p.shippedDate?.toLocaleString('default', { month: 'short' }) + " " +p.shippedDate?.getDate()
            p.outfordeliveryDate = p.outfordeliveryDate?.toLocaleString('default', { month: 'short' }) + " " +p.outfordeliveryDate?.getDate()
            p.deliveredDate = p.deliveredDate?.toLocaleString('default', { month: 'short' }) + " " +p.deliveredDate?.getDate()
            p.cancelledDate = p.cancelledDate?.toLocaleString('default', { month: 'short' }) + " " +p.cancelledDate?.getDate()
            p.cancelledbyadminDate = p.cancelledbyadminDate?.toLocaleString('default', { month: 'short' }) + " " +p.cancelledbyadminDate?.getDate()
            p.returnRequestDate = p.returnRequestDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnRequestDate?.getDate()
            p.returnApprovedDate = p.returnApprovedDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnApprovedDate?.getDate()
            p.returnPickupedDate = p.returnPickupedDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnPickupedDate?.getDate()
            p.refundDoneDate = p.refundDoneDate?.toLocaleString('default', { month: 'short' }) + " " +p.refundDoneDate?.getDate()
            p.returnCancelledByAdminDate = p.returnCancelledByAdminDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnCancelledByAdminDate?.getDate()
            p.returnCancelledDate = p.returnCancelledDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnCancelledDate?.getDate()
            
        }        
    }
    res.render('users/orders',{user,cartCount,wishlistCount,orders,CATEGORY,SUBCATEGORY})
},

ordersViewProduct :  async(req,res)=>{
  try{
  const {orderId,proId} = req.params
  const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
  const user = await User.findById(req.session.user._id)
  let cartCount = null
      let wishlistCount = null
      if(req.session.user){
          wishlistCount= await cartHelpers.getWishlistCount(user)
          cartCount = await cartHelpers.getCartCount(user._id)
      }
      
      let order = await Order.findById(orderId)
      let index = order.products.findIndex(pro=>pro.item == proId)
      let productDetails = order.products[index]
      let returnAvailable = false
      let returnAvailableDate = null
      if(productDetails.deliveredDate ){
         returnAvailableDate = new Date(productDetails.deliveredDate.getTime() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 7)
         if(new Date()<= returnAvailableDate){
          returnAvailable = true
        }
        returnAvailableDate =returnAvailableDate.toLocaleString('default', { month: 'short' }) + " " +returnAvailableDate.getDate()
   
      }
          for(p of order.products){
              p.orderedDate = p.orderedDate.toLocaleString('default', { month: 'short' }) + " " +p.orderedDate.getDate()
              p.confirmedDate = p.confirmedDate?.toLocaleString('default', { month: 'short' }) + " " +p.confirmedDate?.getDate()
              p.deliveryDate = p.deliveryDate?.toLocaleString('default', { month: 'short' }) + " " +p.deliveryDate?.getDate()
              p.shippedDate = p.shippedDate?.toLocaleString('default', { month: 'short' }) + " " +p.shippedDate?.getDate()
              p.outfordeliveryDate = p.outfordeliveryDate?.toLocaleString('default', { month: 'short' }) + " " +p.outfordeliveryDate?.getDate()
              p.deliveredDate = p.deliveredDate?.toLocaleString('default', { month: 'short' }) + " " +p.deliveredDate?.getDate()
              p.cancelledDate = p.cancelledDate?.toLocaleString('default', { month: 'short' }) + " " +p.cancelledDate?.getDate()
              p.cancelledbyadminDate = p.cancelledbyadminDate?.toLocaleString('default', { month: 'short' }) + " " +p.cancelledbyadminDate?.getDate()
              p.returnRequestDate = p.returnRequestDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnRequestDate?.getDate()
              p.returnApprovedDate = p.returnApprovedDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnApprovedDate?.getDate()
              p.returnPickupedDate = p.returnPickupedDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnPickupedDate?.getDate()
              p.refundDoneDate = p.refundDoneDate?.toLocaleString('default', { month: 'short' }) + " " +p.refundDoneDate?.getDate()
              p.returnCancelledByAdminDate = p.returnCancelledByAdminDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnCancelledByAdminDate?.getDate()
              p.returnCancelledDate = p.returnCancelledDate?.toLocaleString('default', { month: 'short' }) + " " +p.returnCancelledDate?.getDate()
          }        
      
      
   
    let date = new Date().toLocaleDateString()
  res.render('users/orderProduct',{user,cartCount,wishlistCount,order,productDetails,returnAvailable,returnAvailableDate,CATEGORY,SUBCATEGORY,date})
        }catch{
          res.redirect('/error')
        }
},

verifyPayment : (req,res)=>{
  
  cartHelpers.verifyPayment(req.body).then(()=>{
      cartHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        order=req.session.order
        for(const element of order.products) {
          element.status = "confirmed";
          element.orderedDate = new Date(),
          element.confirmedDate = new Date(),
          element.deliveryDate = new Date(Date.now()+ 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * 10)
     }
        order.deliveryDetails._id=ObjectId(order.deliveryDetails._id)
        for(let item of order.products){
          item._id=ObjectId(item._id)
          item.item=ObjectId(item.item)
        }
          cartHelpers.razorpayPlaceOrder(req.session.order,req.session.id).then(()=>{
            req.session.order=null
            res.json({status:true})
          })
          
      })
  }).catch((err)=>{
      res.json({status:false})
  })
},

changeOrderStatusPost:(req,res)=>{
  cartHelpers.changeOrderStatus(req.body).then((response)=>{
    res.json(response)
  })
},

returnRequest:(req,res)=>{
  cartHelpers.changeOrderStatus(req.body).then((response)=>{
    res.json(response)
  })
},

invoiceGet : async(req,res)=>{
  const {id}=req.params
  if (ObjectId.isValid(id)) {
 const CATEGORY = await Category.find();
    const SUBCATEGORY = await SubCategory.find();
  const user = await User.findById(req.session.user._id)
  let cartCount = null
      let wishlistCount = null
      if(req.session.user){
          wishlistCount= await cartHelpers.getWishlistCount(user)
          cartCount = await cartHelpers.getCartCount(user._id)
      }
  const order = await Order.findById(id)
  order.orderedDate=order.placedDate.toLocaleDateString()
  res.render('users/invoice',{CATEGORY,SUBCATEGORY,user,cartCount,wishlistCount,order})
} else {
  res.redirect('/error');
} 
},

deactivateAccount : async(req,res)=>{
  userHelpers.confirmUser(req.body).then((response)=>{
    if(response){
      req.session.user=null
      res.redirect('/')
    }

  }).catch((err)=>{
    req.flash('error',err)
    res.redirect('/userProfile')
  })
}

};
