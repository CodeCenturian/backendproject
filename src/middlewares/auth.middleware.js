import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandeler.js";
import { jwt } from "jsonwebtoken";
import {User} from "../models/user.model.js"

 const verifyJWT = asyncHandler(async (req,res,next) => {
    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // the header is for mobile apps
        if(!token){
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401,"Invalid Access Token")
        }

        req.user = user; // we make a object called user
        next ()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})

export {verifyJWT}