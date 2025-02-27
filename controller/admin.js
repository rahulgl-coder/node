const mongoose=require("mongoose")
const User = require('../model/userSchema');
const Post = require("../model/postSchema")
const {extractDataFromToken}=require("../controller/user")



const adminHome=async(req,res)=>{
    try {
        const adminId=extractDataFromToken(req,res)
    const admin=await User.findById(adminId)
    const user = await User.find({ role: { $ne: "Admin"} })
    res.render("adminHome",{users:user,user:admin,title:"Admin",admin:admin})
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "server error" });
    }
    
}

const viewBlog=async(req,res)=>{

    try {
        const adminId=extractDataFromToken(req,res)
        const id=req.params.id
     
        const post = await Post.find({ author:id }).populate("author","userName");
        if(!post){
            return res.status(400).render("errorAdmin", { errorMessage: "post not found" });
        }
        const user=await User.findById(adminId)
        if(!user){
            return res.status(400).render("errorAdmin", { errorMessage: "admin not found" });
        }
        res.render("viewBlogadmin",{posts:post,title:"view",user:user})
        
     
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
    }
}

const viewPost=async(req,res)=>{
    try {
        const adminId=extractDataFromToken(req,res)
        const user=await User.findById(adminId)
        if(!user){
            return res.status(400).render("errorAdmin", { errorMessage: "admin not found" });
        }
        const id=req.params.id
        const post = await Post.findById(id).populate("author", "userName");
        if(!post){
            return res.status(400).render("errorAdmin", { errorMessage: "Post not found" });
        }
        res.render("viewAdmin",{post:post,title:"view",user:user})
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
    }
   
 
}

const editAdmin=async(req,res)=>{
    try {
        const adminId=extractDataFromToken(req,res)
        const user=await User.findById(adminId)
        const id=req.params.id
        const post=await Post.findById(id)
        if(!post){
            return res.status(400).render("errorAdmin", { errorMessage: "Post not found" });
        }
        res.render("editAdmin",{title:"edit",user:user,blog:post})
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
    }
   

}

const editAdminUpload=async(req,res)=>{
    try {
        const postId=req.params.id
        const {title,content}=req.body
    const user=await extractDataFromToken(req,res)
    const post=await Post.findById(postId)
        if (!title || !content) {
            return res.status(500).render("errorAdmin", { errorMessage: "All fields required" });
          }  
    
          const updatedData={title,content}
         if(req.file){
          updatedData.image=req.file.filename
    
        }
        await Post.findByIdAndUpdate(postId, updatedData, { new: true });
    
        res.render("viewAdmin",{post:post,title:"view",user:user})
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
        
    }
   
}

const deleteAdmin=async(req,res)=>{
    try {
        const id=req.params.id
       const post=await Post.findById(id)
       if(!post){
        return res.status(400).render("errorAdmin", { errorMessage: "post not found" });
       }else{
        const newStatus = post.status === "true" ? "false" : "true";
        
         await Post.findByIdAndUpdate(id, { status: newStatus }, { new: true });
       
        res.redirect('/adminHome')
       }
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
    }
   
}

const blockUser=async(req,res)=>{
    try {
        const id=req.params.id
        const user=await User.findById(id)
      if(!user){
            return res.status(400).render("errorAdmin", { errorMessage: "user not found" });
        }
        const newStatus = user.status === "true" ? "false" : "true";

        await User.findByIdAndUpdate(id, { status: newStatus });
         
        res.redirect("/adminHome")
        
      
    } catch (error) {
        return res.status(500).render("errorAdmin", { errorMessage: "Server Error" });
    }

}














module.exports={adminHome,viewBlog,viewPost,editAdmin,editAdminUpload,deleteAdmin,blockUser}