const jwt=require("jsonwebtoken")

/*Verify Token*/
function verifyToken(req,res,next){
    const headers=req.get("Authorization");
    console.log(headers)
}

module.exports={
    verifyToken
}