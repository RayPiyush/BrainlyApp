import mongoose from "mongoose";
const Schema=mongoose.Schema;
//const ObjectId=mongoose.Types.ObjectId;
const Types=mongoose.Types;

const userSchema=new Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema=new Schema({
    link:{type:String,required:true},
    type:{type:String,enum:contentTypes,required:true},
    title:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    tags:[{type:Types.ObjectId,ref:'Tag'}],
    userId:{type:Types.ObjectId,ref:'User',required:true}

})

const tagSchema=new Schema({
    title:{type:String,required:true,unique:true}
})

const linkSchema=new Schema({
    hash:{type:String,required:true},
    userId:{type:Types.ObjectId,ref:'User',required:true}
})

const userModel=mongoose.model("user",userSchema);
const contentModel=mongoose.model("content",contentSchema);
const tagModel=mongoose.model("tag",tagSchema);
const linkModel=mongoose.model("link",linkSchema);

module.exports={
    userModel,
    contentModel,
    tagModel,
    linkModel
}

