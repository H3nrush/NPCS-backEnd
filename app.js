const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
// Connect to the database
const sequelize = new Sequelize('npcs', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define models for User, Post, Image, Like, Comment, and Favorite
const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Username: DataTypes.STRING,
  ProfileName : DataTypes.STRING ,
  Password: DataTypes.STRING,
  UserType: DataTypes.STRING,
});

const Post = sequelize.define('Post', {
  PostID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Content: DataTypes.STRING,
  Timestamp: DataTypes.DATE,
});

const Image = sequelize.define('Image', {
  ImageID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ImageURL: DataTypes.STRING,
});

const Like = sequelize.define('Like', {
  LikeID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

const Comment = sequelize.define('Comment', {
  CommentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CommentText: DataTypes.STRING,
});

const Favorite = sequelize.define('Favorite', {
  FavoriteID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

// Define associations between models
User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Image);
Image.belongsTo(Post);

User.hasMany(Like);
Like.belongsTo(User);

Post.hasMany(Like);
Like.belongsTo(Post);

User.hasMany(Comment);
Comment.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);
 
User.hasMany(Favorite);
Favorite.belongsTo(User);

Post.hasMany(Favorite);
Favorite.belongsTo(Post);

// Hash user password before creating a new user
User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.Password, 10);
  user.Password = hashedPassword;
});

// Define routes
app.use(express.json());

// GET method for retrieving users
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// GET method for retrieving a user by username
app.get('/users/:username', async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ where: { Username: username } });

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST method for user login
app.post('/login', async (req, res) => {
  const { Username, Password } = req.body;

  // Find the user by username
  const user = await User.findOne({ where: { Username: Username } });

  if (user) {
    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (passwordMatch) {
      // Create a session or generate a token for authentication (e.g., JWT)
      req.session.userId = user.UserID; // Use a session or JWT payload for authentication
      req.session.userType = user.UserType;

      res.json({
        UserId: user.UserID,
        Username: user.Username,
        UserType: user.UserType,
        message: 'Login successful',
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});



// POST method for user logout
app.post('/logout', (req, res) => {
  // Destroy the session or invalidate the token (depending on your authentication mechanism)
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Logout failed' });
    } else {
      res.json({ message: 'Logout successful' });
    }
  });
});




// POST method for creating a new user
app.post('/users', async (req, res) => {
  const { Username, Password} = req.body;
  const newUser = await User.create({ Username, Password});
  res.json(newUser);
});

// PUT method for updating a user
app.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { Username, Password} = req.body;
  const user = await User.findByPk(userId);
  if (user) {
    user.Username = Username;
    user.Password = Password;
    await user.save();
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// DELETE method for deleting a user
app.delete('/users/:id', async (req, res) => {
  const loggedInUserId = req.headers['user-id']; // Assuming you have a way to get the currently logged-in user's ID

  // Check if the logged-in user is an admin
  const loggedInUser = await User.findByPk(loggedInUserId);
  if (!loggedInUser || loggedInUser.UserType !== 'admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const userIdToDelete = req.params.id;
  const userToDelete = await User.findByPk(userIdToDelete);

  // Check if the user to delete exists
  if (!userToDelete) {
    return res.status(404).json({ message: 'User not found' });
  }

  // If the logged-in user is an admin or the user to delete is the same as the logged-in user, proceed with deletion
  if (loggedInUser.UserType === 'admin' || loggedInUserId === userIdToDelete) {
    await userToDelete.destroy();
    return res.json({ message: 'User deleted successfully' });
  } else {
    return res.status(403).json({ message: 'Permission denied' });
  }
});


// Start the server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
