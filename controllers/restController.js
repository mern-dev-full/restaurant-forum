const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const { getPagination, getPaginationInfo } = require('../tools')
const ITEMS_PER_PAGE = 10

module.exports = {
  getRestaurants: async (req, res) => {
    const whereQuery = {}
    let categoryId = ''
    // check if any category is selected
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['categoryId'] = categoryId
    }

    // handle pagination
    const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

    try {
      const restaurants = await Restaurant.findAndCountAll({ include: Category, where: whereQuery, ...limiting })
      const categories = await Category.findAll()

      const data = restaurants.rows.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.filter(d => d.id === restaurant.id).length !== 0
      }))

      // generate an array based on the number of total pages
      const pagination = getPagination(restaurants.count, ITEMS_PER_PAGE)

      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId,
        pagination,
        currentPage: page,
        nextPage: page + 1,
        lastPage: page - 1,
        hasLastPage: page !== 1,
        hasNextPage: Math.ceil(restaurants.count / ITEMS_PER_PAGE) !== page,
      })
    } catch (err) {
      console.log(err)
    }
    return res.render('restaurants')
  },
  getRestaurant: async (req, res) => {
    try {
      // get restaurant
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: [User] },
          { model: User, as: 'FavoritedUsers' }
        ]
      })
      console.log(restaurant)
      // check if favorite list has the user on it
      const isFavorited = restaurant.FavoritedUsers.filter(user => user.id === req.user.id).length !== 0

      // update view count
      restaurant.viewCounts += 1
      await restaurant.save()
      return res.render('restaurant', { restaurant, isFavorited })
    } catch (err) {
      console.log(err)
    }
  },
  getFeeds: async (req, res) => {
    try {
      // find latest restaurants created
      const restaurants = await Restaurant.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [Category]
      })
      // find latest comments created
      const comments = await Comment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [User]
      })
      return res.render('feeds', { restaurants, comments })
    } catch (err) {
      console.log(err)
    }
  },
  getDashboard: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: [Comment, Category] })
      res.render('dashboard', {
        restaurant,
        commentCount: restaurant.Comments.length
      })
    } catch (err) {
      console.log(err)
    }
  }
}