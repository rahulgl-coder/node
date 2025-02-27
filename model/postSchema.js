const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   image:{type:String,required:true},
   status:{type:String,default:"true"}
   
},{timestamps:true});

const Post = mongoose.model('Post', blogSchema);
module.exports = Post;





