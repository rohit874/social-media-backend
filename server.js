import express from 'express';
import cors from 'cors';
import router from './routes';
import mongoose from 'mongoose';
import { APP_PORT, DB_URL } from './config';
const app = express();
app.use(cors());
const PORT = APP_PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images')); 
app.use(router);
//Database connection  
mongoose.connect(DB_URL, ({useNewUrlParser:true,useUnifiedTopology: true}));
const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error'));
db.once('open', ()=>{
    console.log("db connected");
})

//Server
var server = app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})