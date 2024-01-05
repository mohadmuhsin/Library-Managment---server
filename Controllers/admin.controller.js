const Admin = require("../models/admin.model");
const Books = require("../models/books.model");
const Record = require("../models/record.model");
const { uploadToCloudinaryImage, removeFromCloudinary } = require("../utils/cloudinary");
const { GlobalSchema, Validate } = require('../validations/joi.validation')

const SchemaElements = GlobalSchema();
const adminController = {
    async addBooks(req, res) {
        try {
            console.log(req.params);
            const { name, image, cost, count, } = req.body;
            // const image = req.file;
            const { _id } = req.admin;
            const bookData = {
                name: name,
                image: image,
                cost: cost,
                count: count
            }
            const validate = Validate({
                name: SchemaElements.name,
                image: SchemaElements.path,
                cost: SchemaElements.cost,
                count: SchemaElements.count
            }, bookData
            )

            if (!validate.status)
                return res.status(400).json({ message: validate.response[0].message });

            const exist = await Books.findOne({ name: name })
            if (exist)
                return res.status(400).json({ message: "A book with this name already exist" });
            const imageData = await uploadToCloudinaryImage(image, "Books");
            console.log(image, "file updload");
            const book = new Books({
                name: name,
                cost: cost,
                count: count,
                image: imageData,
                owner: _id
            })
            await book.save()
                .then((response) => {
                    console.log(response)
                    return res.status(200).json({ message: "Book added successfully" })
                })
                .catch((err) => {
                    console.log(err);
                })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },

    async editBooks(req, res) {
        try {
            const { name, imagePath, cost, count , id} = req.body;
            const { _id } = req.admin;

            let bookData = {
                ...(imagePath && { imagePath }),
                ...(cost && { cost }),
                ...(name && { name }),
                ...(count && { count }),
            }

            const validate = Validate({
                ...(imagePath && { imagePath: SchemaElements.path }),
                ...(cost && { cost: SchemaElements.cost }),
                ...(name && { name: SchemaElements.name }),
                ...(count && { count: SchemaElements.count }),
            },
                bookData
            )
            if (!validate.status) return res.status(400).json({ message: validating.response[0].message })
            let book;
            let image = {
                url: "",
                public_id: ""
            }
            
            book = await Books.findOne({ _id:id })
            console.log(book, "bok data", req.body);
            if (imagePath) {

                if (!book)
                    return res.status(404).json({ message: "Book not found" })
                await removeFromCloudinary(book?.image?.public_id).
                    then(() => {
                        console.log("image deleted successfully");
                    }).catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                            message: "Image deletion failed",
                        });
                    });

                await uploadToCloudinaryImage(imagePath, "Books")
                    .then((response) => {
                        image.url = response.url
                        image.public_id = response.public_id
                        console.log("image uploaded successfully");
                    }).catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                            message: "Image deletion failed",
                        });
                    });
            }

            const updationData = {
                ...(name && { name }),
                ...(image && { image }),
                ...(count && { count }),
                ...(cost && { cost }),
            };

            if (updationData && Object.keys(updationData).length > 0) {
                const updatedBook = await Books.findByIdAndUpdate(
                    { _id: book._id },
                    updationData,
                    {
                        new: true,
                    }
                )
                return res.status(200).json({
                    message: "Book data updated",
                    data: updatedBook,
                });
            } else {
                return res.status(400).json({
                    message: "Invalid update data",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async getBooks(req, res) {
        try {
            const {_id} = req.admin;

            const books = await Books.find({ owner: _id })
            if (!books)
                return res.status(404).json({ message: "You don't have any books in this libaray!!" });
            return res.status(200).json({ message: "Your books in our library", books });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async getBookRecordDetails(req, res) {
        try {
            const { id } = req.params;
            const bookData = await Record.find({ book: id }).populate("borrower")

            if (!bookData)
                return res.status(404).json({ message: "There is no borrower" });
            return res.status(200).json({ message: "Borrowed user list", bookData });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async getBookData(req,res){
        try {
            const { id } = req.params;
            const bookData = await Books.findOne({ _id: id })

            if (!bookData)
                return res.status(404).json({ message: "There is no borrower" });
            return res.status(200).json({ message: "Borrowed user list", bookData });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })  
        }
    },

    async getUserData(req,res){
        try {
            const data = req.admin
            if(!data)
                return res.status(404).json({message:"please try again"})
            return res.status(200).json(data)
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" }) 
        }
    },

    async editProfile(req, res) {
        try {
            const {  username, image, } = req.body;
            const {_id } = req.admin;
            const profileData = {
                ...(username && { username }),
                ...(image && { image })
            }
            const validate = Validate({
                ...(username && { username: SchemaElements.username }),
                ...(image && { image: SchemaElements.path }),
            }, profileData
            )

            if (!validate.status) return res.status(400).json({ message: validate.response[0].message })

            const admin = await Admin.findOne({ _id: _id })
            let profile = {
                url: admin?.profile?.url,
                public_id: admin?.profile?.public_id
            }
            if (image) {
                await removeFromCloudinary(admin?.profile?.public_id).
                    then(() => {
                        console.log("image deleted successfully");
                    }).catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                            message: "Image deletion failed",
                        });
                    });

                await uploadToCloudinaryImage(image, "Books")
                    .then((response) => {
                        profile.url = response.url
                        profile.public_id = response.public_id
                        console.log("image uploaded successfully");
                    }).catch((err) => {
                        console.log(err);
                        return res.status(400).json({
                            message: "Image deletion failed",
                        });
                    });
            }
            const updationData = {
                ...(username && { username }),
                ...(profile && { profile }),
            };

            if (updationData && Object.keys(updationData).length > 0) {
                const updatedBook = await Admin.findByIdAndUpdate(
                    { _id: admin._id },
                    updationData,
                    {
                        new: true,
                    }
                )
                return res.status(200).json({
                    message: "Profile updated successfully",
                    data: updatedBook
                });
            } else {
                return res.status(400).json({
                    message: "Invalid update data",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async logout(req, res) {
        try {
            let data =  req.admin;
            res.cookie("adJwt", "", { maxAge: 0 });
            res.cookie("adReTkn", "", { maxAge: 0 });
            res.status(200).json({ message: "Thanks for visiting our library, Hope you will back", data });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
}


module.exports = adminController;