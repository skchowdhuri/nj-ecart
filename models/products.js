const mongoose=require('mongoose');

var productSchema=mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    }

});

var productModel=mongoose.model('products',productSchema);

module.exports={
    productModel,
    
}