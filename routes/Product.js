import  express  from 'express';
import { createReview, deleteProduct, deleteReview, getAdminProducts, getProducts, getReviews, getSingleProduct, newProduct, updateProduct } from '../controllers/productController.js';
import { isAuthenticatedUser,authorizeRoles } from '../middlewares/authenticate.js';
import multer from 'multer'
import { dirname,join } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, join(__dirname, '..', 'uploads/product'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB limit (adjust as needed)
    },
});

const router = express.Router();

router.route('/products').get(getProducts)
router.route('/product/:id').get(getSingleProduct)
router.route('/review').put(isAuthenticatedUser, createReview)
                        

//Admin Routes
router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),upload.array('images'),newProduct);
router.route('/admin/products').get(isAuthenticatedUser,authorizeRoles('admin'),getAdminProducts);
router.route('/admin/product/:id').delete(isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles('admin'),upload.array('images'),updateProduct);
router.route('/admin/reviews').get(isAuthenticatedUser,authorizeRoles('admin'),upload.array('images'),getReviews);
router.route('/admin/review').delete(isAuthenticatedUser,authorizeRoles('admin'),upload.array('images'),deleteReview)

export default router;