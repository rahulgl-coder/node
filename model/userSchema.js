const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true  
    },
    role:{
        type:String,
        default:"user"
    },
    status:{
        type:String,
        default:"true"
    }
})


module.exports=mongoose.model("User",userSchema)
