const express=require("express")
const route=express.Router()
const controller=require("../controller/user")
const multer = require("multer")
const path = require("path")
const {authentication,userOnly}=require("../middleware/authentication")

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


route.get("/signup",controller.getSignup)
route.get("/login",controller.getLogin)
route.get("/home",authentication,userOnly,controller.getHome)
route.get("/createBlog",authentication,userOnly,controller.createBlog)
route.get("/logout",controller.logout)
route.get("/userBlog",authentication,userOnly,controller.userBlog)
route.get("/delete/:id",authentication,userOnly,controller.deletePost)
route.get("/viewPost/:id",authentication,userOnly,controller.viewPost)
route.get("/editBlog/:id",authentication,userOnly,controller.editBlog)



route.post("/signup",controller.signupUser)
route.post("/login",controller.loginUser)
route.post("/createBlog",upload.single("image"),authentication,userOnly,controller.addPost)
route.post("/editBlog/:id",upload.single("image"),authentication,userOnly,controller.uploadEditBlog)


route.get("/check-auth", (req, res) => {
    const token = req.cookies?.token;
    res.json({ authenticated: !!token });
});










module.exports= route