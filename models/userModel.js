import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'Please enter name']},
    email: {type: String, required: [true, 'Please enter email'], unique: true, validate: [validator.isEmail, 'Please enter a valid email address']},
    age: {type: Number, required: [true, 'Please enter DOB']},
    address: {type: String},
    number: {type: Number, required: [true, 'Please enter Mobile number']},
    password: {type: String, required: [true, 'Please enter password'], maxLength: [8, 'Password cannot exceed 8 characters'], select: false},
    avatar: {type: String, default: 'user'},
    prescription: {type: String},
    role: {type: String, default: 'user'},
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    createdAt: {type: Date, default: Date.now},
    isVerified: {
        type: Boolean,
        default: false,
      },
      verificationToken: String,
    verificationTokenExpire: Date,
});

userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = await bcrypt.hash(this.password, 10);
        return next();
    
});

userSchema.methods.generateVerificationToken = function() {
    // Generate a random token using crypto
    const token = crypto.randomBytes(20).toString('hex');
    // Assign the token to the user's verificationToken field
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    // Set an expiration time for the token (e.g., 24 hours from now)
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    // Return the token
    return token;
};
userSchema.methods.getJwtToken = function (next){
    return jwt.sign({id:this.id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.isValidPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getResetToken= function(){
    //generte token
    const token = crypto.randomBytes(20).toString('hex');
    //generate hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    //set token exprie time
    this.resetPasswordTokenExpire = Date.now()+30*60*1000
    return token;
}
let model = mongoose.model("User",userSchema);

export default model;