const mysql = require("mysql2");
const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const Groq = require("groq-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
async function testGroq() {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: "Say Groq connected successfully"
                }
            ]
        });

        console.log(response.choices[0].message.content);
    } catch (error) {
        console.log("Groq Error:", error.message);
    }
}
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});
db.connect((err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log("MySQL Connected");
    }
});

const app = express();
app.use(cors());
app.use(express.json());
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {

    if (err.code === "ER_DUP_ENTRY") {

        if (err.sqlMessage.includes("username")) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        if (err.sqlMessage.includes("email")) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
    }

    return res.status(500).json({
        message: "Server Error"
    });
}

            res.json({
                message: "Signup Successful"
            });
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error"
        });
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login Successful",
            token: token,
            username: user.username,
            email: user.email
        });
    });
});



app.post("/review", async (req, res) => {
    let code;
    let review;
    let userEmail
  console.log("Review api hit");
  try {
const { code, userEmail } = req.body;

console.log("BODY:", req.body);
console.log("EMAIL:", userEmail);

console.log("Received code:");
console.log(code);
    console.log("Calling gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `

You are an expert code reviewer.

Return ONLY this format. No extra explanation.

Only provide optimized code if there is a real optimization possible.
If the code is already optimal, return:
Optimized Code: Code is already optimal.
Do not replace loops with hardcoded statements.
Do not change the logic of the code.
Do not suggest micro-optimizations that reduce readability.
Prefer maintainable and production-ready code.

return only this format:

Overall Score: 90/100
Bugs Found: if no bugs found, write "No bugs found"
Suggestions: Write short suggestions only if no suggestion, write "No suggestions"
Time Complexity:O(n)
Optimized Code: if code is already optimal, write "Code is already optimal."

never add extra headings, markdown, or explanations outside this format.

Code:
${code}
`
    });
    console.log("Gemini response received");
    console.log(response);
    
    review = response.text;
    console.log("Review value");
    console.log(review);

    

    if (userEmail && userEmail.toLowerCase() !== "guest") {
    const sql = `
    INSERT INTO reviews(code, review, user_email)
    VALUES(?, ?, ?)`;

    db.query(sql, [code, review, userEmail], (err, result) => {
        if (err) {
            console.log("Database insert error:", err);
        } else {
            console.log("Review saved in database");
        }
    });
} else {
    console.log("Guest user - review not saved.");
}

    res.json({
      review: review
    });

  } catch (error) {

    console.log("Gemini Error Message:", error.message);
    console.log("Full Error:", error);
    console.log("Gemini failed. Switching to Groq.....")
    

    try {
         ({ code, userEmail } = req.body);
    const groqResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: `
You are an expert code reviewer.

Return ONLY this format. No extra explanation.

Only provide optimized code if there is a real optimization possible.
If the code is already optimal, return:
Optimized Code: Code is already optimal.
Do not replace loops with hardcoded statements.
Do not change the logic of the code.
Do not suggest micro-optimizations that reduce readability.
Prefer maintainable and production-ready code.

return only this format:

Overall Score: 90/100
Bugs Found: if no bugs found, write "No bugs found"
Suggestions: Write short suggestions only if no suggestion, write "No suggestions"
Time Complexity: O(n)
Optimized Code: if code is already optimal, write "Code is already optimal."

never add extra headings, markdown, or explanations outside this format.

Code:
${code}
`
}
        ]
    });

    review = groqResponse.choices[0].message.content;

    console.log("Groq response received");

    return res.json({
        review: review
    });

} catch (groqError) {
    console.log("Groq Error:", groqError.message);
}


    res.status(500).json({
        review: `Overall Score: N/A
        Bugs Found: AI service is temporarily busy.
        Suggestion: Please try again after some time.
        Time Complexity: Not analyzed
        Optimized Code: Not available right now.`
    });
}
});


app.get("/history", (req, res) => {
    const email = req.query.email;
    console.log(email);

    const sql = "SELECT * FROM reviews WHERE user_email = ? ORDER BY id DESC";

    db.query(sql,[email], (err, result) => {

        if (err) {
            console.log(err);
            res.status(500).json({ message: "Database Error" });
        }
        else {
            res.json(result);
        }

    });

});

app.delete("/history/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM reviews WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if(err){
            console.log(err);
            res.status(500).json({ message: "Delete failed" });
        }
        else{
            res.json({ message: "Review deleted successfully" });
        }
    });
});




const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/rating", (req, res) => {
    const { user_email, user_name, rating, feedback } = req.body;

    if (!user_email || !user_name || !rating || !feedback) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (feedback.trim().length < 20) {
        return res.status(400).json({ error: "Please write feedback of at least 20 characters" });
    }

    const sql = "INSERT INTO website_ratings (user_email, user_name, rating, feedback) VALUES (?, ?, ?, ?)";

    db.query(sql, [user_email, user_name, rating, feedback], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ error: "You have already rated this website" });
            }

            console.log(err);
            return res.status(500).json({ error: "Failed to save rating" });
        }

        res.json({ message: "Thanks for your valuable feedback!" });
    });
});


app.get("/ratings", (req, res) => {

    const avgSql = `
        SELECT 
            ROUND(AVG(rating), 1) AS averageRating,
            COUNT(*) AS totalRatings
        FROM website_ratings
    `;

    db.query(avgSql, (err, avgResult) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
        }

        const userSql = `
            SELECT user_name, user_email, rating, feedback, created_at
             FROM website_ratings
              ORDER BY created_at DESC
        `;

        db.query(userSql, (err, users) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({
                averageRating: avgResult[0].averageRating,
                totalRatings: avgResult[0].totalRatings,
                users: users
            });

        });

    });

});



app.delete("/rating/:email", (req, res) => {
    const email = req.params.email;

    const sql = "DELETE FROM website_ratings WHERE user_email = ?";

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to delete rating" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rating not found" });
        }

        res.json({ message: "Rating deleted successfully" });
    });
});




app.put("/rating/:email", (req, res) => {
    const email = req.params.email;
    const { rating, feedback } = req.body;

    if (!rating || !feedback) {
        return res.status(400).json({ error: "Rating and feedback are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (feedback.trim().length < 20) {
        return res.status(400).json({ error: "Please write feedback of at least 20 characters" });
    }

    const sql = `
        UPDATE website_ratings
        SET rating = ?, feedback = ?
        WHERE user_email = ?
    `;

    db.query(sql, [rating, feedback, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to update rating" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Rating not found" });
        }

        res.json({ message: "Rating updated successfully" });
    });
});








app.listen(5000, () => {
    console.log("Server running on port 5000");
});
