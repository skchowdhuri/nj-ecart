const mongoose=require('mongoose');

var categorySchema=mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    }
});

var categoryModel=mongoose.model('categories',categorySchema);

module.exports={
    categoryModel,
}