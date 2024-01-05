const express = require('express')
const router = express.Router()
const adminController = require('../Controllers/admin.controller');
const { verifyToken } = require('../auth/jwt.auth');

router.post('/addB', verifyToken, adminController.addBooks);
router.get("/GetB", verifyToken, adminController.getBooks);
router.post('/UB', verifyToken, adminController.editBooks);
router.post('/UP', verifyToken, adminController.editProfile);
router.get('/getBD/:id',verifyToken,adminController.getBookRecordDetails)
router.get('/getBDet/:id',verifyToken, adminController.getBookData)
router.get('/userData',verifyToken, adminController.getUserData)
router.post('/logout', verifyToken, adminController.logout);




module.exports = router