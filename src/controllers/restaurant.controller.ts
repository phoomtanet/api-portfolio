import { Request, Response } from 'express';
import { 
  getRestaurantsByUserId as getRestaurantsByUserIdService,
  getRestaurantByUserIdAndRestaurantId as getRestaurantByUserIdAndRestaurantIdService,
  createRestaurantForUser as createRestaurantForUserService,
  getMenusByRestaurantId as getMenusByRestaurantIdService,
  getMenuByRestaurantIdAndMenuId as getMenuByRestaurantIdAndMenuIdService,
  createMenuForRestaurant as createMenuForRestaurantService
} from '../services/restaurant.service';
import AppError from '../types/app-error';

// Get restaurants by user_id
export const getRestaurantsByUserId = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const userId = parseInt(user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user_id' });
    }

    const result = await getRestaurantsByUserIdService(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Error getting restaurants by user_id:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific restaurant by user_id and restaurant_id
export const getRestaurantByUserIdAndRestaurantId = async (req: Request, res: Response) => {
  try {
    const { user_id, restaurant_id } = req.params;

    const userId = parseInt(user_id);
    const restaurantId = parseInt(restaurant_id);

    if (isNaN(userId) || isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid user_id or restaurant_id' });
    }

    const restaurant = await getRestaurantByUserIdAndRestaurantIdService(userId, restaurantId);
    res.json(restaurant);
  } catch (error) {
    console.error('Error getting restaurant:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create restaurant (for user)
export const createRestaurantForUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { restaurant_name_th, restaurant_name_en, created_by } = req.body;

    const userId = parseInt(user_id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user_id' });
    }

    if (!restaurant_name_th?.trim()) {
      return res.status(400).json({ error: 'restaurant_name_th is required' });
    }

    const restaurant = await createRestaurantForUserService(userId, {
      restaurant_name_th: restaurant_name_th.trim(),
      restaurant_name_en: restaurant_name_en?.trim(),
      created_by
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get menus by restaurant_id
export const getMenusByRestaurantId = async (req: Request, res: Response) => {
  try {
    const { user_id, restaurant_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const userId = parseInt(user_id);
    const restaurantId = parseInt(restaurant_id);

    if (isNaN(userId) || isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid user_id or restaurant_id' });
    }

    const result = await getMenusByRestaurantIdService(
      userId,
      restaurantId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Error getting menus by restaurant_id:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific menu by restaurant_id and menu_id
export const getMenuByRestaurantIdAndMenuId = async (req: Request, res: Response) => {
  try {
    const { user_id, restaurant_id, menu_id } = req.params;

    const userId = parseInt(user_id);
    const restaurantId = parseInt(restaurant_id);
    const menuId = parseInt(menu_id);

    if (isNaN(userId) || isNaN(restaurantId) || isNaN(menuId)) {
      return res.status(400).json({ error: 'Invalid user_id, restaurant_id, or menu_id' });
    }

    const menu = await getMenuByRestaurantIdAndMenuIdService(userId, restaurantId, menuId);
    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create menu for restaurant
export const createMenuForRestaurant = async (req: Request, res: Response) => {
  try {
    const { user_id, restaurant_id } = req.params;
    const { 
      menu_name_th, 
      menu_name_en, 
      menu_description_th, 
      menu_description_en, 
      menu_image, 
      created_by 
    } = req.body;

    const userId = parseInt(user_id);
    const restaurantId = parseInt(restaurant_id);

    if (isNaN(userId) || isNaN(restaurantId)) {
      return res.status(400).json({ error: 'Invalid user_id or restaurant_id' });
    }

    if (!menu_name_th?.trim()) {
      return res.status(400).json({ error: 'menu_name_th is required' });
    }

    const menu = await createMenuForRestaurantService(userId, restaurantId, {
      menu_name_th: menu_name_th.trim(),
      menu_name_en: menu_name_en?.trim(),
      menu_description_th: menu_description_th?.trim(),
      menu_description_en: menu_description_en?.trim(),
      menu_image: menu_image?.trim(),
      created_by
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
