import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // Correct import for JWT

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // improves searchability
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true
        },
        coverImage: {
            type: String // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

/***************************** */
userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10); // Added await
        next();
    } else {
        return next();
    }
});

// we make methods using middlewares like this to check if the password is correct
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

/********************************** */

// method for generating access and tokens
// jwt.sign is used to access the protected route
userSchema.methods.generateAccessToken = function(){
    return jwt.sign( // Corrected to use jwt.sign
        {  // payload, data to access
            _id: this.id, // from mongodb
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign( // Corrected to use jwt.sign
        { // payload
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

/* /****************************** */

export const User = mongoose.model("User", userSchema);
