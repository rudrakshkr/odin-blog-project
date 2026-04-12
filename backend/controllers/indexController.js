const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {body, validationResult, matchedData} = require("express-validator");
require("dotenv").config({path: ".env"});
const prisma = require("../lib/prisma.js");
const { parse } = require("dotenv");

async function logInPost(req, res) {
    try {
        const { username, password } = req.body;
        
        let token = null; 

        if (username && password) {
            const user = await prisma.users.findUnique({
                where: { username: username }
            });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            let match = await bcrypt.compare(password, user.password);
            
            if (match) {
                token = jwt.sign({ username: user.username, role: user.role }, process.env.SECRET_KEY, { expiresIn: '7d' });
                return res.json({ token, username: user.username, role: user.role });
            } else {
                return res.status(401).json({ message: "Invalid password" });
            }
        } else {
            return res.status(400).json({ message: "Username and password are required" });
        }
    } catch(err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

function verifyAdmin(req, res, next) {
    if(req.user && req.user.role === "ADMIN") {
        next();
    }
    else {
        return res.status(403).json({message: "Access denied. Admins only."});
    }
}

function verifyToken(req, res, next) {
    req.user = { username: null, verified: false };
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(' ')[1];
        
        jwt.verify(bearerToken, process.env.SECRET_KEY, function (err, data) {
            if (err) {
                console.error("JWT Error:", err.message);
                return res.sendStatus(403);
            }
            
            req.user = { username: data.username, role: data.role, verified: true };
            return next();
        });
    } else {
        return res.sendStatus(403);
    }
}

const validateUser = [
    body("email").isEmail().withMessage("Invalid email address. Please try again."),
    body("password").trim().isLength({min: 6, max: 25}).withMessage("Password should be atleast 6 characters long"),
    body("username").trim()
    .isLength({min: 6}).withMessage(`Username must be atleast 6 characters long`)
    .isLength({max: 15}).withMessage(`Username should not exceed 15 characters`)
    .custom(async (value) => {
        const user = await prisma.users.findUnique({
            where: {
                username: value
            }
        })

        if(user) {
            throw new Error("Username already in use");
        }
    })
]

let signUpPagePost = [
    validateUser,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }

            const {password} = matchedData(req);
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.users.createMany({
                data: [
                    {username: req.body.username, email: req.body.email, password: hashedPassword}
                ]
            })

            return res.json({message: "Nice, you can sign in now!"});
        } catch(err) {
            console.error("SignUp Error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
]

async function submitPost(req, res, next) {
    try {
        const {
            postTitle,
            postDescription,
            postStatus,
            postCategory,
            postTags,
            postUrl,
            postSummary
        } = req.body;

        const postReadMin = parseInt(req.body.postReadMin, 10);

        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();

        const tokenUsername = req.user.username;

        const coverImagePath = req.file ? req.file.path : null;

        const getUser = await prisma.users.findUnique({
            where: {
                username: tokenUsername
            }
        })

        if(!getUser) {
            return res.status(404).json({message: "User not found"});
        }

        const formattedTags = postTags ? postTags.split(',').map(tag => tag.trim()) : [];

        await prisma.posts.create({
            data: {
                title: postTitle,
                coverImage: coverImagePath,
                description: postDescription,
                status: postStatus,
                category: postCategory,
                readMin: postReadMin,
                tags: formattedTags,
                urlSlug: postUrl,
                summary: postSummary,
                userId: getUser.id,
                date: `${dd}/${mm}/${yyyy}`
            }
        })

        return res.json({message: "Data uploaded"})
    }
    catch(err) {
        console.error("Submit post error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function editPostPut(req, res, next) {
    try {
        const {postId} = req.params;

        const {
            postTitle,
            postDescription,
            postStatus,
            postCategory,
            postTags,
            postUrl,
            postSummary
        } = req.body;

        const postReadMin = parseInt(req.body.postReadMin, 10);

        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();

        const tokenUsername = req.user.username;

        const getUser = await prisma.users.findUnique({
            where: {
                username: tokenUsername
            }
        })


        if(!getUser) {
            return res.status(404).json({message: "User not found"});
        }

        const formattedTags = postTags ? postTags.split(',').map(tag => tag.trim()) : [];

        const updateData = {
            title: postTitle,
            description: postDescription,
            status: postStatus,
            category: postCategory,
            readMin: postReadMin,
            tags: formattedTags,
            urlSlug: postUrl,
            summary: postSummary,
            date: `${dd}/${mm}/${yyyy}`
        }

        if(req.file) {
            updateData.coverImage = req.file.path;
        }

        await prisma.posts.update({
            where: {
                id: parseInt(postId)
            },
            data: updateData
        })

        return res.json({message: "Data uploaded"})
    }
    catch(err) {
        console.error("Submit post error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function getUserById(req, res, next) {
    try {
        const {userId} = req.params;

        const user = await prisma.users.findUnique({
            where: {
                id: parseInt(userId)
            }
        })

        if(!user) {
            return res.json({message: "Couldn't find user!"})
        }

        return res.json({user: user});
    }
    catch(err) {
        console.error("Prisma Error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function getPosts(req, res, next) {
    try {
        const tokenUsername = 's';

        const getUser = await prisma.users.findUnique({
            where: {
                username: tokenUsername
            }
        })

        if(!getUser) {
            return res.status(404).json({message: "User not found"});
        }

        const getPosts = await prisma.posts.findMany({
            where: {
                userId: getUser.id
            }
        })

        return res.json({posts: getPosts})
    }
    catch(err){
        console.error("Prisma Error:", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function togglePost(req, res, next) {
    try {
        const {postId} = req.params;
        const {status} = req.body;

        await prisma.posts.update({
            where: {id: parseInt(postId)},
            data: {
                status: status
            }
        })
        
        res.json({message: "Status updated!"})
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function getPostById(req, res, next) {
    try {
        const {postId} = req.params;

        const getPost = await prisma.posts.findUnique({
            where: {
                id: parseInt(postId)
            }
        })

        if(!getPost) {
            return res.json({message: "Failed to fetch posts!"})
        }

        return res.json({post: getPost})
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function getPostBySlug(req, res, next) {
    try {
        const {postSlug} = req.params;

        const getPost = await prisma.posts.findUnique({
            where: {
                urlSlug: postSlug
            }
        })

        if(!getPost) {
            return res.json({message: "Failed to fetch post!"})
        }

        return res.json({post: getPost})
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function deletePost(req, res, next) {
    try {
        const {postId} = req.params;

        await prisma.posts.delete({
            where: {
                id: parseInt(postId)
            }
        })

        return res.json({message: "Post deleted"});
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function postComment(req, res, next) {
    try {
        const {userId} = req.params;

        const {
            name,
            comment,
        } = req.body;

        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();

        await prisma.comments.create({
            data: {
                name: name,
                comment: comment,
                date: `${dd}/${mm}/${yyyy}`,
                userId: parseInt(userId)
            }
        })

        return res.json({message: "Comment added!"});
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

async function getComments(req, res, next) {
    try {
        const comments = await prisma.comments.findMany();

        if(!comments) {
            return res.status(403).send("Failed to fetch comments");
        }

        return res.json({comments: comments});
    }
    catch(err) {
        console.error("Prisma error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    }
}


function logout(req, res) {
    return res.sendStatus(200);
}

module.exports = {
    logInPost,
    verifyAdmin,
    verifyToken,
    getUserById,
    signUpPagePost,
    submitPost,
    getPosts,
    togglePost,
    getPostById,
    getPostBySlug,
    editPostPut,
    deletePost,
    postComment,
    getComments,
    logout
}