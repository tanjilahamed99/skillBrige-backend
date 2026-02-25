const jwt = require("jsonwebtoken");
const User = require("../modals/User");

exports.adminOnly = async (req, res, next) => {
    let token;
    
    // Check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.AUTH_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            
            // Check if user is admin
            if (user.role !== "admin") {
                return res.status(403).json({ 
                    message: "Access denied. Admin privileges required" 
                });
            }
            
            // Attach user to request and proceed
            req.user = user;
            next();
            
        } catch (err) {
            return res.status(401).json({ 
                message: "Not authorized, token failed",
                error: err.message 
            });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
exports.instructorOnly = async (req, res, next) => {
    let token;
    
    // Check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.AUTH_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            
            // Check if user is instructor
            if (user.role !== "instructor") {
                return res.status(403).json({ 
                    message: "Access denied. Instructor privileges required" 
                });
            }
            
            
            // Attach user to request and proceed
            req.user = user;
            next();
            
        } catch (err) {
            return res.status(401).json({ 
                message: "Not authorized, token failed",
                error: err.message 
            });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
exports.superAdminOnly = async (req, res, next) => {
    let token;
    
    // Check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.AUTH_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            
            // Check if user is superAdmin
            if (user.role !== "superAdmin") {
                return res.status(403).json({ 
                    message: "Access denied. Super Admin privileges required" 
                });
            }
            
            
            // Attach user to request and proceed
            req.user = user;
            next();
            
        } catch (err) {
            return res.status(401).json({ 
                message: "Not authorized, token failed",
                error: err.message 
            });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
exports.studentOnly = async (req, res, next) => {
    let token;
    
    // Check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.AUTH_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            
            // Check if user is student
            if (user.role !== "student") {
                return res.status(403).json({ 
                    message: "Access denied. Student privileges required" 
                });
            }
            
            
            // Attach user to request and proceed
            req.user = user;
            next();
            
        } catch (err) {
            return res.status(401).json({ 
                message: "Not authorized, token failed",
                error: err.message 
            });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};