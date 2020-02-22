const express=require("express");
const app=express();
const User=require("../models/user")
const bcrypt=require("bcrypt")
const {verifyToken,roleAuth}=require("../Middlewares/auth")
const jwt=require("jsonwebtoken")
const fs=require("fs")
const _=require("underscore")
const {OAuth2Client} = require('google-auth-library');
var generate=require("generate-password")

/* Get all users and paginate from query params*/
app.get("/users",verifyToken,(req,res)=>{
    const {query}=req
    const limit=parseInt(query.limit);
    User.find({state:"ACTIVE"}).limit(limit).exec((err,usersFound)=>{
        if(err){
            return res.status(500).json({ok:false,message:"Users couldnt be found"})
        }
        return res.status(200).json({ok:true,usersFound})
    })
})
/*Found one user per id*/
app.get("/user/:id",verifyToken,(req,res)=>{
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
app.post("/register",(req,res)=>{
    const saltRounds=10;
    const {body}=req;
    User.find({email:body.email,nickname:body.nickname},(err,userFound)=>{
        if(userFound.length==0){
            if(body.password && body.email && body.nickname && body.name){
                bcrypt.hash(body.password,saltRounds,(err,encrypted)=>{
                const user=new User();
                user.password=encrypted;
                user.email=body.email;
                user.image=body.image || null;
                user.nickname=body.nickname;
                user.name=body.name;
                user.role="USER";
                user.google=false,
                user.state="ACTIVE"
                user.save((err,userStored)=>{
                    if(err){
                        return res.status(500).json({ok:true,message:"An error with the server had occured"})
                    }
                    return res.status(200).json({ok:true,userStored})
                })
              })  
            }else{
                return res.status(400).json({ok:false,message:"Data was not specified"})
            }
       }else{
           return res.status(400).json({ok:false,message:"An error had occured"})
       }
    })
})
/*LogIn users*/
app.post("/login",(req,res)=>{
    const {body}=req;
    User.findOne({email:body.email,google:false},(err,userFound)=>{
        if(err){
            return res.status(500).json({ok:false,message:"An error with the server had occured"})
        }
        if(!userFound){
            return res.status(400).json({ok:false,message:"Password or email are incorrect"})
        }
        const user={
            name:userFound.name,
            nickname:userFound.nickname,
            email:userFound.email,
            _id:userFound._id,
            image:userFound.image,
            role:userFound.role,
            state:userFound.state,
            google:userFound.google
        }
        bcrypt.compare(body.password,userFound.password,(err,matched)=>{
            if(matched){
               const privateKey=fs.readFileSync("Middlewares/private.key","utf8")
               const token=jwt.sign(user,privateKey,{expiresIn:"48h"})
               return res.status(200).json({ok:true,message:token}) 
            }
            if(err){
                    return res.status(500).json({ok:true,message:"An error with the server had occured"})
            }
            return res.status(400).json({ok:false,message:"Password was wrong"})
        })
    })
})

/*Update user data*/
app.put("/:nick/:id",verifyToken,(req,res)=>{
   const {params:{nick}}=req;
   const {params:{id}}=req;
   const actualUser=req.user;
   const {body:data}=req;
   const userToUpdate=_.pick(data,["name","nickname","email","image"])
   if(actualUser.nickname===nick){
       User.findByIdAndUpdate(id,userToUpdate,{new:true},(err,userUpdated)=>{
            if(err) {
                return res.status(500).json({ok:false,message:"Something went wrong"})
            }
            return res.status(200).json({ok:true,message:userUpdated})
       })
   }else{
       return res.status(400).json({ok:false,message:"You dont have permission to change this data"})
   }
})
app.delete("/:id",verifyToken,(req,res)=>{
    const dataToUpdate=_.pick(req.body,["state","delete"])
    const {params:{id}}=req
    if(id!=undefined){
        if(dataToUpdate.state==="SUSPENDED"){
            User.findByIdAndUpdate(id,dataToUpdate,{new:true},(err,userSuspended)=>{
                if(err){
                    return res.status(500).json({ok:false,message:"Something went wrong"})
                }
                return res.status(200).json({ok:true,message:userSuspended})
            })
        }if(dataToUpdate.delete==="true"){
            User.findByIdAndDelete(id,(err)=>{
                if(err){
                    return res.status(500).json({ok:false,message:"Something went wrong"})
                }
                return res.status(200).json({ok:true,message:"User deleted correctly"})
            })
        }
        return res.status(400).json({ok:true,message:"Data not specified or wrong"})
    }else{
        return res.status(400).json({ok:true,message:"Data not specified or wrong"})
    }
})
async function verify(token) {
    const credentials=fs.readFileSync("Middlewares/credentials.json","utf8")
    const parsedClient=JSON.parse(credentials);
    const client_id=parsedClient.web.client_id;
    const client = new OAuth2Client(client_id);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: client_id
    });
    const payload = ticket.getPayload();
    return payload
}
/*Google Sign In*/
app.post("/google-sign",(req,res)=>{
    const {body}=req;
    verify(body.idtoken).then((data)=>{
       User.findOne({email:data.email},(err,userFound)=>{
           console.log(userFound)
            if(userFound==null){
                const password_generated=generate.generate({
                    length:8,
                    numbers:true
                })
                const passwordEncrypted=bcrypt.hashSync(password_generated,10)
                const user=new User()
                    user.name=data.given_name,
                    user.nickname=data.name,
                    user.email=data.email,
                    user.image=data.picture,
                    user.role="USER",
                    user.state="ACTIVE",
                    user.google=true,
                    user.password=passwordEncrypted
    
                user.save((err,userStored)=>{
                    return res.json({ok:true,userStored})
                })
            }else{
                if(userFound.google){
                    const privateKey=fs.readFileSync("Middlewares/private.key","utf8")
                    const user={
                        name:userFound.name,
                        nickname:userFound.nickname,
                        email:userFound.email,
                        _id:userFound._id,
                        image:userFound.image,
                        role:userFound.role,
                        state:userFound.state,
                        google:userFound.google
                    }
                    jwt.sign(user,privateKey,(err,token)=>{
                        if(err){
                            return res.status(500).json({ok:false,message:"Something went wrong"})
                        }
                        return res.status(200).json({ok:true,token})
                    })
                }else{
                    return res.status(400).json({ok:false,message:"There is a user registered with that email"})
                }
            }    
       })
    }).catch((err)=>{
        console.log(err)
    }) 
})


module.exports=app