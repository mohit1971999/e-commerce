var fs = require("fs");
var express = require("express");
var path = require("path");
var body_parser = require("body-parser");
var session = require("express-session");
var mongodb = require('mongodb');
//var mongoose = require('mongoose');
var ejs = require("ejs");
const app = express();

var url = 'mongodb://localhost:27017';

var multer = require('multer');

var multer_storage_config = multer.diskStorage({
	destination: function(request, file, callback){
        var x = path.join(__dirname, 'public', 'user_uploads');
        callback(null, x);
    },
	filename: function(request, file, callback){
        var ext = file.mimetype.slice(file.mimetype.indexOf('/')+1, file.mimetype.length);
        var y = Date.now() + '.' + ext;
		callback(null, y);
	},
});
var uploader = multer({storage:multer_storage_config});

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(body_parser.json());
app.use(session({
    genid: function(request){
        return(request.body.email);
    },
    secret:"You won't know it",
    resave:false,
    saveUninitialized:true,
}));

app.get("/", function(request, response){
    response.render('index');
});

app.get('/admin', function(request, response){
    response.render('admin');
});

app.get("/home.ejs", function(request, res){
    if(request.session.id === undefined){
        res.redirect("/");
    }
    else{
        mongodb.connect(url, (error, db)=>{
            if(error)
                throw error;
            var selected_db = db.db("cq_ecommerce");
            selected_db.collection('products').find({}, {projection:{_id:0, pdquant:0, pddesc:0}}).toArray((find_error, response) => {
                if (find_error)
                    throw find_error;
                let data;
                db.close();
                if (response === null) {
                    data = {};
                }
                else {
                    data = response;
                }
                res.render('home', {
                    products: data,
                });
            });
        });
    }
});

app.get("/cart.ejs", function(request, response){
    if(request.session.id === undefined){
        response.redirect("/");
    }
    else{
        mongodb.connect(url, (error, db)=>{
            if(error)
                throw error;
            var selected_db = db.db('cq_ecommerce');
            selected_db.collection("users").findOne({email:request.session.id}, {projection:{_id:0, cart:1}}, (find_error, find_res)=>{
                if(find_error)
                    throw find_error;
                db.close();
                var data = find_res.cart;
                response.render("cart", {
                    products:data,
                });
            });
        });
    }
});

app.get("/name", function(req, response){
    mongodb.connect(url, function(err, db){
        if(err)
            throw err;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection('users').findOne({email: req.session.id}, {projection:{name:1, img_add:1}} , function(error, res){
            if(error){
                db.close();
                response.write(JSON.stringify({error: 'User not present. Invalid user.'}));
                response.end();
                throw error;
            }
            db.close();
            response.write(JSON.stringify(res));
            response.end();
        });
    });
});

/*app.get("/prod", function(req, res){
    mongodb.connect(url, (error, db)=>{
        if(error)
            throw error;
        let selected_db = db.db('cq_ecommerce');
        selected_db.collection('products').findOne({pd_id:req.body.id}, (find_error, find_res)=>{
            if(find_error)
                throw find_error;
            let data = find_res;
            res.send(JSON.stringify(data));
            res.end();
        });
    });
});*/

app.post("/desc", function(request, response){
    mongodb.connect(url, (error, db)=>{
        if(error)
            throw error;
        let selected_db = db.db('cq_ecommerce');
        selected_db.collection('products').findOne({pd_id:request.body.id}, {projection: {img_add:1, pddesc:1}}, (find_error, find_res)=>{
            if(find_error)
                throw find_error;
            db.close();
            response.send(JSON.stringify(find_res));
            response.end();
        });
    });
});

app.get("/crudproducts", function(request, res){
    if(request.session.id !== undefined){
        mongodb.connect(url, (error, db)=>{
            if(error)
                throw error;
            var selected_db = db.db('cq_ecommerce');
            selected_db.collection('products').find({}, (find_error, response)=>{
                if(find_error)
                    throw find_error;
                db.close();
                let data = {};
                if(response !== null)
                    data = response;
                res.render("products", {
                    products:data,
                });
            });
        });
    }
    else{
        res.redirect("/");
    }
});

app.get("/cart", function(request, response){
    mongodb.connect(url, (error, db)=>{
        if(error)
            throw error;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection("users").findOne({email:request.session.id}, {projection:{cart:1}}, (find_error, find_res)=>{
            if(find_error)
                throw find_error;
            db.close();
            response.write(JSON.stringify(find_res));
            response.end();
        });
    });
});

app.post("/login", function(req, res){
    mongodb.connect(url, function(err, db){
        if(err)
            throw err;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection('users').findOne({email: req.body.email}, function(error, response){
            if(error)
                throw error;
            if(response === null){
                res.write(JSON.stringify({result:"No such email id exists. Please enter valid email id or Sign up with us.", continue:false}));
                res.end();
                db.close();
            }
            else{
                if(req.body.password === response.password){
                    if(response.role === 'admin'){
                        res.write(JSON.stringify({result: "Successfully logged in.", continue: true, user: "/admin"}));
                        res.end();
                    }
                    else{
                        res.write(JSON.stringify({result:"Successfully logged in.", continue: true, user:"/home.ejs"}));
                        res.end();
                    }
                }
                else{
                    res.write(JSON.stringify({result: 'Your password did not match. Please enter correct password.', continue: false}));
                    res.end();
                }
                db.close();
            }
        });
    });
});

