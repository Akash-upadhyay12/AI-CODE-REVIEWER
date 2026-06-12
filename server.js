const mysql = require("mysql2");
const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");

dotenv.config();
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345y",
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
    const { code } = req.body;

    console.log("Received code:");
    console.log(code);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an expert code reviewer.

Return ONLY this format. No extra explanation.

Overall Score: 90/100
Bugs Found: No major bugs found
Suggestions: Write short suggestions only
Time Complexity: O(n)
Optimized Code: Write optimized code here

Code:
${code}
`
    });
    console.log(response);

    res.json({
      review: response.text
    });

  } catch (error) {
    console.log("Gemini Error Message:", error.message);
    console.log("Full Error:", error);

    res.status(500).json({
        review: error.message
    });
}
});


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
