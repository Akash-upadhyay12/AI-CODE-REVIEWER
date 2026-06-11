const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            //contents: "Explain javascript closures",
            contents: "Explain wave theory in 4 lines",
            contents:"generate pi value"
        });

        res.send(response.text);
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
});

app.listen(1800, () => {
    console.log("Server running on port 1800");
});