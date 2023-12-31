import { Router } from 'express';
import { allowImageMineTypes } from '../../constants.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
  getProductSpecifications,
  addProductVariants,
  updateProductVariants,
  toggleHideProduct,
  deleteProductVariants,
  getFullAllProducts,
  getBestSellerProducts,
  getSuggestProducts
} from '../../controllers/products.controller.js';
import { isAdmin, isAdminOrStaff } from '../../middlewares/jwt-auth.js';
import  UploadUtils from '../../utils/UploadUtils.js';

const router = Router();
const upload = UploadUtils.multerUpload(
  '/products/',
  allowImageMineTypes,
  21    // 21 = 1 thumbnail + 20 pictures
);
const uploadFields = [{ name: 'thumbnail', maxCount: 1 }, { name: 'pictures', maxCount: 20 }];

/**
 * Authorization
 * Get all, get one, rate : any user
 * Create, update, hide   : admin or staff
 * Delete                 : only admin
 */

router.get('/', getAllProducts);
router.get('/all', getFullAllProducts);
router.get('/specs', getProductSpecifications);
router.get('/best-seller', getBestSellerProducts);
router.get('/search/suggest', getSuggestProducts);
router.get('/:identity', getProductById);

router.post('/',
  isAdminOrStaff,
  upload.fields(uploadFields),
  UploadUtils.handleFilePath(uploadFields),
  createProduct
);
router.patch('/:identity', isAdminOrStaff, updateProduct);
router.delete('/:identity', isAdmin, deleteProduct);
router.patch('/:identity/toggleHide', isAdmin, toggleHideProduct);
router.patch('/:identity/rate', rateProduct);

router.post('/:identity/variants',
  isAdminOrStaff,
  upload.fields(uploadFields),
  UploadUtils.handleFilePath(uploadFields),
  addProductVariants
);
router.patch('/:identity/variants/:sku',
  isAdminOrStaff,
  upload.fields(uploadFields),
  UploadUtils.handleFilePath(uploadFields),
  updateProductVariants
);
router.delete('/:identity/variants/:sku', isAdmin, deleteProductVariants);

export default router;
