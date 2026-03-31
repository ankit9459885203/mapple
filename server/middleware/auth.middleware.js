const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;   // authorization column in postman

    // 1. Check  if i have selected any authrization or not
    if (!authHeader) {
      return res.status(401).json({
        message: "Token missing"
      });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1]; //  spliting and then skiping first one  coz "bearer" keyword was attached there.  eg - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   // this token have  both  id and role ,  you can see login logic in authcontroller.


    if (!token) {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }


     // 3. Verify token  -  verifying the signature  and returning the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);



       // 4. assigning the payload to req.user
    req.user = decoded; // { id, role }

    next(); // in app. js this will help to  move the flow  to the next middleware or any other route function.
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

