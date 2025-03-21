 import { asyncHandler } from "../utils/asynchandeler.js";
 import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js";

 const registerUser = asyncHandler(async (req, res)=>
    {
        // get user details from front end
        // we take data as we modeled it in user.model.js
        // validation - not empty
        // check if user already exist : username,email
        // check for images, check for avatar
        // upload them to cloudinary, avatar
        // create user object - create entry in db
        // remove password and refresh token feild from response
        // check for user creation
        //return res

        // if data is coming via form we cna get it in req.body
        const{username, email, fullname, password} =  req.body
        console.log("username" , username);
        console.log("email", email);

        //2ways to check
        // 1.
        // if(fullname === ""){
        //     throw new ApiError(400 , "fullname is required")
        // }

        //2.
        if (
            [fullname,email,username,password].some((feild) =>
            feild?.trim()==="")
        ) {
            throw new ApiError(400,"All feilds are required")
        }

        // check for existing user

        const existedUser = User.find({  // User is called from user.model.js
            $or : [{username} ,{email}] // $or is basically or
        })

        if (existedUser) {
            throw new ApiError(409 , "User with email or Username already exists")
        }

        // check for images, check for avatar
        // multer gives the access of req.files

        const avatarLocalPath = req.files?.avatar[0].path; // this gives the path of the avatar stored locally using cloudinary
        const coverImageLocalPath = req.files?.coverImage[0].path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage  = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400, "Avatar is required");
        }

        // creating an entry in the database
        const user = await username.create({
            fullname,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            password,
            username : username.tolowerCase()
        })
        // checking if the entry is made
        const createdUser = User.findById(user._id).select(
            "-password -refreshToken" // these feild wont be inlcuded when finding
        )

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )




    })

export {registerUser}