const mongoose=require('mongoose');

var pageSchema=mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sorting: {
        type: Number
    },
});

var pageModel=mongoose.model('pages',pageSchema);

module.exports={
    pageModel,
    
}