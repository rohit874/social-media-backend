import Post from "../model/post";
import User from "../model/User";
import Comment from "../model/comment";
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


const postController = {
   async savePost(req,res){
        handleMultipartData(req, res, async (err) => {
            // console.log("body",req.body);
            if (err) {
                return res.status(500).json(err) 
            }
            let postImage = req.file ? req.file.path : "";
            //prepare the model
        const post = new Post({
            username:req.body.username,
            text:req.body.text,
            post_image:postImage
        });

        let result;
        try{
            result = await post.save();
        }catch(err){
            return res.status(404).json({message:"404 not found"})
        }
        res.json({res:result})
    });
},


//getting feed post
async getAllPost(req, res){
        let getPost;
    try{
        getPost = await Post.find().sort( { _id: -1 } );
    } catch(err){
        return res.status(404).json({message:"post not found"});
    }
    //extract user Ids
    const userIds = getPost.map((data)=>{
        return data.username;
    });
     //getting user info 
     let usersInfo=[];
     try{
        usersInfo = await User.find({username:{$in:userIds}}).select('-password -__v -createdAt -updatedAt');
     } catch(err){
         return res.status(404).json({message:"users not found"});
     }
     function finduser(id){
       return usersInfo.find(e => e.username == id);
    }
    //combining userinfo with post
    let newPostData=[];
    getPost.map((data)=>{
        let user = finduser(data.username)
        let newObj={
            _id:data._id,
           username: data.username,
           text: data.text,
           post_image: data.post_image,
           likes: data.likes,
           comments: data.comments,
           createdAt: data.createdAt,
           username: data.username,
           name: user.name,
           user_image: user.profile_image,
        };
        newPostData=[...newPostData,newObj];
    });

    res.json({res:newPostData})
 },
 
//geting a user post
async getUserPost(req, res){
        let getPost;
        try{
            getPost = await Post.find({username:req.params.username}).sort( { _id: -1 } );
        } catch(err){
            return res.status(404).json({message:"post not found"});
        }
        res.json({res:getPost})
    },  

//handling likes
async likePost(req, res){ 
        let like;
    try{
        like = await Post.find({_id: req.body.postid, likes: { $in: [req.body.username] }}).count();
        if (like) {
            like = await Post.updateOne({_id:req.body.postid},{$pull:{'likes':req.body.username}});
        }
        else{
            like = await Post.updateOne( { _id: req.body.postid }, { $push: { likes: req.body.username } });
        }
    } catch(err){
        return res.status(404).json({message:"user not found"});
    }
    res.json({res:like})
    },
//getting post details
async getPostDetails(req, res){
        let getPost;
        let user;
       try{
           getPost = await Post.findOne({_id: req.params.postid});
           user = await User.findOne({username:getPost.username}).select('-password -__v -createdAt -updatedAt');
       } catch(err){
           return res.status(404).json({message:"post not found"});
       }
       let commentsData;
       let commentsUserNames;
       let commentsUsersData;
       let newCommentData=[];
       
       if (getPost.comments.length) {
        commentsData = await Comment.find({_id:{$in:getPost.comments}}).sort( { _id: -1 } ); //fetching all comments data
        //extracting username from commentrs
        commentsUserNames = commentsData.map((data)=>{ 
            return data.username;
        })
        //getting user info from comments
        commentsUsersData = await User.find({username:{$in:commentsUserNames}});

        function finduser(id){
            return commentsUsersData.find(e => e.username == id);
         }
        //combining userinfo with comments
        commentsData.map((data)=>{
        let user = finduser(data.username)
        let newObj={
            _id:data._id,
           replyTo: data.replyTo,
           text: data.text,
           post_image: data.post_image,
           likes: data.likes,
           comments: data.comments,
           createdAt: data.createdAt,
           username: data.username,
           name: user.name,
           user_image: user.profile_image,
        };
        newCommentData=[...newCommentData,newObj];
    });
}
    //combine all post details and comments  
      let data ={
           _id:getPost._id,
           username: getPost.username,
           text: getPost.text,
           post_image: getPost.post_image,
           likes: getPost.likes,
           comments: getPost.comments,
           createdAt: getPost.createdAt,
           username: getPost.username,
           name: user.name,
           user_image: user.profile_image,
           comments:newCommentData
       }
       res.json({data})
    },
} 
export default postController;