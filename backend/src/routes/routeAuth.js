import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email đã được đăng ký!' });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      picture: null,
    });

    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error('Error register:', err);
    res.status(500).json({ message: 'Error server' });
  }
});

// Login (Email & Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });

    // KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG
    if (user.isBanned) {
      return res.status(403).json({
        message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.email.endsWith('.admin') ? 'admin' : 'user',
      },
    });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Login with Google
router.post('/google', async (req, res) => {
  try {
    const { sub, googleId, email, name, picture } = req.body;
    const gId = sub || googleId;

    console.log('Google info:', { sub, googleId, email, name, picture });

    if (!email) {
      return res.status(400).json({ message: 'Thiếu email từ Google!' });
    }

    let user = await User.findOne({ where: { email } });

    // KIỂM TRA KHÓA
    if (user && user.isBanned) {
      return res.status(403).json({
        message: 'Tài khoản Google này đã bị vô hiệu hóa trong hệ thống.',
      });
    }

    if (user) {
      if (!user.googleId && gId) user.googleId = gId;
      if (!user.picture && picture) user.picture = picture;
      await user.save();
    } else {
      // Tạo user mới
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId: gId || null,
        picture: picture || null,
        password: null,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Đăng nhập Google thành công',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Error Google login:', error);
    res.status(500).json({ message: 'Lỗi xác thực Google' });
  }
});

export default router;
