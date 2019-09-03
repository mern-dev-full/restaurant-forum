const express = require('express')
const router = express.Router()
const { isAuthUser, isAuthAdmin, isOwner } = require('../config/apiAuth')

// Include multer and config
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')
const restController = require('../controllers/api/restController')
const commentController = require('../controllers/api/commentController')

router.get('/restaurants', isAuthUser, restController.getRestaurants)
router.get('/restaurants/feeds', isAuthUser, restController.getFeeds)
router.get('/restaurants/top', isAuthUser, restController.getTopRestaurants)
router.get('/restaurants/:id', isAuthUser, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', isAuthUser, restController.getDashboard)

router.post('/favorite/:restaurantId', isAuthUser, userController.addFavorite)
router.delete('/favorite/:restaurantId', isAuthUser, userController.removeFavorite)

router.post('/following/:userId', isAuthUser, userController.addFollowing)
router.delete('/following/:userId', isAuthUser, userController.removeFollowing)

router.post('/like/:restaurantId', isAuthUser, userController.addLike)
router.delete('/like/:restaurantId', isAuthUser, userController.deleteLike)

router.post('/comments', isAuthUser, commentController.postComment)
router.delete('/comments/:id', isAuthUser, isAuthAdmin, commentController.deleteComment)

router.get('/users/top', isAuthUser, userController.getTopUser)
router.get('/users/:id', isAuthUser, userController.getUser)
router.put('/users/:id', isAuthUser, isOwner, upload.single('image'), userController.putUser)

router.get('/admin/restaurants', isAuthUser, isAuthAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', isAuthUser, isAuthAdmin, adminController.getRestaurant)
router.delete('/admin/restaurants/:id', isAuthUser, isAuthAdmin, adminController.deleteRestaurant)
router.post('/admin/restaurants', isAuthUser, isAuthAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', isAuthUser, isAuthAdmin, upload.single('image'), adminController.putRestaurant)

router.get('/admin/categories', isAuthUser, isAuthAdmin, categoryController.getCategories)
router.post('/admin/categories', isAuthUser, isAuthAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.deleteCategory)

router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router