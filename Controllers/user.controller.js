const User = require("../models/user.model");
const Books = require("../models/books.model");

const { uploadToCloudinaryImage, removeFromCloudinary } = require("../utils/cloudinary");
const { GlobalSchema, Validate } = require('../validations/joi.validation');
const Record = require("../models/record.model");
const SchemaElements = GlobalSchema()

const userController = {
    async editProfile(req, res) {
        try {
            const {  username, image, } = req.body || {}
            const {_id } = req.user || {}
            const {url, public_id} = req.user.profile || {}
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


             profile = {
                url: url,
                public_id: public_id
            }
            if (image) {
                await removeFromCloudinary(public_id).
                    then(() => {
                        console.log("image deleted successfully");
                    }).catch((err) => {
                        console.log(err);
                        // return res.status(400).json({
                        //     message: "Image deletion failed",
                        // });
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
            console.log(updationData,"puthisyasirt");
            if (updationData && Object.keys(updationData).length > 0) {
                const updatedBook = await User.findByIdAndUpdate(
                    { _id: _id },
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
    async getBooks(req, res) {
        try {
            const { _id } = req.user;
            const books = await Books.find()
            if (!books)
                return res.status(404).json({ message: "No books found!!" })

            let record = await Record.find({ borrower: _id })
            return res.status(200).json({ message: "Available books", books, record })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async getBorrwoedBooks(req, res) {
        try {
            const { _id } = req.user;
            const books = await Record.find({ borrower: _id, isBorrowed: true, isReturned: false }).populate("book")
            console.log(books);
            if (!books)
                return res.status(404).json({ message: "No books in your record" })
            return res.status(200).json({ message: "Borrowed books", books })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },

    async borrow(req, res) {
        try {
            const { book_id } = req.params;
            const { _id, countofBooks } = req.user;
            console.log(req.params);

            const book = await Books.findOne({ _id: book_id })
            if (!book)
                return res.status(404).json({ message: "This book is not available in our libaray" });
            let existing = await Record.findOne({ borrower: _id, book: book_id })
            if (existing)
                return res.status(400).json({ message: "You already borrowed this book./ Book is not returned yet." })
            let limit = 5;
            if (countofBooks >= limit)
                return res.status(400).json({ message: "Your book cout exceeded limit" });

            let borrow = new Record({
                book: book._id,
                borrower: _id,
                isBorrowed: true
            })

            await borrow.save()
                .then(async (response) => {
                    console.log(response)
                    await User.findByIdAndUpdate(
                        { _id: _id },
                        { $inc: { countofBooks: 1 } },
                        { new: true }
                    )
                    return res.status(200).json({ message: "Book borrowed successfully" });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(400).json({ message: "Book borrowing failed", err })
                })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },

    async getUserBooks(req, res) {
        try {
            const { _id } = req.user;
            // const { _id } = req.body;
            const booksBorrowed = await Record.find({ borrower: _id })
            if (!booksBorrowed)
                return res.status(404).json({
                    message: "You are not even borrowed any books./ Start reading by our books"
                });

            return res.status(200).json({
                message: `Books which you are borrowed from our library:`,
                booksBorrowed
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async getUserData(req, res) {
        try {
            const data = req.user;
            if (!data)
                return res.status(404).json({ message: "please try again" })
            return res.status(200).json({ message: "You profile data ", data })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },


    async returnBooks(req, res) {
        try {
            const { book_id, } = req.params;
            const { _id } = req.user;
            let borrowed = await Record.findOne({ _id: book_id })
            if (!borrowed)
                return res.status(404).json({ message: "There is no borrowed is in your record" });

            if (borrowed.isReturned === true && borrowed.isBorrowed === true) {
                return res.status(400).json({ message: "You already returned this book" })
            }
            await Record.findByIdAndUpdate(
                { _id: book_id },
                { isReturned: true },
                { new: true }
            ).then(async () => {
                await User.findByIdAndUpdate(
                    { _id: _id },
                    { $inc: { countofBooks: -1 } },
                    { new: true }
                )

                return res.status(200).json({ message: "Book returned successfully" })
            }).catch((err) => {
                console.log(err);
                return res.status(400).json({ message: "Book return failed, please try again" });
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error!!" })
        }
    },
    async logout(req, res) {
        try {

            res.cookie("jwt", "", { maxAge: 0 });
            res.cookie("ReTkn", "", { maxAge: 0 });
            res.status(200).json({ message: "Thanks for visiting our library, Hope you will back" });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal Server Error" })
        }
    },
}


module.exports = userController;