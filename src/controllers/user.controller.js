import { asyncHandler } from "../utils/asynchandeler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; // refreshtoken should be saved in the database because we need to check it with accessToken later
        await user.save({ validateBeforeSave: false }); // it is saved without validation, save is a feature of mongoose

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong during generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from front end
    // we take data as we modeled it in user.model.js
    // validation - not empty
    // check if user already exists : username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // if data is coming via form we can get it in req.body
    const { username, email, fullname, password } = req.body;
    console.log("username", username);
    console.log("email", email);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // check for existing user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }], // $or is basically OR
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or Username already exists");
    }

    // check for images, check for avatar
    // multer gives the access of req.files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // creating an entry in the database
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // checking if the entry is made
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Password Incorrect");
    }

    // generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // send in cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true, // by doing these two, the cookies are only modifiable at the server
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In Successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid or Expired Refresh Token");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Access Token Refreshed Successfully"));
    }
    catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh Token");
    }
});

const changeCurrentPassword = asyncHandler(async (req,res) => {

    const {oldPassword ,newPassword} = req.body

    const user = await User.findById(req.user?.id)
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "INvalid Old Password")
    }

    user.password = newPassword
    user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password Changed Successfully"
    ))

})

const getCurrentUser = asyncHandler ( async (req,res) => {
    return res
    .status(200)
    .json(200 , req.user, "Current User Fetched Successfully")
})


const updateAccountDetails = asyncHandler (async (req,res) => {
    const {fullname ,email} = req.body

    if(!fullname || !email){
        throw new ApiError(400,"All field are required")
    }

    const user  = User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullname : fullname,
                email : email
            },

        },
        {new : true} // returns the fullname and email after updating
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse (200, user, "Account details updated successfully"))

})

const updateUserAvatar  = asyncHandler (async (re,res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avatar file is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },{
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(200, user , "Avatar Updated Successfully")
})

const updateUserCoverImage = await (asyncHandler (async (req,res) => {
    const coverImageLocalPath   =  req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is missing")
    }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!coverImage.url) {
    throw new ApiError("Error while uploading the cover Image ")
   }

   await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set :{
            avatar : avatar.url
        }
    },{
        new : true
    }).select("-password")

    return res
    .status(200)
    .json(200, user, "Cover Image updated Successfully")

}))


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    updateUserAvatar,
    updateUserCoverImage
 };
