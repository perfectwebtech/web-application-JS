const mongoose=require("mongoose");
const Schema=mongoose.Schema

const followsSchema=new Schema({
    followed:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    following:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    createdAt:{
        type:String
    }
})

module.exports=mongoose.model("Follow",followsSchema)