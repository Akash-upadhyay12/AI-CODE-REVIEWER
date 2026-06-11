let clear = document.getElementById("clear");
let reviewbtn = document.getElementById("reviewbtn");

function resetReview() {
    let code = document.getElementById("code");
    let review = document.getElementById("review");
    let scorecount = document.getElementById("scorecount");
    let bugs = document.getElementById("bugs");
    let suggestion = document.getElementById("suggestion");
    let timecomplexity = document.getElementById("timecomplexity");
    let optimized = document.getElementById("optimized");

    code.value = "";
    review.innerText = "Waiting for review....";
    scorecount.textContent = "0/100";
    bugs.innerText = "No review yet...";
    suggestion.innerText = "No suggestions yet...";
    timecomplexity.innerText = "Not analyzed yet...";
    optimized.innerText = "No optimized yet...";
}

clear.addEventListener("click", function () {
    resetReview();
});

reviewbtn.addEventListener("click", function () {
    let code = document.getElementById("code");
    let review = document.getElementById("review");
    let scorecount = document.getElementById("scorecount");
    let bugs = document.getElementById("bugs");
    let suggestion = document.getElementById("suggestion");
    let timecomplexity = document.getElementById("timecomplexity");
    let optimized = document.getElementById("optimized");

    if (code.value == "") {
        alert("Please enter code");
        resetReview();
    } else {
        review.innerText = "Reviewing your code...";
        scorecount.textContent = "99/100";
        bugs.innerText = "No major bugs found";
        suggestion.innerText = "Code looks good";
        timecomplexity.innerText = "Not detected yet";
        optimized.innerText = "Optimized code will appear here...";

        if (code.value.includes("for") || code.value.includes("while")) {
            suggestion.innerText = "Loop detection. Good use of iteration";
            timecomplexity.innerText = "O(n)";
        }
    }
});


