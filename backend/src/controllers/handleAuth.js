//Users, Auth
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

//Download img gg
const downloadImage = async (url, filename) => {
  try {
    const folderPath = path.join('uploads', 'avatar');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);
    const response = await axios({ url, responseType: 'stream' });

    await new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(filePath)).on('finish', resolve).on('error', reject);
    });

    return `/uploads/avatar/${filename}`;
  } catch (err) {
    console.error('Error load image:', err);
    return null;
  }
};

// handle login gg
export const handleGoogleAuth = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;
    console.log('Google info:', { email, name, picture, googleId });

    let user = await User.findOne({ where: { email } });

    if (user) {
      // update googleid / picture
      if (!user.googleId) user.googleId = googleId;
      if (!user.picture && picture) {
        const localPath = await downloadImage(picture, `${Date.now()}-${googleId}.jpg`);
        user.picture = localPath;
      }
      await user.save();
      console.log('Update user:', user.email);
    } else {
      //Create new user
      const localPath = await downloadImage(picture, `${Date.now()}-${googleId}.jpg`);
      user = await User.create({
        name,
        email,
        googleId: googleId,
        picture: localPath,
        password: null,
      });
      console.log('Create new user from Google:', user.email);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    // Send to frontend
    res.status(200).json({
      message: 'Successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Authentication error Google:', error);
    res.status(500).json({ message: 'Authentication error Google' });
  }
};
