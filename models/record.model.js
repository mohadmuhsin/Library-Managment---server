const mongoose = require('mongoose');
const recordSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    isReturned: {
        type: Boolean,
        required: true,
        default:false

    },
    date:{
        type:Date,
        default: Date.now()
    },
    isBorrowed: {
        type: Boolean,
        required: true,
        default:false
    },
})

recordSchema.set("validateBeforeSave", false);

const Record = mongoose.model('record', recordSchema)
module.exports = Record;