const jwt=require("jsonwebtoken")
const fs=require("fs")

/*Verify Token*/
function verifyToken(req,res,next){
    const headers=req.get("Authorization");
    const decoded=fs.readFileSync("Middlewares/private.key","utf8");
    jwt.verify(headers,decoded,(err,decoded)=>{
        if(err){
            next(new Error("Toke invalid"))
            return res.status(200).json({ok:false,message:"Something went wrong with the server"})
        }
        if(!decoded){
            return res.status(200).json({ok:false,message:"Ivalid token"})
        }
        const payload=decoded
        req.user=payload
    })
    next();
}
function roleAuth(req,res,next){
    const user=req.user;
    if(user.role==="ADMIN"){
        next()
    }else{
        next("You dont have permission to do this action")
    }
}

module.exports={
    verifyToken,
    roleAuth
}