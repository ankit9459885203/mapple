exports.checkRole = (...allowedRoles) => {
  // these three dots (...) are known as rest perameter , They provide flexibility in function parameters, allowing us to pass one, two, three, or
  //  any number of arguments. , note- three dots are rest perameter and allowedRoles is variable name given to them , it can be anything.
  return (req, res, next) => {
    //  req. user includedes the payload (id and role) you can check the authmiddleware logic

    // step 1.  do data exist in these fields or not
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied , token is missing / invalid ",
      });
    }

    // step 2.  is  the user have valid role or not
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};
