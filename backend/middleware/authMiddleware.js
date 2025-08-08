const jwt = require("jsonwebtoken");
const SECRET = "ABCD@1234";


function authMiddleware(req,res,next){
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
  
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
  
    jwt.verify(token, SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  
}

module.exports = authMiddleware;