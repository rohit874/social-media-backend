import Joi from "joi";
import User from "../../model/User";
import bcrypt from 'bcryptjs';
import JwtService from '../../services/JwtService';

const loginController = {
    async loginUser(req,res,next){
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        });

    const { error } = loginSchema.validate(req.body);

    if (error) {
        return res.status(401).json({message:error.message});
    }

    try{
        const user = await User.findOne({email:req.body.email});
        
        if (!user) {
            return res.status(401).json({message:'username or password is wrong!'});
        }

        //compare password
        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match){
            return res.status(401).json({message:'username or password is wrong!'});
        }

        // access token
        const access_token = JwtService.sign({_id: user._id, username: user.username});

        res.json({access_token});
        
    } catch(err){
        return res.status(500).json({message:'Internal server error'});
    }

    }
}
export default loginController;

