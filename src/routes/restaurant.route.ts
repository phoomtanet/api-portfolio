import { Router } from 'express';
import { 
  getRestaurantsByUserId, 
  getRestaurantByUserIdAndRestaurantId, 
  createRestaurantForUser,
  getMenusByRestaurantId,
  getMenuByRestaurantIdAndMenuId,
  createMenuForRestaurant
} from '../controllers/restaurant.controller';

const router = Router();

/**
 * @openapi
 * /user/{user_id}/restaurant:
 *   get:
 *     summary: Get all restaurants for a specific user
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of restaurants for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       400:
 *         description: Invalid user_id
 *       500:
 *         description: Internal server error
 */
router.get('/user/:user_id/restaurant', getRestaurantsByUserId);

/**
 * @openapi
 * /user/{user_id}/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get a specific restaurant for a user
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details
 *       404:
 *         description: Restaurant not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get('/user/:user_id/restaurant/:restaurant_id', getRestaurantByUserIdAndRestaurantId);

/**
 * @openapi
 * /user/{user_id}/restaurant:
 *   post:
 *     summary: Create a new restaurant for a user
 *     tags:
 *       - Restaurants
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_name_th
 *             properties:
 *               restaurant_name_th:
 *                 type: string
 *                 description: Restaurant name in Thai
 *               restaurant_name_en:
 *                 type: string
 *                 description: Restaurant name in English
 *               created_by:
 *                 type: string
 *                 description: Creator identifier
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/user/:user_id/restaurant', createRestaurantForUser);

/**
 * @openapi
 * /user/{user_id}/restaurant/{restaurant_id}/menu:
 *   get:
 *     summary: Get all menus for a specific restaurant
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of menus for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       400:
 *         description: Invalid user_id or restaurant_id
 *       404:
 *         description: Restaurant not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get('/user/:user_id/restaurant/:restaurant_id/menu', getMenusByRestaurantId);

/**
 * @openapi
 * /user/{user_id}/restaurant/{restaurant_id}/menu/{menu_id}:
 *   get:
 *     summary: Get a specific menu for a restaurant
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: path
 *         name: menu_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu ID
 *     responses:
 *       200:
 *         description: Menu details
 *       400:
 *         description: Invalid user_id, restaurant_id, or menu_id
 *       404:
 *         description: Menu not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get('/user/:user_id/restaurant/:restaurant_id/menu/:menu_id', getMenuByRestaurantIdAndMenuId);

/**
 * @openapi
 * /user/{user_id}/restaurant/{restaurant_id}/menu:
 *   post:
 *     summary: Create a new menu for a restaurant
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menu_name_th
 *             properties:
 *               menu_name_th:
 *                 type: string
 *                 description: Menu name in Thai
 *               menu_name_en:
 *                 type: string
 *                 description: Menu name in English
 *               menu_description_th:
 *                 type: string
 *                 description: Menu description in Thai
 *               menu_description_en:
 *                 type: string
 *                 description: Menu description in English
 *               menu_image:
 *                 type: string
 *                 description: Menu image URL
 *               created_by:
 *                 type: string
 *                 description: Creator identifier
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Restaurant not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post('/user/:user_id/restaurant/:restaurant_id/menu', createMenuForRestaurant);

export default router;
