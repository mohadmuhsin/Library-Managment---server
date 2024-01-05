const mongoose = require('mongoose')
const booksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
    },
    count: {
        type: Number,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
    }
    
})
booksSchema.set("validateBeforeSave", false);

const Books = mongoose.model('books', booksSchema)
module.exports = Books;