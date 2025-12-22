
import express from 'express';
import {
    authUser,
    registerUser,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
