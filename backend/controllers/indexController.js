const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// The SECRET_KEY should match what is in your .env file
require("dotenv").config({path: ".env"});
const prisma = require("../lib/prisma.js");

async function logInPost(req, res) {
    try {
        const { username, password } = req.body;
        
        // FIX 1: Use 'let' instead of 'const'
        let token = null; 

        if (username && password) {
            // FIX 2: Use findUnique (or findFirst) to return an object, not an array.
            // (Assuming your schema uses "model User", this is prisma.user)
            const user = await prisma.users.findUnique({
                where: { username: username }
            });

            // FIX 3: Check if the user exists before checking passwords
            if (!user) {
                // FIX 4: Send a 401 status code so React knows it's an auth error
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Now it's safe to compare passwords because 'user' definitely exists
            let match = await bcrypt.compare(password, user.password);
            
            if (match) {
                token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '12h' });
                return res.json({ token, username: user.username });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            return res.status(400).json({ message: "Username and password are required" });
        }
    } catch(err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

function verifyToken(req, res, next) {
    req.user = { username: null, verified: false };
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(' ')[1];
        
        jwt.verify(bearerToken, process.env.SECRET_KEY, function (err, data) {
            // FIX 5: Simplified the error checking logic
            if (err) {
                return res.sendStatus(403);
            }
            
            req.user = { username: data.username, verified: true };
            return next(); // FIX 6: Added 'return' to stop execution here
        });
    } else {
        return res.sendStatus(403);
    }
}

function logout(req, res) {
    // Since JWTs are stateless, actual "logout" is handled by the React frontend 
    // deleting the token from localStorage. Returning 200 is perfectly fine here.
    return res.sendStatus(200);
}

module.exports = {
    logInPost,
    verifyToken,
    logout
}