app.post("/signup", uploader.single('avatar'), function(req, res){
    mongodb.connect(url, function(err, db){
        if(err)
            throw err;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection('users').findOne({email: req.body.email}, function(error, response){
            if(error)
                throw error;
            if(response === null){
                var user_detail = {
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    img_add: 'user_uploads' + "/" + req.file.filename,
                    role: 'customer',
                    cart:[],
                };
                selected_db.collection('users').insertOne(user_detail, function(insert_error){
                    if(insert_error)
                        throw insert_error;
                    res.write(JSON.stringify({result:"Account created successfully.", continue:true}));
                    res.end();
                    db.close();
                });
            }
            else{
                res.write(JSON.stringify({result:"This account already exists", continue:false}));
                res.end();
                db.close();
            }
        });
    });
});

app.post("/increase", function(request, response){
    CartChange(request, response);
});

function CartChange(request, response){
    mongodb.connect(url, function(error, db){
        if(error)
            throw error;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection('users').findOne({email: request.session.id},{projection:{_id:0, cart:1}}, function(err, res){
            if(err)
                throw err;
            let cart = res.cart;
            let i;
            for(i = 0; i<cart.length;i++){
                if(cart[i].pd_id === request.body.id){
                    break;
                }
            }
            cart[i].pdquant = request.body.quantity;
            var updated_data = {$set:{cart:cart}}
            selected_db.collection('users').updateOne({email:request.session.id}, updated_data, (update_error)=>{
                if(update_error)
                    throw update_error;
                response.write(JSON.stringify({result:"Updated successfully."}));
                response.end();
                db.close();
            });
        });
    });
}

app.post("/decrease", function(request, response){
    CartChange(request, response);
});

app.post("/delete", function(request, response){
    mongodb.connect(url, function(error, db){
        if(error)
            throw error;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection('users').findOne({email: request.session.id},{projection:{cart:1, _id:0}}, function(err, res){
            if(err)
                throw err;
            let cart = res.cart;
            let i;
            for(i = 0; i<cart.length;i++){
                if(cart[i].pd_id === request.body.id){
                    break;
                }
            }
            cart.splice(i, 1);
            var updated_data = {$set:{cart:cart}}
            selected_db.collection('users').updateOne({email:request.session.id}, updated_data, (update_error)=>{
                if(update_error)
                    throw update_error;
                response.write(JSON.stringify({result:"Updated successfully."}));
                response.end();
                db.close();
            });
        });
    });
});

app.post("/cart", function(request, response){
    mongodb.connect(url, (error, db)=>{
        if(error)
            throw error;
        var selected_db = db.db('cq_ecommerce');
        selected_db.collection("products").findOne({pd_id:request.body.pid}, {projection:{_id:0}}, (find_error, find_res)=>{
            if(find_error)
                throw find_error;
            var data = find_res;
            data["pdquant"] = 1;
            selected_db.collection("users").findOne({email:request.session.id}, {projection:{_id:0, cart:1}}, (user_find_error, user_found)=>{
                if(user_find_error)
                    throw user_find_error;
                let cart = user_found.cart;
                let present = false;
                for(let i=0;i<cart.length;i++){
                    if(cart[i].pd_id === request.body.pid){
                        present = true;
                        break;
                    }
                }
                if(!present){
                    cart.push(data);
                    let updated = {$set: {cart:cart}};
                    selected_db.collection("users").updateOne({email:request.session.id}, updated, (update_error)=>{
                        if(update_error)
                            throw update_error;
                    });
                }
                response.end();
                db.close();
            });
        });
    });
});

var multer_storage_config2 = multer.diskStorage({
	destination: function(request, file, callback){
        var x = path.join(__dirname, 'public', 'product_images');
        callback(null, x);
    },
	filename: function(request, file, callback){
        var ext = file.mimetype.slice(file.mimetype.indexOf('/')+1, file.mimetype.length);
        var y = Date.now() + '.' + ext;
		callback(null, y);
	},
});
var uploader2 = multer({storage:multer_storage_config2});

app.post("/addproduct", uploader2.single("pdimage"), function(request, response){
    var id = request.session.id;
    mongodb.connect(url, (err, db)=>{
        if(err)
            throw err;
        var selected_db = db.db('cq_ecommerce');
        let data = request.body;
        data["img_add"] = 'product_images' + "/" + request.file.filename;
        selected_db.collection('products').insertOne(data, (error)=>{
            if(error){
                fs.unlink(path.join(__dirname, 'public', 'product_images', request.file.filename), (deletion_error)=>{
                    if(deletion_error){
                        console.log("File", request.file.filename, "could not be deleted.");
                    }
                });
                response.write(JSON.stringify({result:"Product could not be added. Server error. Please try again after some time."}));
                response.end();
                throw error;
            }
            response.write(JSON.stringify({result:"Product was added successfully."}));
            response.end();
            db.close();
        });
    });
});

app.post("/logout", function(request, response){
    request.session.destroy(function(err){
        if(err)
            throw err;
        response.redirect("/");
        response.end();
    });
});

app.listen(8000);
console.log("Server is running");