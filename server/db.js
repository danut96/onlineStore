const Sequelize = require('sequelize');

const sequelize = new Sequelize('online_store', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
});

const User = sequelize.define('user', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    phone: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    }
});

// User.sync({force: true}).then(() => {
//     // Table created
//     return User.create({
//         id: 1,
//         firstName: 'Dan',
//         lastName: 'Preda',
//         email: 'predadanut96@gmail.com',
//         password: 'ana',
//         phone: '0741182859',
//         address: 'Straduintei 8'
//     });
//   });

module.exports = {
    User
}
