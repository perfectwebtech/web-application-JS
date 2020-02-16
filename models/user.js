const mongoose=require("mongoose");
const Schema=mongoose.Schema

const UserSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    nickname:{
        type:String,
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    password:{
        type:String
    }
})

module.exports=mongoose.model("User",UserSchema)