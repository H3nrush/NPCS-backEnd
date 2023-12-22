const { Sequelize , DataTypes } = require("sequelize");
const mysql = require('mysql2');
const sequelize = new Sequelize('npcs','root','',{
  host : 'localhost',
  dialect : 'mysql' ,
  logging : false
});

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Username: DataTypes.STRING,
  Password: DataTypes.STRING,
  UserType: DataTypes.STRING,
});



module.exports = sequelize; 