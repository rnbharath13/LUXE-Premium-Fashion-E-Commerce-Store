import { supabase } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getDashboard = async (req, res, next) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lastUpdated: new Date()
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.json({
      users: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);

    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.json({
      orders: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesAnalytics = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, payment_status')
      .eq('payment_status', 'completed');

    if (error) throw new AppError(error.message, 400);

    // Group by date
    const dailySales = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + order.total_amount;
    });

    res.json({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
      dailySales
    });
  } catch (error) {
    next(error);
  }
};
