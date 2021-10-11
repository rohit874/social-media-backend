import JwtService from '../services/JwtService';
const auth = async (req,res,next) =>{
    let authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({message:"unAuthorized"});
    }
    const token  = authHeader.split(' ')[1];

    try{
        const { _id, username } = await JwtService.verify(token);
        const user = {
            _id,
            username
        }; 
        req.user = user;
        next();
    }catch(err){
        return res.status(401).json({message:"unAuthorized"});
    }
}

export default auth;