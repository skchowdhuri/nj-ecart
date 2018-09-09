const express=require('express');
const router=express.Router();
//Get category Model
const {categoryModel}=require('../models/categories');
router.get('/', (req, res)=>{
    categoryModel.find({}).exec((err, categories)=>{
        if(err) return console.log(err);
        res.render('admin/categories',{categories});
    });
});

//GET Admin category add
router.get('/add', (req, res)=>{
    res.render('admin/add_category',{
        title: 'Home'
    })
});

//GET Admin pages delete
router.get('/delete/:id', (req, res)=>{
    categoryModel.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res,false('denger', 'There is a problem');
            return console.log('Error deleted time');
        }
        req.flash('success', 'Successfully deleted');
        res.redirect('/admin/categories');
    });
});

//Get Admin category edit
router.get('/edit/:slug', (req, res)=>{
    categoryModel.findOne({slug: req.params.slug}, (err, category)=>{
        if(err){
            console.log('There is an errors at edit category');
        }
        res.render('admin/edit_category',{
            title: category.title,
            slug: category.slug,
            id: category._id
        })
    })
})

//POST Admin category add
router.post('/add', (req, res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();
    var title=req.body.title;
    var slug=req.body.slug.replace('/\s/g','-').toLowerCase();
    if(slug=="") slug=title.replace('/\s/g','-').toLowerCase();
    var errors=req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('admin/add_category',{
            errors: errors,
            title: title,
            slug: slug
        })
        
    }
    else{
        categoryModel.findOne({slug: slug}, (err, result)=>{
            if(result){
                req.flash('danger', 'Category Slug exist. Please use another one');
                res.render('admin/add_category',{
                    title,
                    slug
                });
            }
            else{
                console.log(result);
                var category=new categoryModel({
                    title:title,
                    slug:slug
                });
                category.save((err)=>{
                    console.log(err);
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }

        })
    }
});
//POST Admin category edit
router.post('/edit/:slug', (req, res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();
    var title=req.body.title;
    var slug=req.body.slug.replace('/\s/g','-').toLowerCase();
    if(slug=="") slug=title.replace('/\s/g','-').toLowerCase();
    var id=req.body.id;
    var errors=req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('admin/edit_category',{
            errors: errors,
            title: title,
            slug: slug
        })
        
    }
    else{
        categoryModel.findOne({slug: slug, _id: {'$ne': id} }, (err, result)=>{
            if(result){
                req.flash('danger', 'Category Slug exist. Please use another one');
                res.render('admin/add_category',{
                    title,
                    slug
                });
            }
            else{
                categoryModel.findById(id, (err, category)=>{
                    if(err) return console.log(err);
                    category.title=title;
                    category.slug=slug;
                    category.save((err)=>{
                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/categories');
                    });
                });
               
            }

        })
    }
});

module.exports=router;