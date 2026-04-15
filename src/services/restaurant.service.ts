import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import AppError from '../types/app-error';

const restaurantSelect = {
  id: true,
  restaurant_name_th: true,
  restaurant_name_en: true,
  is_active: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
  deleted_at: true,
  deleted_by: true,
} satisfies Prisma.restaurantSelect;

const restaurantWithIncludes = {
  ...restaurantSelect,
  restaurant_users: {
    where: {
      is_active: true
    },
    include: {
      User: {
        select: {
          id: true,
          username: true,
          fullname: true,
          email: true
        }
      },
      Role: {
        select: {
          id: true,
          role_name: true
        }
      }
    }
  },
  restaurant_menus: {
    where: {
      is_active: true
    },
    select: {
      id: true,
      menu_name_th: true,
      menu_name_en: true,
      menu_description_th: true,
      menu_description_en: true,
      menu_image: true,
      is_active: true
    }
  }
} satisfies Prisma.restaurantSelect;

/* ── base filter: exclude soft-deleted ────────────────────────────────── */
const notDeleted: Prisma.restaurantWhereInput = { deleted_at: null };

/* ── Get restaurants by user_id ───────────────────────────────────────── */
export const getRestaurantsByUserId = async (userId: number, limit: number, offset: number) => {
  const where: Prisma.restaurantWhereInput = {
    ...notDeleted,
    is_active: true,
    restaurant_users: {
      some: {
        user_id: userId,
        is_active: true
      }
    }
  };

  const [total, restaurants] = await prisma.$transaction([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      select: restaurantWithIncludes,
      where,
      take: limit,
      skip: offset,
      orderBy: { id: 'asc' }
    })
  ]);

  return { data: restaurants, total, limit, offset };
};

/* ── Get restaurant by user_id and restaurant_id ────────────────────────── */
export const getRestaurantByUserIdAndRestaurantId = async (userId: number, restaurantId: number) => {
  const restaurant = await prisma.restaurant.findFirst({
    select: {
      ...restaurantWithIncludes,
      restaurant_menus: {
        where: {
          is_active: true
        },
        orderBy: {
          created_at: 'desc'
        }
      }
    },
    where: {
      id: restaurantId,
      ...notDeleted,
      is_active: true,
      restaurant_users: {
        some: {
          user_id: userId,
          is_active: true
        }
      }
    }
  });

  if (!restaurant) {
    throw new AppError('Restaurant not found or access denied', 404);
  }

  return restaurant;
};

/* ── Create restaurant for user ─────────────────────────────────────────── */
export const createRestaurantForUser = async (userId: number, data: {
  restaurant_name_th?: string;
  restaurant_name_en?: string;
  created_by?: string;
}) => {
  const restaurant = await prisma.restaurant.create({
    select: restaurantWithIncludes,
    data: {
      restaurant_name_th: data.restaurant_name_th?.trim() ?? null,
      restaurant_name_en: data.restaurant_name_en?.trim() ?? null,
      created_by: data.created_by ?? userId.toString(),
      restaurant_users: {
        create: {
          user_id: userId,
          role_id: 1, // Assuming role_id 1 is admin/owner
          created_by: data.created_by ?? userId.toString()
        }
      }
    }
  });

  return restaurant;
};