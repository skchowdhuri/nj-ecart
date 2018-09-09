const express=require('express');
const router=express.Router();
//Get page Model
const {pageModel}=require('../models/pages')
router.get('/', (req, res)=>{
    pageModel.find({}).sort({sorting: 1}).exec((err, pages)=>{
        res.render('admin/pages',{pages});
    });
});

//GET Admin pages add
router.get('/add', (req, res)=>{
    res.render('admin/add_page',{
        title: 'Home'
    })
});

//GET Admin pages delete
router.get('/delete/:id', (req, res)=>{
    pageModel.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res,false('denger', 'There is a problem');
            return console.log('Error deleted time');
        }
        req.flash('success', 'Successfully deleted');
        res.redirect('/admin/pages');
    });
});

//Get Admin pages edit
router.get('/edit/:slug', (req, res)=>{
    pageModel.findOne({slug: req.params.slug}, (err, page)=>{
        if(err){
            console.log('There is an errors at edit page');
        }
        console.log(page);
        res.render('admin/edit_page',{
            title: page.title,
            slug: page.slug,
            id: page._id,
            content: page.content
        })
    })
})

//POST Admin pages add
router.post('/add', (req, res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must be there').notEmpty();   
    var title=req.body.title;
    var slug=req.body.slug.replace('/\s/g','-').toLowerCase();
    if(slug=="") slug=title.replace('/\s/g','-').toLowerCase();
    var content=req.body.content;
    var errors=req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('admin/add_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
        
    }
    else{
        pageModel.findOne(slug, (err, result)=>{
            if(result){
                req.flash('danger', 'Page Slug exist. Please use another one');
                res.render('admin/add_page',{
                    title,
                    slug,
                    content
                });
            }
            else{
                var page=new pageModel({
                    title:title,
                    slug:slug,
                    content:content,
                    sorting: 0
                });
                page.save((err)=>{
                    console.log(err);
                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });
            }

        })
    }
});
//POST Admin pages edit
router.post('/edit/:slug', (req, res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must be there').notEmpty();   
    var title=req.body.title;
    var slug=req.body.slug.replace('/\s/g','-').toLowerCase();
    if(slug=="") slug=title.replace('/\s/g','-').toLowerCase();
    var content=req.body.content;
    var id=req.body.id;
    var errors=req.validationErrors();
    if(errors){
        console.log(errors);
        res.render('admin/edit_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
        
    }
    else{
        pageModel.findOne({slug: slug, _id: {'$ne': id} }, (err, result)=>{
            if(result){
                req.flash('danger', 'Page Slug exist. Please use another one');
                res.render('admin/add_page',{
                    title,
                    slug,
                    content
                });
            }
            else{
                pageModel.findById(id, (err, page)=>{
                    if(err) return console.log(err);
                    page.title=title;
                    page.slug=slug;
                    page.content=content;
                    page.save((err)=>{
                        req.flash('success', 'Page edited!');
                        res.redirect('/admin/pages');
                    });
                });
               
            }

        })
    }
});

module.exports=router;