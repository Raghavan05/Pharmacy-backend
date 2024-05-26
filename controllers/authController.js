import catchAsyncError from '../middlewares/catchAsyncError.js'
import User from '../models/userModel.js'
import sendEmail from '../utils/email.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendToken from '../utils/jwt.js';
import crypto from 'crypto'

export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, age, address, number, password } = req.body;

    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "production") {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    if (req.file) {
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
    }

    // Create the user
    const user = await User.create({
        name,
        email,
        age,
        address,
        number,
        password,
        avatar,
        isVerified: false // Set initial verification status to false
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();

    // Save the user without validating (e.g., email already exists, etc.)
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${BASE_URL}/api/v1/auth/verify/${verificationToken}`;

    // Create the verification message
    const message = `
    <p>Hello ${name},</p>
    <p>Please verify your email by clicking on the following button:</p>
    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
`;
    // Send verification email
    try {
        await sendEmail({
            email: user.email,
            subject: "Email Verification",
            html:message,
        });

        res.status(201).json({
            success: true,
            message: `Verification email sent to ${user.email}`,
        });
    } catch (error) {
        // Handle errors: remove token and expiration date
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

export const verifyUserEmail = async (req, res, next) => {
    // Extract the verification token from the request parameters
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    try {
        // Find the user with the provided verification token
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        // If user not found or token has expired, return error
        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid or expired verification token' });
        }
        
        // Set user's verification status to true and remove verification token fields
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
        let BASE_URL = process.env.FRONTEND_URL;
        // Redirect to the signupSuccess page
        res.redirect(`${BASE_URL}/signupSuccess`);
    } catch (error) {
        // Handle any errors
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    // Find the user with the provided email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // // Check if the user's email is verified
    // if (!user.isVerified) {
    //     return next(new ErrorHandler('Email not verified. Please verify your email first.', 401));
    // }

    // Check the password
    if (!await user.isValidPassword(password)) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Send the token
    sendToken(user, 201, res);
});

// export const registerUser = catchAsyncError(async (req, res, next)=>{
//     const {name, email, age, address, number, password } = req.body

//     let avatar;
    
//     let BASE_URL = process.env.BACKEND_URL;
//     if(process.env.NODE_ENV === "production"){
//         BASE_URL = `${req.protocol}://${req.get('host')}`
//     }

//     if(req.file){
//         avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
//     }

//     const user = await User.create({
//         name,
//         email,
//         age,
//         address,
//         number, 
//         password,
//         avatar
//     });

//     sendToken(user, 201, res)

// })

// export const loginUser = catchAsyncError(async (req, res, next)=>{
//     const {email,password} = req.body
//     if(!email || !password){
//         return next(new ErrorHandler('Please enter email or password',400))
//     }

//     //finding the user 
//     const user = await User.findOne({email}).select('+password');
//     if(!user){
//         return next(new ErrorHandler('Invalid email or password',401))   
//     }
//     if(!await user.isValidPassword(password)){
//         return next(new ErrorHandler('Invalid email or password',401))   
//     }
//     sendToken(user,201,res);

// })

export const logoutUser = (req, res, next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly : true
    }).status(200)
    .json({
        success:true,
        message:"Loggedout"
    })
}

export const forgotPassword = catchAsyncError(async (req, res, next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler('user not found with this email',404))
    }
    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave:false})

    let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }


    //Create reset url
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;
    const message = `Your password reset url is as follows \n\n
    ${resetUrl} if you have not requested this email, then ignore it.`
    
    try {
        sendEmail({
            email:user.email,
            subject:"Pharmonics password recovery",
            message
        })
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message,500))

    }

})

export const resetPassword = catchAsyncError(async(req, res, next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire:{
            $gt:Date.now()
        }
    })
    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or expire',404))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match',404))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({validateBeforeSave:false})
    sendToken(user,201,res);
})

//Get User Profile
export const getUserProfi1e = catchAsyncError(async (req, res,next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})


export const changePassword  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    //assigning new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
    })
 })

 export const updateProfile = catchAsyncError(async (req, res, next) => {
    let newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData,avatar }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })

})

// Prescription upload
export const prescriptionUpload = catchAsyncError(async (req, res, next) => {    
    let { name, address, number } = req.body; // Extracting name, address, and number from the request body
    let prescriptionfile;
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }   
    if(req.file){
        prescriptionfile = `${BASE_URL}/uploads/user/${req.file.originalname}`
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
        name,
        address,
        number,
        prescription: prescriptionfile,
    },{
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        user
    })

})

//Admin get all users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
         success: true,
         users
    })
 })

//Admin: Get Specific User - api/v1/admin/user/:id
export const getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
   })
});

//Admin: Update User - api/v1/admin/user/:id
export const updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })
})

//Admin: Delete User - api/v1/admin/user/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
    }
    await user.deleteOne();
    res.status(200).json({
        success: true,
    })
})

export const deletePrescription = catchAsyncError(async (req, res, next) => {
    let prescription = " ";
    let prescriptionfile;
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }   
    if(req.file){
        prescriptionfile = `nil`
        prescription = prescriptionfile;
    }

    const user = await User.findByIdAndUpdate(req.user.id, {prescription}, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })

})


