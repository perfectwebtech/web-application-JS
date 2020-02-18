const express=require("express");
const app=express();
const User=require("../models/user")
const bcrypt=require("bcrypt")
const {verifyToken}=require("../Middlewares/auth")
const jwt=require("jsonwebtoken")
const fs=require("fs")

/* Get all users */
app.get("/",(req,res)=>{
    User.find((err,usersFound)=>{
        if(err){
            return res.status(500).json({ok:false,message:"Users couldnt be found"})
        }
        res.status(200).json({ok:true,usersFound})
    })
})
/*Found one user per id*/
app.get("/user/:id",(req,res)=>{
    let {id}=req.params
    User.findById(id,(err,userFound)=>{
        if(err){
            return res.status(500).json({ok:false,message:"An error with server had occured"})
        }
        if(!userFound){
            return res.status(404).json({ok:false,message:"There is no user"})
        }
        return res.status(200).json({ok:true,message:userFound})
    })  
})
/*Register a user*/
/*TODO forbid change role from req.body*/
app.post("/register",(req,res)=>{
    const saltRounds=10;
    const {body}=req;
    User.find({email:body.email},(err,userFound)=>{
       if(userFound.length==0){
          bcrypt.hash(body.password,saltRounds,(err,encrypted)=>{
            const user=new User();
            user.email=body.email;
            user.image=body.image;
            user.nickname=body.nickname;
            user.name=body.name;
            user.password=encrypted;
            user.role=body.role;
            user.save((err,userStored)=>{
                
                if(err){
                    return res.status(500).json({ok:true,message:"An error with the server had occured"})
                }
                return res.status(200).json({ok:true,userStored})
            })
          })  
       }else{
           return res.status(400).json({ok:false,message:"An error had occured"})
       }
    })
})
/*LogIn users*/
app.get("/login",(req,res)=>{
    const {body}=req;
    User.findOne({email:body.email},(err,userFound)=>{
        if(err){
            return res.status(500).json({ok:false,message:"An error with the server had occured"})
        }
        if(!userFound){
            return res.status(400).json({ok:false,message:"Password or email are incorrect"})
        }
        const user={
            name:body.name,
            nickname:body.nickname,
            email:body.email
        }
        bcrypt.compare(body.password,userFound.password,(err,matched)=>{
            if(matched){
               const privateKey=fs.readFileSync("Middlewares/private.key","utf8")
               const token=jwt.sign(user,privateKey,{expiresIn:"48h"})
               res.status(200).json({ok:true,message:token}) 
            }
            if(err){
                res.status(500).json({ok:true,message:"An error with the server had occured"})
            }
            res.status(400).json({ok:false,message:"Password was wrong"})

        })
    })
})

module.exports=app