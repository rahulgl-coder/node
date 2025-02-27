const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const authentication = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            if (req.xhr) {
                return res.status(401).render("error", { errorMessage: "Access Denied: No token provided" });
            }
            return res.redirect("/login");
        }


        const decoded = jwt.verify(token, process.env.SECRET_KEY);


        const user = await User.findById(decoded.userId);
    
        

        if (!user) {
            return res.status(401).render("error", { errorMessage: "Access Denied: User not found" });
        }

        if (!user.role) {
            return res.status(403).render("error", { errorMessage: "Access Denied: No role assigned" });
        }

        req.user = user; 
        next();

    } catch (error) {
        console.error("Token verification error:", error);

        if (req.xhr) {
            return res.status(400).render("error", { errorMessage: "Invalid or Expired Token" });
        }
        res.redirect("/login");
    }
};



// const jwt = require("jsonwebtoken");
// const User=require("../model/userSchema")

// const authentication = (req, res, next) => {
//     try {
//         const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

//         if (!token) {
//             if (req.xhr) {
//                 return res.status(401).render("error", { errorMessage: "No token" });
//             }
//             return res.redirect("/login");
//         }

//         const decoded = jwt.verify(token, process.env.SECRET_KEY);


//         req.user = decoded; 
//         if (!req.user.role) {
//             return res.status(401).render("error", { errorMessage: "Acess Denied " });
//         }

//         next(); 
        
//     } catch (error) {
//         console.error("Token verification error:", error);

//         if (req.xhr) {
//             return res.status(400).render("error", { errorMessage: "Invalid Token" });
//         }
//         res.redirect("/login");
//     }
// };



const adminOnly = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(401).render("error", { errorMessage: "Acess Denied admin page  " });
    }
    next();
};


const userOnly = (req, res, next) => {
    if (req.user.role !== "user") {
        return res.status(401).render("errorAdmin", { errorMessage: "Acess Denied user page" });
    }
    next();
};

module.exports = {authentication,adminOnly,userOnly};



