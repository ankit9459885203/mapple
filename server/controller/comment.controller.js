// note:-  go to users  table there i have commneted  things in brief , in rest model i only commneted new things which were not in users model

const { Comment,Product } = require("../models");

// create comment ___________________________________________________________________________________________________________________________


exports.createComment= async(req,res)=>{


    try {
const userId = req.user.id;
const {productId , content} = req.body;

 if (!productId || !content) {
      return res.status(400).json({
        success: false,
        message: "productId and content are required"
      });
    }


   // check product exists or not 
   const product = await Product.findByPk(productId);
   if(!product){
    return res.status(404).json({
        success: false,
        message :"product not found"
    });
   }

const comment  = await Comment.create({
    content,
    userId,
    productId
});

return res.status(201).json({
    success:true,
    message:"comment added successfully",
    comment
});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message: "product not found"
        });
        
    }


}


// delete comment ______________________________________________________________________________________________

exports.deleteComment= async(req,res)=>{
    try{
        const userId = req.user.id; // user can delete its own commnet only, not others comment
        const {id} = req.params;  // commentID

          if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id"
      });
    }

 const comment = await Comment.findByPk(id);

  // authorization check , user can delte its own commnet only
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comment"
      });
    }

   await comment.destroy(); // soft delete

   return res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message
    });
  }
};



// edit comment ___________________________________________________________________________________________________
exports.editComment = async(req,res)=>{

    try {
         const userId = req.user.id;        // logged-in user
    const { id } = req.params;         // commentId
    const { content } = req.body;      // updated content

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id"
      });
    }


      const comment = await Comment.findByPk(id);

      
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // authorization: only owner can edit
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own comment"
      });
    }
         // update comment
     comment.content = content;
    await comment.save();
        

 return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment
    });


    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success:false,
            message: "content is required"
        });
        
    }
}