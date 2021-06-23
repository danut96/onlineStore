var {
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
} = require('./db.js');
var fs = require('fs');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: 'client/assets/images',
    filename: function (req, file, callback) {
        var filename = file.fieldname + "_" + Date.now().toString().slice(0, -3) + "_" + file.originalname;
        callback(null, filename);
    }
});
  
var upload = multer({ storage: storage });

module.exports = function(app, passport){

    var isSeller = false;
    var isAdmin = false;

    function role(){
        return (req, res, next) => {
            if(req.isAuthenticated() === false){
                isSeller = false;
                isAdmin = false;
                next();
            }else{   
                Role.findOne({where:{userId: req.user.id}}).then(role => {
                isSeller = false;
                isAdmin = false;
                if(role.role === 2){
                    isSeller = true
                } 
                if(role.role === 3){
                    isAdmin = true;
                }
            }).then(() => next());
            }
        }
    }

    function authenticationMiddleware(){
        return (req, res, next) => {
            if(req.isAuthenticated()){
                return next();
            }else{
                res.redirect('/login');
            }
        }
    }



    // place an order
    app.post('/place-order', authenticationMiddleware(), (req, res, next) => {
        Basket.findAll({include: [{model:Product, as: "product"}], where: {userId: req.user.id}}).then(products => {
            Order.sync({force: false}).then(() => {
                products.forEach(product => {
                    Order.create({
                        addressId: req.body.address,
                        userId: req.user.id,
                        productName: product.product.name,
                        quantity: product.quantity, 
                        price: product.product.price * product.quantity,
                        discount: product.product.discount 
                    });
                    Product.update(values = {stock: product.product.stock - product.quantity}, options = {where: {id: product.productId}});
                });
            }).then( () => Basket.destroy({where: {userId: req.user.id}}));
        }).then(() => res.redirect('/'));
    });

    // search by product name, product description, seller, subcategory or category
    app.get('/search', role(),(req, res, next) => {
        var product = req.query.product;
        var subcategory = req.query.subcategory;
        var category = req.query.category;
        var seller = req.query.seller;
        var orderBy = ['discount', 'DESC'];
        var rating = req.query.rating;
        var discount = req.query.discount;
        var price = req.query.price;
        var min = req.query.min;
        var max = req.query.max;
        var stock = req.query.stock;
        if(product){
            var options = {
                include : [
                    {model: User, as:"user", where: {}},
                    {model: Subcategory, as: "subcategory", include: [{model: Category, as: "category", where:{}}], where: {}}
                ],
                where: {
                    [Op.or] : {
                        '$subcategory.name$':  {[Op.like] : `%${req.query.product}%`},
                        '$subcategory.category.name$': {[Op.like] : `%${req.query.product}%`},
                        name : {[Op.like] : `%${req.query.product}%`},
                        description: {[Op.like] : `%${req.query.product}%`},
                        '$user.firstName$': {[Op.like] : `%${req.query.product}%`},
                    }
                },
                order: [orderBy]
            }
        }else{
            var options = {
                include : [
                    {model: User, as:"user", where: {}},
                    {model: Subcategory, as: "subcategory", include: [{model: Category, as: "category", where:{}}], where: {}}
                ],
                where: {},
                order: [orderBy]
            }
        }
        if(rating){
            options.order = [["rating", rating]];
        }
        if(discount){
            options.order = [["discount", discount]];
        }
        if(price){
            options.order = [["price", price]];
        }
        if(stock){
            if(typeof stock === "string"){
                switch(stock){
                    case "in": options.where.stock = {[Op.gt] : 0}; break;
                    case "out": options.where.stock = 0; break;
                    case "last": options.where.stock = {[Op.between] : [1, 14]}; break;
                }
            }else{
                if(stock.includes("in") && stock.includes("last")){
                    options.where.stock = {[Op.gt] : 0}
                }
                if(stock.includes("out") && stock.includes("last")){
                    options.where.stock = {[Op.or] : [0, {[Op.between] : [1, 14]}]}
                }
            }
        }
        if(min){
            options.where.price = {[Op.gte]: min}
        }
        if(max){
            options.where.price = {[Op.lte]: max}
        }
        if(min && max){
            options.where.price = {[Op.between]: [min, max]}
        }
        if(seller){
            if(typeof seller === "string"){
                options.include[0].where.firstName = { [Op.like] : `%${req.query.seller}%`}
            }else{
                options.include[0].where.firstName = { [Op.in] : req.query.seller}
            }
        }
        if(subcategory){
            options.include[1].where.name = {[Op.like] : `%${req.query.subcategory}%`}
        }
        if(category){
            options.include[1].include[0].where.name = {[Op.like] : `%${req.query.category}%`}
        }
        Product.findAll(options).then(products => {
            if(req.isAuthenticated() === false){
                res.render('products.ejs', {
                    prod: products, isSeller: false, user_id: null, isAdmin: false});
            }else{
                res.render('products.ejs', {
                    prod: products, isSeller: isSeller, user_id: req.user.id, isAdmin: isAdmin});
            }
        });
    });

    app.get('/delete-user', authenticationMiddleware(), role(),(req, res, next) => {
        Role.findOne({where: {userId: req.user.id}}).then(role => {
            if(isAdmin){
                Role.findOne({where: {userId: req.query.id}}).then(rol => {
                    if(rol.role !== 3) User.destroy({where: {id: req.query.id}}).then( () => res.redirect('myaccount'));
                    else{
                        res.redirect('/logout');
                    }
                });
            }else{
                res.redirect('/logout');
            }
        })
    });

    app.get('/categories', (req, res, next) => {
        var catg = [];
        Category.findAll({
            attributes: ['id','name']
        }).then(categories => {
            for(let i = 0; i < categories.length; i++){
                catg[i] = [];
                catg[i][0] = categories[i].name;
                categories[i].getSubcategories()
                    .then(subcategories => 
                        subcategories.forEach(subctg => catg[i].push(subctg.name)))
                        .then(final => {
                            if(i === categories.length - 1){
                                res.send(catg);
                            }});
            }
        }).catch(err  => {
            console.log(err);
            res.redirect('/');
        });
    });


    app.post('/add-product', authenticationMiddleware(), role(), upload.single('image'), (req, res, next) => {
        if(isSeller){
            var file = req.file;
            Request.create({
                type: "ADD",
                description: JSON.stringify({
                    stock: req.body.stock,
                    subcategory: req.body.subcategory,
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    discount: req.body.discount,
                    image: file.fieldname + "_" + Date.now().toString().slice(0, -3) + "_" + file.originalname
                }),
                userId: req.user.id
            }).then( () => res.redirect('/manage-products'));
        }else{
            if(isAdmin){console.log("AICIiiiiii-------------------");
                Request.findOne({where: {id: req.query.id}}).then(request => {
                    Subcategory.findOne({where: {name: req.body.subcategory}}).then(subc => {
                        console.log("AICI-------------------");
                        Product.create({
                            stock: req.body.stock,
                            name: req.body.title,
                            description: req.body.description,
                            image: req.body.image,
                            price: req.body.price,
                            discount: req.body.discount,
                            subcategoryId: subc.id,
                            userId: request.userId
                        }).then(() => res.redirect('back'));
                    });
                });
            }else{
                res.redirect('/logout');
            }
        }
    });

    app.get("/basket/minus", authenticationMiddleware(), (req, res, next) => {
        Basket.findOne({where: {productId: req.query.id, userId: req.user.id, }}).then(prod => {
            if(prod.quantity > 1)
                Basket.update(values = {quantity: prod.quantity - 1}, options = {where: {productId: req.query.id, userId: req.user.id, }}).then(res.redirect('/basket'));
            else{
                res.redirect(`/basket/delete?id=${req.query.id}`);
            }
        });
    });

    app.post("/edit", authenticationMiddleware(), role(),(req, res, next) => {
        if(isAdmin){
            Product.update(
                values = {
                    name: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    discount: req.body.discount,
                    stock: req.body.stock
                }, 
                options = {
                    where: {
                        id: req.body.id
                    }
                }).then(() => {
                    res.redirect(`back`)});
        }else{ 
            if(isSeller){
                Request.create({
                    type: 'EDIT',
                    userId: req.user.id,
                    description: JSON.stringify(req.body)
                }).then(() => res.redirect('back'));
            }else{
                res.redirect('/logout');
            }
        }
    });

    app.get('/delete', authenticationMiddleware(), role(),(req, res, next) => {
        if(isAdmin){
            Product.destroy({where: {
                id: req.query.id
            }}).then(() => res.redirect('/'));
        }else{
            if(isSeller){
                Request.create({
                    userId: req.user.id,
                    type: 'DELETE',
                    description: JSON.stringify({id:req.query.id})
                }).then(() => res.redirect('back'));
            }else{
                res.redirect('/logout');
            }
        }
    });

    app.get('/delete-review', authenticationMiddleware(), role(),(req, res, next) => {
            if(isAdmin) {
                Review.destroy({where:{id: req.query.id}});
                res.redirect('back');
            }else{ 
                res.redirect('/logout');
            }
    });

    app.get('/add-category', authenticationMiddleware(), role(),(req, res, next) => {
        if(isAdmin){
            Category.create({
                name: req.query.category
            }).then(() => res.redirect('/myaccount'));
        }else{
            res.redirect('/logout');
        }
    });

    app.get('/add-subcategory', authenticationMiddleware(), role(),(req, res, next) => {
        if(isAdmin){
            Category.findOne({
                where: {name: req.query.category}
            }).then(category => {
                Subcategory.create({
                    name: req.query.subcategory,
                    categoryId: category.id
                }).then(() => res.redirect('/myaccount'));
            });
        }else{
            res.redirect('/logout');
        }
    });

    // get product page
    app.get('/product', role(), (req, res, next) => {
        Product.findOne({include: [{model: User, as: 'user'}], where:{id: req.query.id}}).then(product => {
            Review.findAndCountAll({order: [['createdAt', 'DESC']], include: [{model: User, as: "user"}], where: {productId: product.id}}).
            then(reviews => {
                let rating = 0;
                reviews.rows.forEach(review => rating += review.rating);
                if(reviews.count > 0){
                    Product.update(values = {rating: rating / reviews.count}, options = {where: {id: product.id}}).
                    then(() => {
                        if(req.isAuthenticated() === false){
                            res.render('product.ejs', {seller: false, isAdmin: false, prod: product, reviews: reviews.rows});
                        }else{
                            res.render('product.ejs', {seller: (isSeller && product.userId === req.user.id) ? true : false, isAdmin: isAdmin, prod: product, reviews: reviews.rows})
                        }
                    });
                }else{
                    Product.update(values = {rating: 0}, options = {where: {id: product.id}}).
                    then(() => {
                        if(req.isAuthenticated() === false){
                            res.render('product.ejs', {seller: false, isAdmin: false, prod: product, reviews: reviews.rows});
                        }else{ 
                            res.render('product.ejs', {seller: (isSeller && product.userId === req.user.id) ? true : false, isAdmin: isAdmin, prod: product, reviews: reviews.rows});
                        }
                    });
                }
            });
        }).catch(err  => {
            console.log(err);
            // res.redirect('/');
        });
    });

    // add review to product
    app.get('/addreview', authenticationMiddleware(), (req, res, next) => {
        Review.sync({force: false}).then(() => {
            var owner = 0;
            Product.findOne({where:{id: req.query.product}}).then(prod => {
                Order.findOne({where: {userId: req.user.id, productName: prod.name}}).then( order => {
                    if(order !== null) owner = 1;
                }).then( () => {
                    return Review.create({
                        content: req.query.content,
                        userId: req.user.id,
                        productId: req.query.product,
                        rating: req.query.rating,
                        owner: owner
                    });
                }).then( () => res.redirect(`/product?id=${req.query.product}`)).catch(err  => {
                    console.log(err);
                    res.redirect('/');
                });
             });
        });
    });

    app.post('/edit-roles', authenticationMiddleware(), role(),(req, res, next) => {
        if(isAdmin){
            for(let i = 0; i < Object.keys(req.body).length; i++){
                Role.update(values = {
                    role: Object.values(req.body)[i]
                }, options = {
                    where: {
                        userId: Number(Object.keys(req.body)[i])
                    }
                }).then( () => {
                    if(i === Object.keys(req.body).length - 1) res.redirect('/myaccount');
                });
            }
        }else{
            res.redirect('/logout');
        }
    });

    app.get('/myaccount', authenticationMiddleware(), role(),(req, res, next) => {
        Order.findAll({order: [['createdAt', 'DESC']], include: [{model: Address, as: "address"}], where: {userId: req.user.id}}).then(orders => 
            Address.findAll({where: {userId: req.user.id}}).then(addresses => {
                if(isAdmin) {
                    Role.findAll({include: [{model: User, as: 'user'}]}).then(roles => {
                        Request.findAll({include:[{model: User, as: 'user'}], where: {stage: "pending"}}).then(requests => {
                            res.render('profile.ejs', {user: req.user, orders: orders, addresses: addresses, isSeller: isSeller, isAdmin: isAdmin,roles: roles, requests: requests});
                        });
                    });
                }else{
                res.render('profile.ejs', {user: req.user, orders: orders, addresses: addresses, isSeller: isSeller, isAdmin: isAdmin,
                users: [], requests: []})}}));
    });

    app.post('/update-profile', authenticationMiddleware(), (req, res, next) => {
        var seller = (req.body.seller === "on") ? 2 : 1;
        User.update(values = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
        },
        options = {
            where:{
                id: req.user.id
            }
        }).then(() => {
            if(seller === 1){
                Role.update(
                    values = {
                        role: 1
                    }, 
                    options = {
                        where:{
                            userId: req.user.id
                        }
                });
            }else{
                Request.create({
                    userId: req.user.id,
                    type: "ROLE UPGRADE",
                    description: JSON.stringify({
                        [req.user.id]: 2 
                    }),
                });
            }
            Object.keys(req.body).forEach( key => {
                if(key.indexOf("newaddress") !== -1 && req.body[key].trim() !== ""){
                    Address.create({
                        content: req.body[key],
                        userId: req.user.id
                    });
                }else{
                    if(key.indexOf("address") !== -1) {
                        let id = Number(key.split("_")[1]);
                        Address.update(
                            values = {
                                content: req.body[key]
                            },
                            options = {
                                where:{
                                    id: id
                                }
                            });
                    }
                }
            })
        }).then( () => res.redirect('/myaccount'));
    });

    app.get('/basket', authenticationMiddleware(), (req, res, next) => {
        Address.findAll({where: {userId: req.user.id}}).then(ads => {
            Basket.findAll({include: [{model: Product, as: 'product'}], where: {userId: req.user.id}}).then(products => res.render('cart.ejs', {user: req.user, products: products, addresses: ads})).catch(err  => {
                console.log(err);
                res.redirect('/');
            });
        });
    });

    app.get('/basket/add', authenticationMiddleware(), (req, res, next) => {
        // add to quantity if product is already in basket.
        Basket.findOne({include: [{model: Product, as: "product"}], where: {productId: req.query.id, userId: req.user.id}}).then(prod => {
            if(prod === null){
                Basket.create({
                    productId: req.query.id,
                    userId: req.user.id,
                });
            }else{
                if(prod.product.stock > 0 && (prod.quantity + 1 ) <= prod.product.stock){
                    Basket.update(values = {quantity: prod.quantity + 1}, options = {where: {productId: req.query.id, userId: req.user.id}})
                }
            }
        }).then(() => res.redirect('back')).catch(err  => {
            console.log(err);
            res.redirect('/');
        });
    });

    app.get('/basket/delete', authenticationMiddleware(), (req, res, next) => {
        Basket.findOne({where: {productId: req.query.id, userId: req.user.id}}).then(prod => prod.destroy()).
        then(() => res.redirect('/basket')).catch(err  => {
            console.log(err);
            res.redirect('/');
        });
    });

    app.get('/', (req, res) => {
        Product.findAll({where: {
            discount: {[Op.gt]: 0},
            stock: {[Op.gt]: 0}
            },
            order: [['discount', 'DESC']]
        }).then(products => {
            Product.findAll({
                where:{
                    stock: {[Op.between]: [1, 14],} 
                }
            }).then(prodLeft => res.render('index.ejs', {
                prod: products, prodLeft: prodLeft
                }));
            
        }).catch(err  => {
            console.log(err);
            res.redirect('/');
        });
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs', { message: req.flash('loginMessage')});
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', { message: req.flash('signupMessage')});
    });

    app.get('/signup-seller', (req, res) => {
        res.render('signupSeller.ejs', { message: req.flash('signupMessage')});
    });


    // SIGNUP
    app.post('/signUp', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true // allow flash messages
        }));

    app.post('/signup-seller', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup-seller',
        failureFlash: true // allow flash messages
        }));

    // MANAGE PRODUCTS SELLER
    app.get('/manage-products', authenticationMiddleware(), role(),(req, res) => {
        User.findOne({where: {id: req.user.id}}).then(user => {
            if(user === null) res.render('404.ejs');
            else{
                if(isSeller){
                    Product.findAll({where: {userId: req.query.id}}).then(products => {
                        Request.findAll({where: {userId: user.id, type: {[Op.notLike]: "ROLE UPGRADE"}}}).then(requests =>  
                            res.render('seller.ejs', {user: req.user, products: products, requests: requests}));     
                    });
                }else{
                    res.redirect('/login');
                }
            }
        });
    });

    app.get('/request', role() ,(req, res, next) => {
        if(isAdmin) Request.update(values = {stage: req.query.result}, options = {where: {id: req.query.id}})
        .then(() => res.redirect('back'));
    });

    // ADD DB
    // app.get('/add', (req, res) => {

    // });

    //LOGIN
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', 
        failureRedirect : '/login', 
        failureFlash : true // allow flash messages
    }));

    // LOGOUT
    app.get('/logout',(req, res, next) => {
        req.logOut();
        req.session.destroy();
        res.redirect('/login');
    });

    // 404
    app.get("*", function(req,res){
        res.render('404.ejs');
      });

}