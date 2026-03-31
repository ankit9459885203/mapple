const { Like, Product } = require("../models");

/**
 * TOGGLE LIKE (LIKE / UNLIKE)_____________________________________________________________________________________________________
 * 
 */
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    //  Check product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    //  Find like including soft-deleted
    const like = await Like.findOne({
      where: { userId, productId },
      paranoid: false,
    });

    //  No row → CREATE (LIKE)
    if (!like) {
      await Like.create({ userId, productId });

      return res.status(200).json({
        success: true,
        liked: true,
        message: "Product liked",
      });
    }

    // Row exists but soft-deleted → RESTORE (LIKE)
    if (like.deletedAt) {
      await like.restore();

      return res.status(200).json({
        success: true,
        liked: true,
        message: "Product liked",
      });
    }

    //  Row exists & active → SOFT DELETE (UNLIKE)
    await like.destroy();

    return res.status(200).json({
      success: true,
      liked: false,
      message: "Product unliked",
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


  //  GET LIKE COUNT___________________________________________________________________________________________________________________
exports.getLikeCount = async (req, res) => {
  try {
    const { productId } = req.params;

    const count = await Like.count({
      where: { productId },
    });

    return res.status(200).json({
      success: true,
      likeCount: count,
    });
  } catch (error) {
    console.error("Like Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
