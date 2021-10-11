import mongoose from 'mongoose';
 import { APP_URL } from '../config';

 const userSchema = new mongoose.Schema(
     {
        name: {type:String, required:true},
        email: {type:String, required:true, unique:true},
        username: {type:String, required:true, unique:true},
        profile_image: {type:String, required:true, get: (image) =>{
          return `${APP_URL}/${image}`;
        }},
        cover_image: {type:String, get: (image) =>{
            return `${APP_URL}/${image}`;
        }}, 
        location: {type:String},
        dob: {type:String},
        followers: {type:Array},
        following: {type:Array},
        password: {type:String, required:true},
    },
    { timestamps: true, toJSON: { getters:true }}
  );

export default mongoose.model('User', userSchema);