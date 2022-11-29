const Category = require("../models/category");
const Banner = require("../models/banner");
const SubCategory = require("../models/subCategory");
const Product = require("../models/product");
const ObjectId = require('mongoose').Types.ObjectId;


module.exports = {
  addProduct: (productData, productImages) => {
    return new Promise(async (resolve, reject) => {
      const product = new Product(productData);
      product.sellingprice=Math.floor(productData.actualprice-(productData.actualprice*(productData.discount/100)))
      product.images = productImages.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));
      await product.save().then((data) => {
        resolve(data);
      });
    });
  },
  
  editProduct: (productId, productData, productImages) => {
    return new Promise(async (resolve, reject) => {
      productData.sellingprice=Math.floor(productData.actualprice-(productData.actualprice*(productData.discount/100)))
      let updateProduct = await Product.findByIdAndUpdate(
        productId,
        productData
        ,{new:true});
      
      if (productImages[0]) {
        let updateImages = productImages.map((f) => ({
          url: f.path,
          filename: f.filename,
        }));
        let updateData = await Product.findByIdAndUpdate(productId, {
          images: updateImages,
        },{new:true});
        resolve(updateData);
      } else resolve(updateProduct);
    });
  },
  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.findByIdAndDelete(productId).then(
        (result) => {
          resolve(result);
        }
      );
    });
  },

  doLookupProducts: () => {
    return new Promise(async (resolve, reject) => {
      const product = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo",
          },
          
          
        },
        {
          $unwind: "$categoryInfo",
         
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategoryInfo",
          },
          
          
        },
        {
          $unwind: "$subCategoryInfo",
         
        },
      ]);
      
      resolve(product);
    });
  },

  addCategory: (categoryData, categoryImage) => {
    return new Promise(async (resolve, reject) => {
      let categoryName = categoryData.name;
      const categoryexist = await Category.findOne( { "name" : { $regex : new RegExp(categoryName, "i") } });
      if (categoryexist) {
        resolve();
      } else {
        const category = new Category(categoryData);
        // category.image= categoryImage.map(f=>({url:f.path,filename:f.filename}))
        category.image.url = categoryImage.path;
        category.image.filename = categoryImage.filename;
        await category.save().then((data) => {
          resolve(data);
        });
      }
    });
  },
  editCategory: (categoryId, categoryData, categoryImage) => {
    return new Promise(async (resolve, reject) => {
      let categoryName = categoryData.name;
      console.log(categoryName,categoryId)
      const categoryexist = await Category.findOne( {name:{ $regex : new RegExp(categoryName, "i") },_id:{$ne:ObjectId(categoryId)}});
      
      if (categoryexist) {
        resolve();
      }else{
      let updateCategory = await Category.findByIdAndUpdate(
        categoryId,
        categoryData,
        { new: true }
      );
      if (categoryImage) {
        let updateImage = await Category.findByIdAndUpdate(
          categoryId,
          {
            image: {
              url: categoryImage.path,
              filename: categoryImage.filename,
            },
          },
          { new: true }
        );
        resolve(updateImage);
      } else {
        resolve(updateCategory);
      }
    }
    });
  },
  deleteCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      const products = await Product.find({category:categoryId})
      if(products.length==0){
      const category = await Category.findByIdAndDelete(categoryId).then(
        (result) => {
          resolve(result);
        }
      );
      }
      else
      resolve()
    });
  },

  addSubCategory: (categoryData, categoryImage) => {
    return new Promise(async (resolve, reject) => {
      let categoryName = categoryData.name;
      const categoryexist = await SubCategory.findOne( { "name" : { $regex : new RegExp(categoryName, "i") } });
      if (categoryexist) {
        resolve();
      } else {
        const category = new SubCategory(categoryData);
        // category.image= categoryImage.map(f=>({url:f.path,filename:f.filename}))
        category.image.url = categoryImage.path;
        category.image.filename = categoryImage.filename;
        await category.save().then((data) => {
          resolve(data);
        });
      }
    });
  },

  editSubCategory: (categoryId, categoryData, categoryImage) => {
    return new Promise(async (resolve, reject) => {
      let categoryName = categoryData.name;
      console.log(categoryName,categoryId)
      const categoryexist = await SubCategory.findOne( {name:{ $regex : new RegExp(categoryName, "i") },_id:{$ne:ObjectId(categoryId)}});
      console.log(categoryexist)
      if (categoryexist) {
        resolve();
      }else{
      let updateCategory = await SubCategory.findByIdAndUpdate(
        categoryId,
        categoryData,
        { new: true }
      );
      if (categoryImage) {
        let updateImage = await SubCategory.findByIdAndUpdate(
          categoryId,
          {
            image: {
              url: categoryImage.path,
              filename: categoryImage.filename,
            },
          },
          { new: true }
        );
        resolve(updateImage);
      } else {
        resolve(updateCategory);
      }
    }
    });
  },

  deleteSubCategory: (subCategoryId) => {
    return new Promise(async (resolve, reject) => {
      const products = await Product.find({subCategory:subCategoryId})
      if(products.length==0){
      await SubCategory.findByIdAndDelete(subCategoryId).then(
        (result) => {
          resolve(result);
        }
      );
      }
      else
      resolve()
    });
  },
  
  
  addBanner: (bannerData, bannerImage) => {
    return new Promise(async (resolve, reject) => {
      
      let bannerName = bannerData.name;
      const bannerexist = await Banner.findOne( { "name" : { $regex : new RegExp(bannerName, "i") } });
      if (bannerexist) {
        resolve();
      } else {
        const banner = new Banner(bannerData);
        // category.image= categoryImage.map(f=>({url:f.path,filename:f.filename}))
        banner.image.url = bannerImage.path;
        banner.image.filename = bannerImage.filename;
        await banner.save().then((data) => {
          resolve(data);
        });
      }
    });
  },

  editBanner: (bannerId, bannerData, bannerImage) => {
    return new Promise(async (resolve, reject) => {
      let bannerName = bannerData.name;
      console.log(bannerName,bannerId)
      const bannerexist = await Banner.findOne( {name:{ $regex : new RegExp(bannerName, "i") },_id:{$ne:ObjectId(bannerId)}});
      
      if (bannerexist) {
        resolve();
      }else{
      let updateBanner = await Banner.findByIdAndUpdate(
        bannerId,
        bannerData,
        { new: true }
      );
      if (bannerImage) {
        let updateImage = await Banner.findByIdAndUpdate(
          bannerId,
          {
            image: {
              url: bannerImage.path,
              filename: bannerImage.filename,
            },
          },
          { new: true }
        );
        resolve(updateImage);
      } else {
        resolve(updateBanner);
      }
    }
    });
  },

  deleteBanner: (banId) => {
    return new Promise(async (resolve, reject) => {
    
      await Banner.findByIdAndDelete(banId).then(
        (result) => {
          resolve(result);
        }
      );
     
    });
  },

  findRelatedProductsCategory: (category,subCategory,proId) => {
    return new Promise(async (resolve, reject) => {
      
        let categoryProduct = await Product.find({ category: category ,subCategory:subCategory,_id:{$ne:proId}}).limit(4)
       
        resolve(categoryProduct)
    })
},

editProductprice: (id,price) => {
  return new Promise(async (resolve, reject) => {
    const product = await Product.findByIdAndUpdate(id,{sellingprice:price}, { new: true })
resolve(product)

  });
}
};
