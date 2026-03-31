// note:-  go to users  table there i have commneted  things in brief , in rest model i only commneted new things which were not in users model

const { parse } = require("dotenv");
const{Product , Category ,Comment , User , sequelize } = require("../models");
const { Op, literal } = require("sequelize");  // op is sql operators like OR ,AND < = etc.  literal are used for writing raw query.



// create products (admin only)__________________________________________________________________________________



exports.createProduct=  async (req , res)=>{

    try {

        const{
            name,
            specification,
            price,
            colour,
            ratings,
            image,
            categoryId
        } = req.body;

        const file = req.file;

if (!name || !price  || ! categoryId ){
    return res.status(400).json({
        success: false,
        message: "fields are missing"
    });
}

// validate for category 
const category = await Category.findByPk(categoryId);
if(! category){
    return res.status(404).json({
        success: false,
        message: "category not found"
    });
}

// prevent duplicate product
const existingProduct = await Product.findOne({where : {name}});
if (existingProduct){
    return res.status(409).json({
        success: false ,
        messsage: "product with this name already exist  "

    });
}


    // image url creation
    let imageUrl = null;

    if (file) {
      imageUrl = `/public/product-images/${file.filename}`;
    }


const product =  await Product.create({
            name,
            specification,
            price,
            colour,
            ratings,
            image : imageUrl ,
            categoryId

});

 return res.status(201).json({
    success: true,
    message:"product created successfully",
    product
 })

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        success:false,
        message: "error in creating the product",
        error: error.message
        });
    }
};












