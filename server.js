const mysql = require("mysql2");
const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");

dotenv.config();
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Akash@1234",
    database: "ai_code_reviewer"
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
app.post("/review", async (req, res) => {
  console.log("Review api hit");
  try {
    const { code, userEmail } = req.body;

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
    const review = response.text;
    console.log("Review value");
    console.log(review);

    

    const sql = `
    INSERT INTO reviews(code, review, user_email)
    VALUES(?, ?, ?)`;
    db.query(sql, [code, review, userEmail], (err, result) => {
    if(err){
        console.log("Database insert error:", err);
    }
    else{
        console.log("Review saved in database");
    
}

});

    res.json({
      review: response.text
    });

  } catch (error) {
    console.log("Gemini Error Message:", error.message);
    console.log("Full Error:", error);

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

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
