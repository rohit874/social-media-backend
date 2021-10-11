import Comment from "../model/comment";
import Post from "../model/post";
import multer from 'multer';
import path from 'path';

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
}).single('post_image');


const commentController = {
   async comment(req,res){
        handleMultipartData(req, res, async (err) => {
            // console.log("body",req.body);
            if (err) {
                return res.status(500).json(err) 
            }
            let postImage = req.file ? req.file.path : "";
            //prepare the model
        const commentData = new Comment({
            replyTo: req.body.postId,
            username:req.body.username,
            text:req.body.text,
            post_image:postImage
        });

        let result;
        let comment;
        try{
            result = await commentData.save();
            comment = await Post.updateOne( { _id: req.body.postId }, { $push: { comments: result._id.toString() } });
        }catch(err){
            return res.status(404).json({message:"404 not found"})
        }
        res.json({res:result})
    });
},
    async likeComment(req, res){ 
        let like;
        try{
            like = await Comment.find({_id: req.body.commentid, likes: { $in: [req.body.username] }}).count();
            if (like) {
                like = await Comment.updateOne({_id:req.body.commentid},{$pull:{'likes':req.body.username}});
            }
            else{
                like = await Comment.updateOne( { _id: req.body.commentid }, { $push: { likes: req.body.username } });
            }
        } catch(err){
            return res.status(404).json({message:"user not found"});
        }
        res.json({res:like})
    },




}

export default commentController;