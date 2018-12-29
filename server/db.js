const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
    }
});


const Category = sequelize.define('category', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    }
});

const Subcategory = sequelize.define('subcategory', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    }
});

Subcategory.belongsTo(Category);
Category.hasMany(Subcategory);

const Product = sequelize.define('product', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    image: {
        type: Sequelize.TEXT
    },
    name: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.TEXT
    },
    rating: {
        type: Sequelize.FLOAT
    },
    price: {
        type: Sequelize.FLOAT
    },
    discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0
    },
    stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

Product.belongsTo(User);
Product.belongsTo(Subcategory);

const Review = sequelize.define('review', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.TEXT
    },
    rating: {
        type: Sequelize.FLOAT
    },
    owner: {
        type: Sequelize.BOOLEAN
    }
});

const Address = sequelize.define('address', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // defaultValue: 1
    },
    content: {
        type: Sequelize.STRING
    }
});

// role = 1 - for client, 2 - for seller, 3 - for admin
const Role = sequelize.define('role', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        // defaultValue: 1
    },
    role: {
        type: Sequelize.INTEGER
    }
});

Role.belongsTo(User);
Address.belongsTo(User);

Review.belongsTo(User);
Review.belongsTo(Product);

const Order = sequelize.define('order', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
        // defaultValue: 1
    },
    productName:{
        type:Sequelize.STRING
    },
    quantity:{
        type:Sequelize.INTEGER
    },
    discount:{
        type:Sequelize.FLOAT
    },
    price:{
        type:Sequelize.FLOAT
    }
});

const Basket = sequelize.define('basket', {
    quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});

Basket.belongsTo(User);
Basket.belongsTo(Product);

Order.belongsTo(Address);
Order.belongsTo(User);
// Order.hasMany(Product);


const Request = sequelize.define('request', {
    id: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.TEXT
    },
    stage: {
        type: Sequelize.STRING
    }
});

Request.belongsTo(User);

module.exports = {
    User,
    Category,
    Subcategory,
    Product,
    Review,
    Order,
    Op,
    Basket,
    Address,
    Role,
    Request
}
