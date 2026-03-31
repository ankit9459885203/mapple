const { Favorite, Product } = require("../models");

//add product to favourite ________________________________________________________________________________________________________________

exports.addToFavorite = async (req, res) => {
  try {
    const userId = req.user.id;           // from auth middleware
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    // check if already favorited
    const alreadyExists = await Favorite.findOne({
      where: { userId, productId },
    });

    if (alreadyExists) {
      return res.status(409).json({
        message: "Product already added to favorites",
      });
    }

    const favorite = await Favorite.create({
      userId,
      productId,
    });

    return res.status(201).json({
      message: "Product added to favorites",
      data: favorite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};




// Remove product from favorites___________________________________________________________________________________________________

exports.removeFromFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, productId },
    });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    await favorite.destroy(); // soft delete (paranoid: true)

    res.status(200).json({
      message: "Product removed from favorites",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// get all favourite products__________________________________________________________________________________________________________________
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [  //  joining  product model.
        {
          model: Product,
          as: "product",
        },
      ],
    });

    res.status(200).json({
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
