const express = require('express');
const router = express.Router();
const {isLoggedIn,customRole} = require('../middlewares/user')

const {signup,login,logout,forgotpassword,passwordReset,getloggedinDetails,changepassword,updateUserDetails,adminAllUsers,managerAllUsers,adminGetUser,adminUpdateOneUserDetails,adminDeleteOneUser} = require('../controllers/userController')

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotpassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userDashboard").get(isLoggedIn,getloggedinDetails);
router.route("/password/update").post(isLoggedIn,changepassword);
router.route("/userDashboard/update").post(isLoggedIn,updateUserDetails);


router.route('/admin/users').get(isLoggedIn,customRole('admin'), adminAllUsers);
router.route('/admin/users/:id')
.get(isLoggedIn,customRole('admin'), adminGetUser)
.put(isLoggedIn,customRole('admin'), adminUpdateOneUserDetails)
.delete(isLoggedIn,customRole('admin'), adminDeleteOneUser);

router.route('/manager/users').get(isLoggedIn,customRole('manager'), managerAllUsers);
module.exports=router;