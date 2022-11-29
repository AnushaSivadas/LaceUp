const express = require("express");
const router = express.Router();
const { uuid } = require('uuidv4');
const adminController = require("../controller/admin-controller");
const Module = require("../middleware");


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
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpeg" ||
  //     file.mimetype == "image/webp"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Only .png, .jpg .webp and .jpeg format allowed!"));
  //   }
  // },
});



router.get("/", Module.notRequireAdminLogin,Module.cache,adminController.loginGet);

router.post("/login",adminController.loginPost);

router.get("/dashboard", Module.requireAdminLogin,Module.cache,adminController.dashboardGet);

router.get('/dashboard/catSalesReport',Module.requireAdminLogin,adminController.catSalesReport)

router.get('/salesReport', Module.requireAdminLogin, adminController.salesReport)

router.get('/report',Module.requireAdminLogin,adminController.report)

router.post('/custom-report',Module.requireAdminLogin,adminController.customReport)

router.get("/products", Module.requireAdminLogin,Module.cache,adminController.productsGet);

router.get("/addProduct", Module.requireAdminLogin,Module.cache,adminController.addProductGet);

router.post("/addProduct", upload.array("multi-image"),adminController.addProductPost);

router.get("/editProduct/:id", Module.requireAdminLogin,Module.cache,adminController.editProductGet);

router.put("/editProduct/:id", upload.array("multi-image"),adminController.editProductPut);

router.get("/deleteProduct/:id",adminController.deleteProduct);

router.get("/customers", Module.requireAdminLogin,Module.cache,adminController.customerGet);

router.get("/blockUser/:id",adminController.blockUser);

router.get("/category", Module.requireAdminLogin,Module.cache,adminController.categoryGet);

router.get("/addCategory",Module.cache,adminController.addCategoryGet);

router.post("/addCategory", upload.single("image"),adminController.addCategoryPost);

router.get("/editCategory/:id", Module.requireAdminLogin,Module.cache,adminController.editCategoryGet);

router.put("/editCategory/:id", upload.single("image"),adminController.editCategoryPut);

router.get("/deleteCategory/:id",adminController.deleteCategory);

router.get("/coupons", Module.requireAdminLogin,Module.cache,adminController.couponsGet);

router.get("/addCoupon", Module.requireAdminLogin,Module.cache,adminController.addCouponGet);

router.post("/addCoupon",Module.cache,adminController.addCouponPost);

router.get("/coupon-enable/:id", Module.requireAdminLogin,Module.cache,adminController.couponEnable)

router.get("/coupon-disable/:id", Module.requireAdminLogin,Module.cache,adminController.couponDisable)

router.get("/editCoupon/:id", Module.requireAdminLogin,Module.cache,adminController.editCouponGet);

router.post("/editCoupon/:id",adminController.editCouponPost);

router.get("/deleteCoupon/:id",adminController.deleteCoupon);

router.get("/subCategory", Module.requireAdminLogin,Module.cache,adminController.subCategoryGet);

router.get("/addSubCategory",Module.cache,adminController.addSubCategoryGet);

router.post("/addSubCategory", upload.single("image"),adminController.addSubCategoryPost);

router.get("/editSubCategory/:id", Module.requireAdminLogin,Module.cache,adminController.editSubCategoryGet);

router.put("/editSubCategory/:id", upload.single("image"),adminController.editSubCategoryPut); 

router.get("/deleteSubCategory/:id",adminController.deleteSubCategory);

router.get("/orders",Module.requireAdminLogin,Module.cache,adminController.ordersGet);

router.get("/orderProducts/:id",Module.requireAdminLogin,Module.cache,adminController.orderProductsGet);

router.post('/orders/change-order-status',adminController.changeOrderStatusPost);

router.get("/banners",Module.requireAdminLogin,Module.cache,adminController.bannersGet);

router.get("/addBanner",Module.cache,adminController.addBannerGet);

router.post("/addBanner", upload.single("image"),adminController.addBannerPost);

router.get("/editBanner/:id", Module.requireAdminLogin,Module.cache,adminController.editBannerGet);

router.put("/editBanner/:id", upload.single("image"),adminController.editBannerPut);

router.get("/deleteBanner/:id",adminController.deleteBanner);

router.get("/offers",Module.requireAdminLogin,Module.cache,adminController.offersGet);

router.post("/edit-referrals",Module.requireAdminLogin,Module.cache,adminController.editReferralsGet);

router.get("/addCategoryOffer",Module.requireAdminLogin,Module.cache,adminController.addCatgeoryOfferGet);

router.post("/addCategoryOffer",Module.cache,adminController.addCategoryOfferPost);

router.get("/categoryOffer-enable/:id", Module.requireAdminLogin,Module.cache,adminController.catOffEnable)

router.get("/categoryOffer-disable/:id", Module.requireAdminLogin,Module.cache,adminController.catOffDisable)

router.get("/editCategoryOffer/:id", Module.requireAdminLogin,Module.cache,adminController.editCatOffGet);

router.post("/editCategoryOffer/:id",adminController.editCatOffPost);

router.get("/deleteCategoryOffer/:id",adminController.deleteCatOff);

router.get("/logout",Module.cache,adminController.logout);

router.get("/getChartData",Module.cache,adminController.getChartData);

module.exports = router;
