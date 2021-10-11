import User from "../../model/User";
import Joi from "joi";
import JwtService from '../../services/JwtService'; 
import bcrypt from 'bcryptjs'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

//image uploading with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
}); 
  
const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
}).fields([{ name: 'profile_image', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }])



const registerController = {

    async registerUser(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return res.status(500).json(err)
            }
            if (!req.files['profile_image']) {
                return res.status(409).json({message:"select profile image"});
            }
            let profileImagePath = req.files['profile_image'][0].path;
            let coverImagePath = req.files['cover_image'] ? req.files['cover_image'][0].path : "images/no-profile-cover.jpg";
            
        //validation
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            username: Joi.string().min(3).max(30).required(),
            location: Joi.string().min(3).max(100),
            dob: Joi.string().min(3).max(30),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        });
        //will delete uploaded images if error
        function deleteFiles(){
            fs.unlink(`${path.resolve("./")}/${profileImagePath}`, (err) => {
                if (err) {
                    return res.status(409).json({message:"error while delete file"})
                }
            });
            if (req.files['cover_image']) {
                fs.unlink(`${path.resolve("./")}/${coverImagePath}`, (err) => {
                    if (err) {
                        return res.status(409).json({err})
                    }
                });
            }
        }
        const {error} = registerSchema.validate(req.body);
        
        if (error) {
            // Delete the uploaded file
            deleteFiles();
            return res.status(409).json({message:error.message})
        }

        //check if already exist
        try{
            const exist = await User.exists({$or: [ { email:req.body.email }, { username: req.body.username } ]});
            if (exist) {
                // Delete the uploaded file
                deleteFiles();
                return res.status(409).json({message:"user already exist"})
            }
        } catch(err){
            return res.status(404).json({message:"404 not found"})
        }

        const  {name, email, username, location, dob, password } = req.body;
        //hash Password
        const hashedPassword = await bcrypt.hash(password,10);

        //prepare the model
        const user = new User({
            name,
            email,
            username,
            profile_image:profileImagePath,
            cover_image:coverImagePath,
            location,
            dob,
            password: hashedPassword
        });

        let access_token;
        // let refresh_token;

        try{
            const result = await user.save();
            //token
            access_token = JwtService.sign({_id: result._id, username: result.username});
            // refresh_token = JwtService.sign({_id: result._id, username: result.username},'1y',REFRESH_SECRET);

            //store refreshToken in database
            // await Refreshtoken.create({token:refresh_token});

        }catch(err){
            return res.status(404).json({message:"404 not found"})
        }
        res.json({ access_token });
    });
    }
}
export default registerController;