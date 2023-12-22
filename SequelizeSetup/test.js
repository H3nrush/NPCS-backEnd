const sequelize = require('./SequelizeSetup')

async function testConnection(){
  try{
    await sequelize.authenticate();
    console.log('we connect to the database successful !')
  } catch (error){
    console.error("unable to connecte the database :" , error.message);
  } finally{
    await sequelize.close();
  }}

  testConnection()