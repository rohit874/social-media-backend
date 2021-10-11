import User from "../model/User";

const userController = {
    async getUser(req,res){
        try{
            const user = await User.findOne({username:req.user.username}).select('-password -__v -createdAt -updatedAt');
            if (!user) {
                return res.status(404).json({message:"user not found"})
            }
            res.json({user});
        } catch(err){
            return res.status(404).json({message:"user not found"});
        }
    },
    async searchPeople(req,res){
        try{
            const peoples = await User.find({'name': {'$regex' : `^${req.body.serachInput}`, '$options' : 'i'}, '_id': {$ne:req.user._id }}).select('-password -__v -createdAt -updatedAt');
            
            if (!peoples) {
                return res.status(404).json({message:"No result found"})
            }
            res.json({peoples});
        } catch(err){
            return res.status(404).json({message:"No result found"});
        }
    }
}
export default userController;