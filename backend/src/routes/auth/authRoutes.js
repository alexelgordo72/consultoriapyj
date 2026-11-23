const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const authController = require('../../controllers/authController');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);

// Rutas solo admin
router.post('/users', authenticate, authorize('admin'), authController.createUser);
router.get('/users', authenticate, authorize('admin'), authController.listUsers);
router.put('/users/:userId', authenticate, authorize('admin'), authController.updateUser);

module.exports = router;
