import mongoose from 'mongoose';
import crypto from 'crypto';

const temporaryUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    address: { type: String },
    number: { type: Number, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    verificationToken: String,
    verificationTokenExpire: Date,
    createdAt: { type: Date, default: Date.now }
});

temporaryUserSchema.methods.generateVerificationToken = function () {
    // Generate a token using crypto
    const token = crypto.randomBytes(20).toString('hex');
    // Generate a hash and set it to verificationToken
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    // Set token expiration time (e.g., 24 hours from now)
    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    return token;
};

export const TemporaryUser = mongoose.model('TemporaryUser', temporaryUserSchema);
