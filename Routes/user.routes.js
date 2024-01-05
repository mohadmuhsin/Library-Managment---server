const expess = require('express')
const router =  expess.Router()
const userController =  require('../Controllers/user.controller');
const { verifyToken } = require('../auth/jwt.auth');

router.post("/UP", verifyToken, userController.editProfile);
router.patch("/BB/:book_id",verifyToken, userController.borrow);
router.get("/getB",verifyToken, userController.getBooks);
router.get("/getBdB",verifyToken, userController.getBorrwoedBooks)
router.get("/GB",verifyToken, userController.getUserBooks);
router.patch("/RB/:book_id",verifyToken, userController.returnBooks);

router.get("/getP",verifyToken, userController.getUserData)
router.post("/logout",verifyToken, userController.logout)


module.exports = router