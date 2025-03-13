// we pass the db as a higher order function

/*
const asyncHandler = () => {} // arrow fxn
const asyncHandler = () => { (func) => {} } // passing fxn in a fxn is higher order fxn
const asyncHandler = () => aysnc (func) => {} // we just removed the  outer bractes and wrote async
*/

 // implementaion of route error handeling using try catch

 const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }
};

//using promises for route error handeling

// const asyncHandler = (requestHandeler)=>{
//     (req,res,next) => {
//         Promise.resolve(requestHandeler(req,res,next)).catch((err) => next(err))
//     }

// }


export {asyncHandler}
