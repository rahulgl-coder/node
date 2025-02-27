const mongoose=require("mongoose")
const User = require('../model/userSchema');
const Post = require("../model/postSchema")
const bcrypt = require('bcryptjs');
const jwt=require("jsonwebtoken");





const getSignup = (req, res) => {
    try {
       
        res.render("signup/signup");
    } catch (error) {
        console.log(error);
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
};



const getLogin = (req, res) => {
    try {
        res.render("signup/login", { message: req.query.message || "" });
  
       
    } catch (error) {
        console.log(error);
        return res.status(500).render("error", { errorMessage: "server error" });
    }
};



const signupUser = async (req, res) => {
    try {
       
const{userName,email,password}=req.body

     
        if (!userName || !email || !password) {
            
            return res.status(500).render("error", { errorMessage: "All field required" });
            
        }

        const existingUser = await User.findOne({ email });
    
      
        
        if (existingUser&&existingUser.status=="false") {
            return res.status(500).render("error", { errorMessage: "you have been blocked " });
        }else if(existingUser){
            return res.status(500).render("error", { errorMessage: "user exists" });
        }

        

      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        await createToken(newUser,res)
        res.redirect("/home")
       



    } catch (error) {
        console.log("Signup Error:", error);
        return res.status(500).render("error", { errorMessage: "server error" });
    }
};



const loginUser= async (req,res)=>{
    try {
        const {email,password}=req.body;
       
       
        if(!email||!password){
            return res.status(500).render("error", { errorMessage: "enter valid email and password" });
        }

        const existingUser = await User.findOne({ email });
       if (!existingUser) {
        return res.status(500).render("error", { errorMessage: "user not found" });
          
        }else if(existingUser&&existingUser.status=="false"){
            return res.status(500).render("error", { errorMessage: "you are blocked" });
        }
        
        const isMatch = await bcrypt.compare(password, existingUser.password);
    
       if(!isMatch){
        return res.status(500).render("error", { errorMessage: "wrong passsword" });
        }
       
       if(existingUser&&isMatch){
        if(existingUser.role==="Admin"){
            await createToken(existingUser,res)
            res.redirect("/adminHome")

        }else{
       
           
       const token=    await createToken(existingUser,res)
     
       
            res.redirect("/home")
        }
      
        }
        
    } catch (error) {
        console.log("Login Error:", error);
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
   
}

const getHome= async (req,res)=>{
   try {

    const userId=   await extractDataFromToken(req,res);
    const posts = await Post.find({ 
        author: { $ne: userId }, 
        status: "true"  
    })
    .populate("author", "userName")
    .sort({ createdAt: -1 });
const user=await User.findById(userId)
res.render("home", {title:"Home",user:user,posts:posts});
    
   } catch (error) {
    return res.status(500).render("error", { errorMessage: "Server Error" });
    
   }} 




   const createToken = async (userData, res) => {
    try {
       
        const token = jwt.sign(
            { userId: userData.id, role: userData.role, name: userData.userName },
            process.env.SECRET_KEY, 
            { expiresIn: "1h" } 
        );

   
        res.cookie("token", token, { 
            httpOnly: true,  
            secure: false,   
            maxAge: 3600000  
        });

   
        return token;
    } catch (error) {
        console.error("Token Generation Error:", error);
        return null;
    }
};



const extractDataFromToken = (req, res,next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {

            return res.status(401).json({ error: "Access denied. No token provided." });
            
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

       
        const { userId, role, name } = decoded;
         return userId

    } catch (error) {
        console.error("Token verification error:", error);
        res.status(400).json({ error: "Invalid token." });
    }
};


const createBlog=async(req,res)=>{
    try {
        const userId=   await extractDataFromToken(req,res);
        const existingUser = await User.findOne({ _id: userId});
      res.render("createBlog", { title: "createBlog",user:existingUser,blog:null});
    } catch (error) {
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
   
 
 }


const addPost = async (req, res) => {
    try {
      const {title,content } = req.body;

      if (!title || !content) {
        return res.status(400).render("error", { errorMessage: "title and content required" });
      }
      const id=await extractDataFromToken(req,res)
      const post= await Post.create({
        title,content,
        author:id,
        image:req.file.filename
      })
      res.redirect('/home');
      
        } catch (error) {
      
            return res.status(500).render("error", { errorMessage: "Server Error" });
  };

}
  const logout=async(req,res)=>{
    try {
        res.clearCookie("token");
    res.redirect("/login")

    } catch (error) {
        return res.status(500).render("error", { errorMessage: "Server Error" });
        
    }
   

}

const userBlog=async (req,res)=>{
    try{
    const userId=   await extractDataFromToken(req,res);
   const existingUser = await User.findOne({ _id: userId});
   const post =await Post.find({author:userId,status:"true"});
   res.render("userBlog", { title: post.title,user:existingUser,posts:post});
    }catch(error){
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
     
}

const deletePost=async(req,res)=>{
    try {
        const id=req.params.id
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
       
        const newStatus = post.status === "true" ? "false" : "true";
        
        const updatedPost = await Post.findByIdAndUpdate(id, { status: newStatus }, { new: true });
      
res.redirect("/userBlog")
    } catch (error) {
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }

 
}



const viewPost = async (req, res) => {
    try {
        const userId = await extractDataFromToken(req, res);
        const user=await User.findById(userId)
        const postId = req.params.id;
      
        

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send("Invalid Post ID");
        }

        const post = await Post.findById(postId).populate("author", "userName");

        if (!post) {
            return res.status(400).render("error", { errorMessage: "Post not found" });
        }

        res.render("viewPost", { title: "Blog", user: user, post: post });
    } catch (error) {
       
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
};



const editBlog = async(req,res)=>{
    try {
        const id= req.params.id
        const user = await extractDataFromToken(req, res);
      const blog=await Post.findById(id)
      if(!blog){
        return res.status(400).render("error", { errorMessage: "Post not found" });
      }else{
         res.render("editBlog",{user:user,blog:blog,title:"edit"})
      }
    } catch (error) {
        return res.status(500).render("error", { errorMessage: "Server Error" });
    }
   }

const uploadEditBlog=async(req,res)=>{
  
    try {
        
        const postId=req.params.id
        if(!postId){
            return res.status(400).render("error", { errorMessage: "Post not found" });
        }
      const {title,content}=req.body
  
    if (!title || !content) {
        return res.status(400).render("error", { errorMessage: "title and content required" });
        }  

        const updatedData={title,content}
       if(req.file){
        updatedData.image=req.file.filename

      }
      const post=await Post.findById(postId)
      if(!post){
        return res.status(400).render("error", { errorMessage: "Post not found" });
      }
      await Post.findByIdAndUpdate(postId, updatedData, { new: true });
  
        res.redirect('/home');
   

        
          } catch (error) {
        console.error(error);
        return res.status(500).render("error", { errorMessage: "server error" });
      }
    };



  



module.exports = { getSignup ,
    getLogin,
    signupUser,
    loginUser,
    getHome,
    createBlog,
    addPost,
    logout,
    userBlog,
    deletePost,
    viewPost,
    editBlog,
    uploadEditBlog,extractDataFromToken};
