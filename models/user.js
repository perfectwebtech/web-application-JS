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
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"USER"
    },
    google:{
        type:Boolean,
        default:false
    },
    state:{
        type:String,
        default:"ACTIVE"
    }
})

module.exports=mongoose.model("User",UserSchema)