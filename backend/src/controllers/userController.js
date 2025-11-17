//ACccount
import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { firstName, lastName, schoolName, companyName, bio, avatar } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    if (firstName || lastName) {
      const f = firstName || user.firstName || '';
      const l = lastName || user.lastName || '';
      user.name = `${f} ${l}`.trim();
    }

    user.schoolName = schoolName || user.schoolName;
    user.companyName = companyName || user.companyName;
    user.bio = bio || user.bio;

    if (avatar) {
      user.picture = avatar;
    }

    await user.save();

    return res.status(200).json({
      message: 'Update successful',
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      schoolName: user.schoolName,
      companyName: user.companyName,
      bio: user.bio,
      avatar: user.picture,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
