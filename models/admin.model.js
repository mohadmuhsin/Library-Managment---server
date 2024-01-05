const mongoose = require("mongoose");

const  adminSchema  = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    profile:{
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
    }
});


const Admin = mongoose.model("admin",adminSchema);
module.exports = Admin;