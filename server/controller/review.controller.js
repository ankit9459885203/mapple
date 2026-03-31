// note:-  go to users  table there i have commneted  things in brief , in rest model i only commneted new things which were not in users model

const { Review, Product } = require("../models");

//add review-------------------------------------------------------------------------------------------------------------------------------------------------
exports.addReview = async(req,res)=>{
    try {
const userId = req.user.id;
const  {productId ,rating ,reviewText} = req.body;

   if (!productId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId and rating are required"
      });
    }


  // rating range
  if (rating < 1 || rating > 5) {
  return res.status(400).json({
    success: false,
    message: "Rating must be between 1 and 5"
  });
}
  
    
 // check product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }


 // check if user already reviewed this product (including soft deleted)
    const existingReview = await Review.findOne({
      where: { userId, productId },
      paranoid: false
    });

// if review exists  restore and update
 if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product. Reviews cannot be updated."
      });
    }



    // create new review
      const review = await Review.create({
      rating,
      reviewText,
      userId,
      productId
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: " error in adding review",
            error: error.message
        })
        
    }
}



//  we cant  update or  delete  the review __________________________________________________________________________________________________________________________
