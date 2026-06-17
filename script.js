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
    item.addEventListener("click", function(){
        nav.forEach(li =>{
            li.classList.remove("active");
        });
        this.classList.add("active");
    });
    
});
let loader = document.getElementById("loader");

function resetReview() {
    let code = document.getElementById("code");
    code.value = "";
    review.innerText = "Waiting for review....";
    scorecount.textContent = "0/100";
    bugs.innerText = "No review yet...";
    suggestion.innerText = "No suggestions yet...";
    timecomplexity.innerText = "Not analyzed yet...";
    optimized.innerText = "No optimized yet...";
    review.style.color = "white";
    scorecount.style.color ="white";
}

clear.addEventListener("click", function () {
    resetReview();
});

reviewbtn.addEventListener("click", async function () {
    let userEmail  = localStorage.getItem("loggedInUser");
    const code = document.getElementById("code").value;

    if (code.trim() === "") {
        alert("Please enter code first");
        return;
    }


    try {
        loader.style.display ="block";
        reviewbtn.disabled = true;
        reviewbtn.textContent= "Reviewing...";

        const response = await fetch("http://localhost:5000/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code: code,
                userEmail: userEmail
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.review || "API Error");
        }

        console.log(data);
        console.log(data.review);

        let scorecount = document.getElementById("scorecount");
        let review = document.getElementById("review");
        let bugs = document.getElementById("bugs");
        let suggestion = document.getElementById("suggestion");
        let timecomplexity = document.getElementById("timecomplexity");
        let optimized = document.getElementById("optimized");



let text = data.review;
console.log(text);

let lines = text.split("\n");
console.log(lines);
let scoreLine = lines.find(line => line.startsWith("Overall Score:"));
let bugsLine = lines.find(line => line.startsWith("Bugs Found:"));
let timeLine = lines.find(line => line.startsWith("Time Complexity:"));

let optimizedIndex = lines.findIndex(line => line.startsWith("Optimized Code:"));
let timeIndex = lines.findIndex(line => line.startsWith("Time Complexity:"));
let suggestionIndex = lines.findIndex(line => line.startsWith("Suggestions:") || line.startsWith("Suggestion:"));

scorecount.textContent = scoreLine.replace("Overall Score: ", "");
console.log(scorecount);
let score = parseInt(scorecount.textContent);
if(score >= 80){
    scorecount.style.color = "lime";
}
else if(score >= 50){
    scorecount.style.color  = "orange";
}
else{
    scorecount.style.color ="red";
}
bugs.textContent = bugsLine.replace("Bugs Found: ", "");
timecomplexity.textContent = timeLine.replace("Time Complexity: ", "");
let tc = timecomplexity.textContent.toLowerCase();
if(tc.includes("o(1)") || tc.includes("o(log)")){
    timecomplexity.style.color ="green";
}
else if(tc.includes("o(n)") || tc.includes("o(nlog)")){
    timecomplexity.style.color="orange";
}
else{
    timecomplexity.style.color="red";
}

suggestion.textContent = lines
  .slice(suggestionIndex, timeIndex)
  .join("\n")
  .replace(/Suggestions:/i, "")
  .replace(/Suggestion:/i, "")
  .trim();

let optimizedLine = lines[optimizedIndex].replace("Optimized Code:", "").trim();
if(optimizedLine !== ""){
    optimized.textContent=optimizedLine;
}
else{
    optimized.textContent = lines
    .slice(optimizedIndex + 1)
    .join("\n")
    .replace("```java", "")
    .replace("```", "")
    .trim();
}

review.textContent="Review completed successfully!! ";
review.style.color="green";

    } 
    catch(error){

    console.log(error);

    scorecount.textContent = "N/A";
    bugs.textContent = "AI service is temporarily busy";
    suggestion.textContent = "Please try again after some time";
    timecomplexity.textContent = "Not analyzed";
    optimized.textContent = "Not available right now";

    review.textContent = "Request failed!!!!";
    review.style.color = "red";
   }      
  finally {
        loader.style.display = "none";
        reviewbtn.disabled = false;
        reviewbtn.textContent= "Review Code";
        console.log("Finally block sun");
    }
});
let signinBtn = document.getElementById("signin");
let loggedInUser = localStorage.getItem("loggedInUser");
if(loggedInUser){
    signinBtn.innerText ="Logout";
}

signinBtn.addEventListener("click", function(){
    if(loggedInUser){
        localStorage.removeItem("loggedInUser");
        window.location.href ="auth.html";
    }
    else{
        window.location.href="auth.html";
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