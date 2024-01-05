const { generateAccessToken, generateRefreshToken } = require("../auth/jwt.auth");
const User = require("../models/user.model");
const { GlobalSchema, Validate } = require("../validations/joi.validation")
const SchemaElements = GlobalSchema()
const bcrypt = require('bcrypt');
const Admin = require("../models/admin.model");


const commonController = {

    async register(req, res) {
        try {
            const { email, username, password, role } = req.body;
            const { google } = req.query;
            let userData;
            let validate;
            if (google === "true") {
                userData = {
                    email: email,
                    username: username,
                }
                validate = Validate({
                    email: SchemaElements.email,
                    username: SchemaElements.username,
                },
                    userData
                )
            } else {
                userData = {
                    email: email,
                    username: username,
                    password: password
                }
                validate = Validate({
                    email: SchemaElements.email,
                    username: SchemaElements.username,
                    password: SchemaElements.password
                },
                    userData
                )
            }
            if (!validate.status) {
                console.log("erroro nda");
                return res.status(400).json({ message: validate.response[0].message })
            }

            const matching = await User.findOne({
                username: { $regex: new RegExp(username, 'i') },
            });
            if (matching) {
                return res.status(409).json({ message: "Username Already exist" });
            }

            const exists = await User.findOne({ email: email }).maxTimeMS(30000)
            if (exists)
                return res.status(400).json({ message: "This email is already registered" })

            const existAsAdmin = await Admin.findOne({ email: email })
            if (existAsAdmin)
                return res.status(400).json({ message: "This email is already registered" })

            const hashedPassword = await bcrypt.hash(password, 10)
            if (!hashedPassword)
                return res.status(403).json({ message: "something went wrong try again!!" })
            let initialize;
            if (role === "user") {

                initialize = new User({
                    email: email,
                    username: username,
                    password: hashedPassword,
                    role: role
                })
            } else if (role === "admin") {
                initialize = new Admin({
                    email: email,
                    username: username,
                    password: hashedPassword,
                    role: role
                })
            }
            await initialize.save()
                .then(() => {
                    return res.status(200).json({ message: "Registraion successfull" })
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: "registeration failed, try again" });
                })


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong" })
        }
    },

    async login(req, res) {
        try {
            const { username, password, role } = req.body;
            console.log(req.body);
            const { google } = req.query;
            let userData
            let validate;
            userData = {
                username: username,
                password: password
            }
            if (google === "true") {
                userData = {
                    username: username,
                }
                validate = Validate({
                    username: SchemaElements.username,
                },
                    userData
                )
            } else {
                validate = Validate({
                    username: SchemaElements.username,
                    password: SchemaElements.password
                },
                    userData
                )
            }

            if (!validate.status) {
                return res.status(400).json({ message: validate.response[0].message })
            }
            let user;
            if (role === "user") {
                user = await User.findOne({ username: { $regex: new RegExp(username, 'i') } }).maxTimeMS(30000)
                if (!user)
                    return res.status(404).json({ message: "Please enter a valid username" });

            } else if (role === "admin") {
                user = await Admin.findOne({ username: { $regex: new RegExp(username, 'i') } }).maxTimeMS(30000)
                if (!user)
                    return res.status(404).json({ message: "Please enter a valid username" });
            }
            console.log(user, "here it is ");
            if (user) {

                const validatePass = await bcrypt.compare(password, user.password);
                if (!validatePass)
                    return res.status(401).json({ message: "Password is incorrect!!" });

                user = user.toObject();
                delete user.password;
                console.log(user, "after delete");
                const payload = {
                    _id: user._id,
                    email: user.email,
                    role: user.role
                };

                const accessToken = generateAccessToken(payload, res);
                const refreshToken = generateRefreshToken(payload, res);
                const token = { accessToken, refreshToken };

                res.json({ message: "welcome to the real world", user, token })
            }


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Something went wrong" })
        }
    }
}


module.exports = commonController;