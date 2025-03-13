import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// we use cors because it can communicate cros platform like for frintedn is anywhere and backend is here so it communicates


 //configuring cors
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

// when taking files from the user

app.use(express.json({limit : "16kb"}))
//taking data from url
app.use(express.urlencoded({extended : true, limit :"16kb"}))
// for public access
app.use(express.static("public")) // For Public Access: Any file stored in the "public" directory can be accessed directly by the client via a URL. For example, if there’s an image called logo.png in the public folder, it can be accessed at http://yourdomain.com/logo.png.

//for storing cookie in browser
app.use(cookieParser())


export {app};