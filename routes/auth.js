import express from "express";
import multer from 'multer'
import { dirname,join } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import {changePassword, deleteUser, forgotPassword, getAllUsers, getUser, getUserProfi1e, loginUser, logoutUser, registerUser, resetPassword, updateProfile, updateUser,prescriptionUpload, deletePrescription, verifyUserEmail} from '../controllers/authController.js'
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/authenticate.js";

const upload = multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,join(__dirname,'..','uploads/user'))
        },
        filename:function(req,file,cb){
            cb(null,file.originalname)
        }
    })
})
const router = express.Router();

router.route('/register').post(upload.single('avatar'),registerUser);
router.route('/auth/verify/:token').get(verifyUserEmail);
router.route('/login').post(loginUser); 
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/myprofile').get(isAuthenticatedUser,getUserProfi1e);
router.route('/password/change').put(isAuthenticatedUser,changePassword);
router.route('/update').put(isAuthenticatedUser,upload.single('avatar'),updateProfile);
router.route('/update/prescription').put(isAuthenticatedUser,upload.single('prescription'),prescriptionUpload);
router.route('/signupSuccess').get((req, res) => {
    // Render the signup success page here
    res.render('signupSuccess'); // Replace 'signupSuccess' with the actual name of your signupSuccess view/template
});
//Admin routes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'),getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'),getUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'),updateUser)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'),deleteUser);
router.route('/admin/user/update/prescription/:filename').delete(isAuthenticatedUser,authorizeRoles('admin'),deletePrescription)
export default router;