// getting all the product__________________________________________________________________________
exports.getAllProducts = async (req, res) => {
  try {
    const userId = req.user?.id;// ? is the optional chainging operator ,if the value is null or undefined then instead of crash it return undefined
    //  it is written after object and before property or method
    // here it is telling that apply optional chaining on req.user and then access the id
    // so here if req.user dont exist then instead of throwing errror it will return undefined. hence no crash
    // cant use try catch for this because it will lead to bad design practise , try catch is used for  unexpected failure but
    // here nothing is unexpected.
    // getting this req.user from token , as you know .
    // also here instead of optional operator can't user validation coz , this line will execute (crash) before going to that validation.
 

    // applying  search , filter ,sorting feature--
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = req.query; //  here i  m using query perameter for sorting,filter and all.

    const whereCondition = {}; /* we need this empty js object to tell the  sql querycondition , as we doing in next line , it acts same to this condtion
    Product.findAll({
  where: whereCondition
});
*/

    //  search
    if (search) {
      whereCondition[Op.or] = [ // in where condtion mentioning "OR" operator  coz niche  two condition hai , operator k saath op keyword mandatory
        { name: { [Op.like]: `%${search}%` } },   //'${}' is template literal in java script , and this percetage symbols in both end means that
        { specification: { [Op.like]: `%${search}%` } },// find that  word in a string evrywhere,  no matter start end or middle
      ];
    }

    // 🎯 category filter
    if (categoryId) {       // it tells if user is mentioning  category id of product then in where condtion mention the category id
      whereCondition.categoryId = categoryId;
    }

    // 💰 price filter
    if (minPrice || maxPrice) {      // ye vala || or operator java script code kaa hai , uper humne sql query likhi thiii.
      whereCondition.price = {};
      if (minPrice) whereCondition.price[Op.gte] = minPrice;
      if (maxPrice) whereCondition.price[Op.lte] = maxPrice;
    }

    // 🔃 sorting
    let orderBy = [["createdAt", "DESC"]];// this is default order , if user is not asking for sorting
    const validSortFields = ["price", "createdAt", "ratings"]; // validation which tells that , sorting can be done on these basis

    if (sortBy && validSortFields.includes(sortBy)) { // checks two things - is sortBy given by user ||  is it from present columns or not
      orderBy = [[sortBy, order?.toUpperCase() === "ASC" ? "ASC" : "DESC"]];   // ternary operator-> condition ? value_if_true : value_if_false
      //sort by we are getting from user , then we are saying if  order is given by user then make it to uppper case ,  then with ===  we are saying
      // if user is giving order query as "ASC"  then sort by  ascending order , else in DESC order.
      // the ternary operator condition is applied  only on order  , not in  sortBy.
    }


    const products = await Product.findAll({ // getting all from products
      where: whereCondition,
        include: [    // also joining the category table with them
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "image"]
        }
      ],

     attributes: {
        include: [ // in above include mentioning model but  not here coz ther i need a lot of data with fields hence giving model name and
            // in response getting object , but here we need a single value so directly write sql query.
            // able to access likes not by relationships or index.js , but with this raw query, it directly go to database.
          [   // counts all the likes of product
            sequelize.literal(`(    
              SELECT COUNT(*)
              FROM likes
              WHERE likes.product_id = Product.id
              AND likes.deleted_at IS NULL
            )`),
            "likeCount",  //alias
          ],



          // 💬 comment count
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments.product_id = Product.id
              AND comments.deleted_at IS NULL
            )`),
            "commentCount",
          ],

  
      //  ❤️ isLiked (user specific)

          userId   // tell the user who is watching the product that  you have liked this product or not
            ? [  // after userId using ternary operator here , this is the flow -       condition ? value_if_true : value_if_false
                sequelize.literal(`(
                  SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
                  FROM likes
                  WHERE likes.product_id = Product.id
                  AND likes.user_id = ${userId}
                  AND likes.deleted_at IS NULL
                )`),
                "isLiked", // this is also alias , it will come as a field in my response. becuase i have mentioined it inside attributes & include
              ]
            : [sequelize.literal("false"), "isLiked"], // if is liked  do not exist then make it false.
        ],
      },

      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }

}


// get  product by id_________________________________________________________________________________________________________________________-

exports.getProductById = async (req,res)=>{
    try{
        const{id}  = req.params ;
         const userId = req.user?.id;  // ? is optional chaining operator

        if(!id ||  isNaN(id) || parseInt(id)<=0  ){
            return res.status(400).json({
                success: false,
                message: "invalid product id"
            });
        }


const product = await Product.findByPk(id,{
    include:[
{
    model:Category,
    as : "category",
    attributes: ["id" , "name" , "image"]
},

   // here still i am on inlcude block  ,  ye vala include block is for models object , niche vala is for a single value
    // 💬 Comments list
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "content", "createdAt"],
          where: { deleted_at: null }, // only active comments
          required: false, // we have to  make it false, otherwise if there is no comment the product will not return.
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "full_name", "profile_image_url"],
            },
          ],
        },
      ],

 attributes: {
        include: [
          //  like count
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes
              WHERE likes.product_id = Product.id
              AND likes.deleted_at IS NULL
            )`),
            "likeCount",   
          ],

            // 💬 comment count
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments.product_id = Product.id
              AND comments.deleted_at IS NULL
            )`),
            "commentCount",
          ],

  
      //  ❤️ isLiked (user specific)
          userId
            ? [
                sequelize.literal(`(
                  SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
                  FROM likes
                  WHERE likes.product_id = Product.id
                  AND likes.user_id = ${userId}
                  AND likes.deleted_at IS NULL
                )`),
                "isLiked",
              ]
            : [sequelize.literal("false"), "isLiked"],
        ],
      },


});

if (!product){
    return res.status(404).json({
        success:false,
        message:"product not found"
    });
}

   return res.status(200).json({
      success: true,
      product
    });



   } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message
    });
  }
};


//    update product -----------------------------------------------------------------------------------------------

exports.updateProduct = async(req,res) =>{


    try {

        const {id} = req.params;

        if(!id || !isNaN(id)|| parseInt(id)<=0 ){
            return res.status(400).json({
                success:false,
                message:"invalid product id"

            })
        }


        const product = await Product.findByPk(id);
         if(!product){
           return res.status(404).json({
                success:false,
                message:"procut not found"
            });
         }


         const {
      name,
      specification,
      price,
      colour,
      ratings,
      image,
      categoryId
    } = req.body;


    if (name === undefined &&
        specification === undefined &&
        price === undefined &&
        colour === undefined &&
        ratings === undefined &&
        image === undefined  &&
        categoryId === undefined
    ) {
         return res.status(400).json
    }


        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:"false",
            message : "product not found"

        });

        
    }
}





//soft delete ____________________________________________________________________________________________________________________

exports.softDelete= async(req,res)=>{
    try {

        const{id}= req.params;
        if(!id || isNaN(id) || parseInt(id)<=0){
            return res.status(400).json({
                success: false,
                message: " provide valid product id",
                error: error.message
            });
        }

const product = await Product.findByPk(id);
if(!product){
    return res.status(404).json({
        success:false,
        message:"product not found"
    });
}


await product.destroy();

return res.status(200).json({
    success:true,
    message:" product soft deleted successfully",
});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:"false",
            message: "error in softdeleting  the product",
            error:error.message
        });
        
    }

}



// permanent delete ________________________________________________________________________________________________________________--

exports.delete =  async(req, res)=>{
    try {

        const{id}= req.params;

        if(!id ||  isNaN(id) || parseInt(id)<=0){
            return res.status(400).json({
                success:false,
                message:"invalid  product id"
            });
        }

        const product = await Product.findByPk(id, {paranoid:false}) // paranoid false

        if(!product){
            return res.status(404).json({
                success:false,
                message:"product not found"
            });
        }

await product.destroy({force:true});
return res.status(200).json({
    success:true,
    message : "product has been deletd successfully"
});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: " error to delete permanantly",
            error: error.message
        })
        
    }
}