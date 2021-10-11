import express from "express";
import { loginController, registerController, profileController, userController, commentController, postController } from "../controller";
import auth from '../middlewares/auth';
const router = express.Router();

//routes
router.post('/login', loginController.loginUser);
router.post('/register', registerController.registerUser);
router.get('/getuser', auth, userController.getUser);
router.post('/search', auth, userController.searchPeople);
router.get('/profile/:username', profileController.getProfile);
router.post('/follow', profileController.Follow);
router.post('/post', postController.savePost);
router.get('/getpost', postController.getAllPost);
router.get('/getpost/:username', postController.getUserPost);
router.post('/like', postController.likePost);
router.get('/postdetails/:postid', postController.getPostDetails);
router.post('/comment', commentController.comment);
router.post('/comment-like', commentController.likeComment);

export default router;