import { supabase } from '../config/supabase.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { AppError } from '../middlewares/errorHandler.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUpWithPassword({
      email,
      password
    });

    if (authError) throw new AppError(authError.message, 400);

    // Create user in database
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password_hash: passwordHash,
        name,
        role: 'customer'
      })
      .select()
      .single();

    if (dbError) throw new AppError(dbError.message, 400);

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};
