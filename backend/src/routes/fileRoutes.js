const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/:clientId', fileController.getFiles);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
