import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';

const signToken = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ id, email, password_hash: passwordHash, first_name: firstName || '', last_name: lastName || '' }])
      .select('id, email, first_name, last_name')
      .single();

    if (error) throw error;

    res.status(201).json({ user, token: signToken(user.id, user.email) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...userData } = user;
    res.json({ user: userData, token: signToken(user.id, user.email) });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ first_name: firstName, last_name: lastName, phone, updated_at: new Date().toISOString() })
      .eq('id', req.user.userId)
      .select('id, email, first_name, last_name, phone')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
