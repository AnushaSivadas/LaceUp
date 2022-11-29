var express = require("express");
var router = express.Router();
const Module = require("../middleware");
const userController = require("../controller/user-controller");
const { uuid } = require('uuidv4');

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null,uuid()+".png"); //Appending extension
  },
});

const upload = multer({
  storage: storage,
 
});

///////////////Home Page////////////////

router.get("/",Module.storeCurrentRoute, userController.homeGet);

///////////////Register////////////////

router.get("/userRegister", Module.notRequireLogin,userController.registerGet);

router.post("/userRegister", userController.registerPost);

///////////////Login////////////////

router.get("/userLogin",  Module.notRequireLogin, Module.cache,userController.loginGet);

router.post("/userLogin", userController.loginPost);

///////////////Product Details////////////////

router.get("/productDetails/:id",Module.storeCurrentRoute, userController.productDetailsGet);

///////////////Cat View////////////////

router.get("/categoryView/:id", userController.categoryViewGet);

router.get("/subCategoryView/:id",Module.storeCurrentRoute, userController.subCategoryViewGet);

///////////////OTP login////////////////

router.get("/enterphno", userController.enterphnoGet);

router.post("/enterphno", userController.enterphnoPost);

router.get("/otplogin", userController.otploginGet);

router.post("/otplogin", userController.otploginPost);

///////////////Login needed////////////////

router.get("/loginNeedATC", userController.loginNeedATCget);

router.get("/loginNeedWL", userController.loginNeedWLget);

///////////////Wishlist////////////////

router.patch("/add-wishlist-item", userController.addToWishlistPost);

router.get("/addToWishlist/:id", userController.addToWishlistGet);

router.get("/wishlist",Module.requireLogin, userController.wishlistGet);

router.get('/deleteWishlist/:id',userController.deleteWishlistGet);

router.patch('/remove-wishlist-item',userController.removeWishlistItemPost);

///////////////Cart////////////////

router.get("/addToCart/:id",Module.requireLogin, userController.addToCartGet);

router.post("/add-item-to-cart",Module.requireLogin, userController.addItemToCartGet);

router.get("/addToGuestCart/:id", userController.addToGuestCartGet);

router.get("/cart",Module.requireLogin,Module.storeCurrentRoute, userController.cartGet);

router.get("/guestCart",Module.storeCurrentRoute, userController.guestCartGet);

router.post('/change-product-quantity',userController.changeProductQuantityPost);

router.post('/change-guest-product-quantity',userController.changeGuestProductQuantityPost);

router.post('/remove-cart-item',userController.removeCartItemPost);

router.post('/remove-guest-cart-item',userController.removeGuestCartItemPost);

router.post('/save-for-later',userController.saveForLater);

router.post('/move-to-cart',userController.moveToCart);

router.post('/remove-savedItem',userController.removeSavedItem);

router.get('/placeOrder',Module.requireLogin,userController.placeOrderGet);

router.get('/guestPlaceOrder',Module.requireLogin,userController.guestPlaceOrderGet);

///////////////Place Order////////////////

router.post('/placeOrder',userController.placeOrderPost);

router.post('/guestPlaceOrder',userController.guestPlaceOrderPost);

router.post('/apply-coupon',userController.applyCoupon)

router.get('/remove-coupon', Module.requireLogin, userController.removeCoupon)

///////////////User Profile////////////////

router.get('/userProfile',Module.requireLogin,userController.userProfileGet);

router.post('/edit-profile-pic',Module.requireLogin,upload.single("image"),userController.editProfilePic);

router.get('/viewAddress',Module.requireLogin,userController.viewAddressGet);

router.get('/addAddress',Module.requireLogin,userController.addAddressGet);

router.post('/addAddress',userController.addAddressPost);

router.post('/addNewAddress',userController.addNewAddressPost);

router.get('/editAddress/:id',Module.requireLogin,userController.editAddressGet);

router.post('/editAddress/:id',userController.editAddressPost);

router.patch('/edit-address-place-order',userController.editAddressPlaceOrder);

router.get('/deleteAddress/:id',userController.deleteAddressGet);

router.post('/editUsername',Module.requireLogin,userController.editUsernamePost)

router.get('/changePassword',Module.requireLogin,userController.changePasswordGet);

router.post('/changePassword',userController.changePasswordPost);

router.get('/myCoupons',Module.requireLogin,userController.myCoupons);

router.get('/orderSuccess',Module.requireLogin,userController.orderSuccess);

router.get('/orders',Module.requireLogin,userController.ordersGet);

router.get('/orders/viewProduct/:orderId/:proId',Module.requireLogin,userController.ordersViewProduct);

router.post('/orders/change-order-status',Module.requireLogin,userController.changeOrderStatusPost);

router.post('/orders/return-item',Module.requireLogin,userController.returnRequest);

router.post('/verify-payment',userController.verifyPayment)

router.get("/userLogout", Module.cache, userController.logoutGet);

router.get('/invoice/:id',Module.requireLogin,userController.invoiceGet)

router.post('/deactivateAccount',userController.deactivateAccount)

module.exports = router;
