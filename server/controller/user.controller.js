
const { User } = require("../models"); // able to do this because in models we have index.js file.   but for other folder files we have to mention full path.


// getting all the users--------------------------------------------------------------------------------------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password", "deleted_at"]
      },
      order: [["createdAt", "DESC"]] // newest first
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// getting based on id ----------------------------------------------------------------------------------------------------------------------------

exports.getUserById = async(req, res) =>{
  try {
   
    const {id} = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {  // not given , not number , is even number
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }


    const user = await User.findByPk(id,{
      attributes:{
        exclude:["password" , "deleled_at"]
      }
    })


    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }


    return res.status(200).json({
      success:true,
      user
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success:false,
      message:"failed to fetch by id",
      error: error.message
    });
    
  }
};


// update user-----------------------------------------------------------------------------------------------------------------

exports.updateUser=  async(req,res)=>{
  try{
    const{id} = req.params;
 //  1. Validate ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    // 2. Find user 
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    //  3. Extract allowed fields ONLY
    const{
      full_name,
      phone_number,
      profile_image_url
    }= req.body;

    // doing this validaton because in put http method we have to update all the fields , if we want only some to update then use PATCH
  if (
      full_name === undefined &&
      phone_number === undefined &&
      profile_image_url === undefined
    ) {

      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    //  updation with inbuilt update method
     await user.update({
      full_name,
      phone_number,
      profile_image_url
     });


     // sending response back
     return res.status(200).json({
      success:true,
      message:"user updated successffully",
       user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        profile_image_url: user.profile_image_url,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};


//Softdelete user  with paranoid : true   , deleted_at: DataTypes.DATE  ---------------------------------------------------------------------------------------------------------

exports.deleteUser = async(req,res) =>{
  try{
    const{id} = req.params;

   // Validate ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }


    
    const user = await User.findByPk(id);

    if(!user){
      return res.status(404).json({
        success: false,
        message:"user not found"
      });
    }


     //  Soft delete
    await user.destroy(); // sets deleted_at automatically


     //  Response
    return res.status(200).json({
      success: true,
      message: "soft deletion of user has been done  successfully"
    });

   } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};



// permanent delete ----------------------------------------------------------------------------------------------------------------------
exports.permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    // explicitly   making paranoid false
    const user = await User.findByPk(id, {paranoid: false});  // explicitly   making paranoid false , because paranoid :true in model is responsible for soft delete.

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    await user.destroy({ force: true });  // HARD DELETE-   by using force:true

    return res.status(200).json({
      success: true,
      message: "User permanently deleted"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete user",
      error: error.message
    });
  }
};


// get users profile _____________________________________________________________________________________________________________________
// GET MY PROFILE ------------------------------------------------------------------------------------------------
exports.getMyProfile = async (req, res) => {
  try {
    // userId comes ONLY from token
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: {  
       // here we are not  writing "model" keyword and writing the  "excludes" keyword,   this is becuase we are querying in a 
       //  same  model table.
        exclude: [  
          "password",
          "deleted_at",
          "reset_password_token",
          "reset_password_expires",
        ],
      },
    });

    if (!user) {
      // edge case: user deleted but token still exists
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


// UPDATE MY PROFILE ------------------------------------------------------------------------------------------------
exports.updateMyProfile = async (req, res) => {
  try {

    /* the two diffrences between updateUser and UpdateMyProfile is  -    updateUser only admin krega , but here user is doing changes in 
     its own profile , hence here we are getting  the id   from req.user.id   mtlv from token of loged in user , but in updateUser query
    i was  getting it explicitly  from req.params  -   "/updateUser/:id" .    but in  this case no need to give id explicitly.  */

    // Get user id from token (NOT params)
    const userId = req.user.id;

    // Find logged-in user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  
    const {
      full_name,
      phone_number,
      profile_image_url,
    } = req.body;

  
    if (
      full_name === undefined &&
      phone_number === undefined &&
      profile_image_url === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

 
    await user.update({
      full_name,
      phone_number,
      profile_image_url,
    });

  
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        profile_image_url: user.profile_image_url,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
