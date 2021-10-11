import mongoose from 'mongoose';
 import { APP_URL } from '../config';

 const commentSchema = new mongoose.Schema(
     {
        replyTo:{type:String, required:true},
        username: {type:String, required:true},
        text: {type:String},
        post_image: {type:String, get: (image) =>{
          return `${APP_URL}/${image}`;
        }},
        likes: {type:Array},
        comments: {type:Array},
    },
    { timestamps: true, toJSON: { getters:true }}
  );

export default mongoose.model('Comment', commentSchema);