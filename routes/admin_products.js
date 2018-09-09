const express=require('express');
const router=express.Router();
const mkdirp=require('mkdirp');
const fs=require('fs-extra');
const resizeImg=require('resize-img');

//Get product Model
const {productModel}=require('../models/products');
//Get Category Model
var {categoryModel}=require('../models/categories');

router.get('/', (req, res)=>{
    var count;
    productModel.count((err,c)=>{
        count=c;
    });
    productModel.find((err, products)=>{
        res.render('admin/products', {
            products,
            count
        });
    });
});

//GET Admin product add
router.get('/add', (req, res)=>{
    var title="";
    var desc="";
    var price="";
    categoryModel.find((err, categories)=>{
        console.log(categories);
        res.render('admin/add_product',{
            title: title,
            desc: desc,
            price: price,
            categories: categories
        });
    });
});

//GET Admin pages delete
router.get('/delete/:id', (req, res)=>{
    productModel.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res,false('denger', 'There is a problem');
            return console.log('Error deleted time');
        }
        req.flash('success', 'Successfully deleted');
        res.redirect('/admin/products');
    });
});

//Get Admin product edit
router.get('/edit/:id', (req, res)=>{
    var errors;
    if(req.session.errors) errors= req.session.errors;
    req.session.errors=null;
    productModel.findById(req.params.id,(err, p)=>{
        if(err){
            console.log(err);
            res.render('/admin/products');
        }
        else{
            var galleryDir='public/product_images/'+p._id+'/gallery';
            var galleryImages=null;
            fs.readdir(galleryDir,(err, files)=>{
                if(err){
                    console.log(err);
                }
                else{
                    galleryImages=files;
                    categoryModel.find((err, c)=>{
                        console.log(errors);
                        res.render('admin/edit_product',{
                        errors: errors,
                        galleryImages,
                        title: p.title,
                        slug: p.slug,
                        desc: p.desc,
                        price: p.price,
                        category: p.category,
                        categories: c,
                        id: p._id,
                        image: p.image
                        }); 
                    });
                }
                console.log(galleryImages);            })
        }
    })
})

//POST Admin product add
router.post('/add', (req, res)=>{
    var imgFile= typeof req.files.image !=="undefined" ? req.files.image.name: "";
    // console.log("Img",imgFile);
    // console.log(req.files.image);
    // console.log("l]plpl]pl]pl]plpl]lpl",typeof req.files.image)
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Image must be there').isImage(imgFile);
    var title=req.body.title;
    var slug=req.body.title.replace('/\s/g','-').toLowerCase();
    var desc=req.body.desc;
    var price=req.body.price;
    var category=req.body.category;
    var errors=req.validationErrors();
    if(errors){
        categoryModel.find((err, categories)=>{
            console.log(errors);
            res.render('admin/add_product',{
            errors: errors,
            title: title,
            slug: slug,
            desc: desc,
            price: price,
            category: category,
            categories: categories
            })
        });
        
    }
    else{
        productModel.findOne({slug: slug}, (err, result)=>{
            if(result){
                req.flash('danger', 'product Title exist. Please use another one');
                categoryModel.find((err, categories)=>{
                    console.log(errors);
                    res.render('admin/add_product',{
                    errors: errors,
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price,
                    category: category,
                    categories: categories
                    })
                });
            }
            else{
                var price2=parseFloat(price).toFixed(2)
                var product=new productModel({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imgFile
                });
                product.save((err)=>{
                    if(err)
                        return console.log(err);
                    mkdirp('public/product_images/'+product._id, (error)=>{return console.log(err)});
                    mkdirp('public/product_images/'+product._id+'/gallery', (error)=>{return console.log(err)});
                    mkdirp('public/product_images/'+product._id+'/gallery/thumbs', (error)=>{return console.log(err)});
                    if(imgFile){
                        var productImage=req.files.image;
                        var path='public/product_images/'+product._id+'/'+imgFile;
                        productImage.mv(path, (err)=>{
                            return console.log(err);
                        })
                    }
                    
                    req.flash('success', 'product added!');
                    res.redirect('/admin/products');
                });
            }

        })
    }
});
//POST Admin product edit
router.post('/edit/:id', (req, res)=>{
    var imgFile= typeof req.files.image !=="undefined" ? req.files.image.name: "";
    // console.log("Img",imgFile);
    // console.log(req.files.image);
    // console.log("l]plpl]pl]pl]plpl]lpl",typeof req.files.image)
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'Image must be there').isImage(imgFile);
    var title=req.body.title;
    var slug=req.body.title.replace('/\s/g','-').toLowerCase();
    var desc=req.body.desc;
    var price=req.body.price;
    var category=req.body.category;
    //var image=req.body.pmage;
    var id=req.params.id;
    var errors=req.validationErrors();
    if(errors){
        req.session.errors=errors;
        res.redirect('/admin/products/edit/'+id);
    } else{
        productModel.findOne({slug: slug, _id: {'$ne': id}}, (err,  p)=>{
            if(err){
                console.log(err);
            }
            if(p){
                req.flash('danger', 'Product title exist, choose another!');
                res.redirect('/admin/products/edit/'+id);
            }else{
                productModel.findById(id, (err,p)=>{
                    if(err) console.log(err);
                    p.title=title;
                    p.slug=slug;
                    p.desc=desc;
                    p.price=parseFloat(price).toFixed(2);
                    p.category=category;
                    pimage=p.image;
                    console.log(pimage);
                    if(imgFile !=""){
                        p.image=imgFile;
                    }
                    p.save(function(err){
                        if(err){
                            console.log(err);
                        }
                        if(imgFile != ""){
                            if(pimage != ""){
                                fs.remove('public/product_images/'+id+'/'+pimage, (err)=>{
                                    if(err){
                                        console.log(err+"Removed");
                                    }

                                });
                            }
                            var productImage=req.files.image;
                            var path='public/product_images/'+id+'/'+imgFile;
                            productImage.mv(path,(err)=>{
                                if(err) console.log(err);
                            });
                            req.flash('success', 'Product Edited');
                            res.redirect('/admin/products/edit/'+id);
                        }
                    })
                })
            }
        });

    }
});

module.exports=router;