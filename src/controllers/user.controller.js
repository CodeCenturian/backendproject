 import { asyncHandler } from "../utils/asynchandeler.js";
 import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js";
import {jwt} from {"jsonwebtoken"}

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken = refreshToken; // refreshtoken should be saved in the data base cause we need to check it will accessToken later
        user.save({validateBeforeSave : false}) //it is save d without vaidation save is a feature of mongoose

        return {accessToken , refreshToken}



    } catch (error) {
        throw new ApiError(500,"Something went wrong during generating refresh and access token")
    }
}


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

        const existedUser = await User.find({  // User is called from user.model.js
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

const loginUser = asyncHandler(async (req,res) =>
{
    // take data from ref body
    // username or email
    // find the user
    // password check
    // if password check generate a access and refresh token
    // send cookie

    if(!username || !email){
        throw new  ApiError(400, "Username and Password is required")
    }

    const user  = await User.findOne({
        $or : [ {username}, {email}] // finds username or email
    })

    if(!user){
        throw new ApiError(404, "User does not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404, "Password Incorrect")
    }

    // generate access and refresh tokens
    const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id)

    // send in cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //we select all the user feilds except the password and refreshTokens

     const options = {
        httpOnly : true;
        secure : true  // by doing these two the cookies are only modifiable at the server
     }

     return res  // all the cookies are returned
     .status(200)
     .cookie("accessToken",accessToken)
     .cookie("refreshToken", refreshToken)
     .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser , accessToken , refreshToken
            }, // data
            "User Is Logged In Successfully"
        )
     )

})

const logOutUser = asyncHandler( async (req,res) => {
    User.findByIdAndUpdate(
        req.user._id{
            $set:{
                refreshToken : undefined;
            },
            {
                new : true; //gives any new value to refreshToken
            }
            const options  = {
                httpOnly : true,
                secure : true
            }


            return res
            .status(200),
            .clearcookie("accessToken",options)
            .clearcookie("refreshToken", options)
            .json( new ApiResponse(
                200,
                {},
                "User Logged Out"
            )
        )



        }
    )

})

const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");

    }

    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)

    const user  = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }


})


export {registerUser,
    loginUser,
    logOutUser
}