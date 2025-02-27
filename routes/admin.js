const express=require("express")
const adminRoute=express.Router()
const controller=require("../controller/admin")

const path = require("path")
const {authentication,adminOnly}=require("../middleware/authentication")
const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

adminRoute.get("/adminHome",authentication,adminOnly,controller.adminHome)
adminRoute.get("/viewblogs/:id",authentication,adminOnly,controller.viewBlog)
adminRoute.get("/viewadmin/:id",authentication,adminOnly,controller.viewPost)
adminRoute.get("/editadmin/:id",authentication,adminOnly,controller.editAdmin)
adminRoute.get("/deleteadmin/:id",authentication,adminOnly,controller.deleteAdmin)
adminRoute.get("/blockuser/:id",authentication,adminOnly,controller.blockUser)


adminRoute.post("/editadmin/:id",upload.single("image"),authentication,adminOnly,controller.editAdminUpload),

adminRoute.get("/check-auth", (req, res) => {
    const token = req.cookies?.token;
    res.json({ authenticated: !!token });
});





module.exports=adminRoute