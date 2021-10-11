import Post from "../model/post";
import User from "../model/User";

 const profileController = {
    async getProfile(req,res){
         let user;
         let userPost;
        try{
            user = await User.findOne({username:req.params.username}).select('-password -__v -updatedAt');
            if (!user) {
                return res.status(404).json({message:"user not found"})
            }
            userPost = await Post.find({username:req.params.username}).sort( { _id: -1 } );
        } catch(err){
            return res.status(404).json({message:"user not found"});
        }
         res.json({user, userPost}) 
     },
     async Follow(req,res){
        let follow;
        try{
            follow = await User.find({_id: req.body.userid, followers: { $in: [req.body.username] }}).count();
            if (follow) {
                follow = await User.updateOne({_id:req.body.userid},{$pull:{'followers':req.body.username}});
            }
            else{
                follow = await User.updateOne( { _id: req.body.userid }, { $push: { followers: req.body.username } });
            }
        } catch(err){
            return res.status(404).json({message:"user not found"});
        }
        res.json({res:follow})

     }
 }

 export default profileController; 