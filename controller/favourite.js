const {
  createFavorite,
  getFavorite,
  updateFavorite,
  findFavorite,
  findFavoriteById,
  insertManyFavorite,
  removeFavourite
} = require("../models/favourite");
const { findUser } = require("../models/user");
const { findPropertybyId } = require("../models/property");
const { parseBody, generateResponse } = require("../utils/index");
const { STATUS_CODE } = require("../utils/constants");

exports.addToFavourite = async (req, res, next) => {
  try {
    const { propertyId } = parseBody(req.body);
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    const property = await findPropertybyId(propertyId);

    if (!property) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "No Property Found",
      });
    }

    const favorite = await getFavorite({
      propertyId: propertyId,
      userId: req.user.id,
    });
    console.log(favorite)
    if (favorite.length > 0) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Already in favorite list",
      });
    }

    let addtoFavourite = await createFavorite({
      propertyId: propertyId,
      userId: req.user.id,
      type:"property"
    });

    generateResponse(addtoFavourite, "Added to Favourite Successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.removeFromFavorite = async (req, res, next) => {
  try {
    const { userId, propertyId } = parseBody(req.body);
    const favorites = await findFavorite(propertyId, userId);
    console.log(favorites)
    if (!favorites) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "The item you want to remove does not exist",
      });
    }
    
    await removeFavourite({ _id: favorites._id });
    generateResponse({}, "Removed From Favourite Successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await getFavorite({ userId: req.user.id });

    if (!favorites || favorites.length === 0) {
      return next({
        statusCode: STATUS_CODE.NOT_FOUND,
        message: "No favorite properties found",
        data: favorites
      });
    }

    generateResponse(favorites, "Fetched Favorites Successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};
