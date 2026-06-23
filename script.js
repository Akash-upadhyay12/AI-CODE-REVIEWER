let clear = document.getElementById("clear");
let reviewbtn = document.getElementById("reviewbtn");
let scorecount = document.getElementById("scorecount");
let review = document.getElementById("review");
let bugs = document.getElementById("bugs");
let suggestion = document.getElementById("suggestion");
let timecomplexity = document.getElementById("timecomplexity");
let optimized = document.getElementById("optimized");
let nav = document.querySelectorAll("nav ul li");
let currentuser = localStorage.getItem("loggedInUser");

document.getElementById("useremail").innerHTML = "🟢 " + currentuser;

nav.forEach(item => {
    item.addEventListener("click", function () {
        nav.forEach(li => {
            li.classList.remove("active");
        });
        this.classList.add("active");
    });
});

let loader = document.getElementById("loader");
let editor;

function resetReview() {
    if (editor) {
        editor.setValue("");
    }

    let code = document.getElementById("code");
    if (code) {
        code.value = "";
    }

    review.innerText = "Waiting for review....";
    scorecount.textContent = "0/100";
    bugs.innerText = "No review yet...";
    suggestion.innerText = "No suggestions yet...";
    timecomplexity.innerText = "Not analyzed yet...";
    optimized.innerText = "No optimized yet...";
    review.style.color = "white";
    scorecount.style.color = "white";
}

clear.addEventListener("click", function () {
    resetReview();
});

reviewbtn.addEventListener("click", async function () {
    let codeValue = editor ? editor.getValue() : "";
    let userEmail = localStorage.getItem("loggedInUser");

    if (codeValue.trim() === "") {
        alert("Please enter code first");
        return;
    }

    try {
        loader.style.display = "block";
        reviewbtn.disabled = true;
        reviewbtn.textContent = "Reviewing...";
            let currentuser = localStorage.getItem("loggedInUser");
            let isGuest = currentuser === "guest";

        const response = await fetch("https://ai-code-reviewer-oqsb.onrender.com/review", {
        
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: codeValue,
                email: isGuest ? null : userEmail
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.review || "API Error");
        }

        let text = data.review;
        let lines = text.split("\n");

        let scoreLine = lines.find(line => line.startsWith("Overall Score:"));
        let bugsLine = lines.find(line => line.startsWith("Bugs Found:"));
        let timeLine = lines.find(line => line.startsWith("Time Complexity:"));

        let optimizedIndex = lines.findIndex(line => line.startsWith("Optimized Code:"));
        let timeIndex = lines.findIndex(line => line.startsWith("Time Complexity:"));
        let suggestionIndex = lines.findIndex(line => line.startsWith("Suggestions:") || line.startsWith("Suggestion:"));

        scorecount.textContent = scoreLine ? scoreLine.replace("Overall Score: ", "") : "N/A";

        let score = parseInt(scorecount.textContent);

        if (score >= 80) {
            scorecount.style.color = "lime";
        } else if (score >= 50) {
            scorecount.style.color = "orange";
        } else {
            scorecount.style.color = "red";
        }

        bugs.textContent = bugsLine ? bugsLine.replace("Bugs Found: ", "") : "No bugs found";
        timecomplexity.textContent = timeLine ? timeLine.replace("Time Complexity: ", "") : "Not analyzed";

        let tc = timecomplexity.textContent.toLowerCase();

        if (tc.includes("o(1)") || tc.includes("o(log")) {
            timecomplexity.style.color = "green";
        } else if (tc.includes("o(n)") || tc.includes("o(nlog")) {
            timecomplexity.style.color = "orange";
        } else {
            timecomplexity.style.color = "red";
        }

        if (suggestionIndex !== -1 && timeIndex !== -1) {
            suggestion.textContent = lines
                .slice(suggestionIndex, timeIndex)
                .join("\n")
                .replace(/Suggestions:/i, "")
                .replace(/Suggestion:/i, "")
                .trim();
        } else {
            suggestion.textContent = "No suggestions";
        }

        if (optimizedIndex !== -1) {
            let optimizedLine = lines[optimizedIndex].replace("Optimized Code:", "").trim();

            if (optimizedLine !== "") {
                optimized.textContent = optimizedLine;
            } else {
                optimized.textContent = lines
                    .slice(optimizedIndex + 1)
                    .join("\n")
                    .replace("```java", "")
                    .replace("```", "")
                    .trim();
            }
        } else {
            optimized.textContent = "Code is already optimal.";
        }

        review.textContent = "Review completed successfully!!";
        review.style.color = "green";
        showToast("Review Generated Successfully");

    } catch (error) {
        console.log(error);

        scorecount.textContent = "N/A";
        bugs.textContent = "AI service is temporarily busy";
        suggestion.textContent = "Please try again after some time";
        timecomplexity.textContent = "Not analyzed";
        optimized.textContent = "Not available right now";

        review.textContent = "Request failed!!!!";
        review.style.color = "red";
    } finally {
        loader.style.display = "none";
        reviewbtn.disabled = false;
        reviewbtn.textContent = "Review Code";
    }
});

let signinBtn = document.getElementById("signin");
let loggedInUser = localStorage.getItem("loggedInUser");

if (loggedInUser) {
    signinBtn.innerText = "Logout";
}

signinBtn.addEventListener("click", function () {
    if (loggedInUser) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "auth.html";
    } else {
        window.location.href = "auth.html";
    }
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const code = document.getElementById("optimized").innerText;

    navigator.clipboard.writeText(code);

    document.getElementById("copyBtn").innerText = "✅";

    setTimeout(() => {
        document.getElementById("copyBtn").innerText = "📋";
    }, 1500);
});

require(["vs/editor/editor.main"], function () {
    monaco.editor.defineTheme("myTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#0F172A",
            "editor.foreground": "#E6EDF3",
            "editorLineNumber.foreground": "#94A3B8",
            "editorLineNumber.activeForeground": "#FFFFFF",
            "editorCursor.foreground": "#38BDF8",
            "editor.selectionBackground": "#1E40AF",
            "editor.lineHighlightBackground": "#1E293B"
        }
    });

    editor = monaco.editor.create(document.getElementById("editor"), {
        value: "",
        language: "java",
        theme: "myTheme",
        automaticLayout: true,
        fontSize: 15,
        minimap: {
            enabled: false
        },
        roundedSelection: true,
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        glyphMargin: false,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 2
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter , function(){
        reviewbtn.click();
    })
});



document.addEventListener("keydown", function (e) {

    if (e.ctrlKey && e.key === "Enter") {

        e.preventDefault();

        document.getElementById("reviewbtn").click();

    }

});

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}