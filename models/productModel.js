import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {type : String,required:true,trim : true,maxLength:[100,"Product name cannot exceed 100 characters"]},
    price: {type : String,required:true},
    smallDescription: {type : String,required:true},
    description: {type : String,required:true},
    rating: {type : String,default:0},
    images: [{
        image: {
            type : String,
            required:true
        }
    }],
    category: {
        type : String,
        required:[true,'Please enter a category'],
        enum:{
            values:[
                'Medical accesories',
                'Tablets',
                'Tonics',
                'Medical food',
                'Ayurvedha',
                'Supplements',
                'Beauty'
            ],
            message : "please select category"
        }
    },
    seller: {type : String,required: true},
    stock: {type : Number,required: true,maxLength : [20,"Product stock cannot exceed 20"]},
    numOfReviews: {type : Number,default:0},
    reviews: [{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name :{type:String,required:true} ,
        rating :{type:String,required:true},
        comment :{type:String,required:true} 
    }],
    user:{type:mongoose.Schema.Types.ObjectId},
    createdAt: {type : Date,default:Date.now},
})

const Product = mongoose.model("Product",productSchema);

export default Product;