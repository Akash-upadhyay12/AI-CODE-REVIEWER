// let clear = document.getElementById("clear");
// let reviewbtn = document.getElementById("reviewbtn");
// console.log(reviewbtn);

// function resetReview() {
//     let code = document.getElementById("code");
//     let review = document.getElementById("review");
//     let scorecount = document.getElementById("scorecount");
//     let bugs = document.getElementById("bugs");
//     let suggestion = document.getElementById("suggestion");
//     let timecomplexity = document.getElementById("timecomplexity");
//     let optimized = document.getElementById("optimized");

//     code.value = "";
//     review.innerText = "Waiting for review....";
//     scorecount.textContent = "0/100";
//     bugs.innerText = "No review yet...";
//     suggestion.innerText = "No suggestions yet...";
//     timecomplexity.innerText = "Not analyzed yet...";
//     optimized.innerText = "No optimized yet...";
// }

// clear.addEventListener("click", function () {
//     resetReview();
// });
// reviewbtn.addEventListener("click", async function () {
//     const code = document.getElementById("code").value;

//     reviewbtn.disabled = true;

//     const response = await fetch("http://localhost:5000/review", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ code: code })
//     });

//     const data = await response.json();

//     reviewbtn.disabled = false;
// });


//     console.log("after fetch");
//     if(!response.ok){
//         throw new Error("API Error");
//     }
//     const data = await response.json()
//     console.log(data);
//     console.log(data.review);
//     let scorecount = document.getElementById("scorecount");
//     let review = document.getElementById("review");
//     let bugs = document.getElementById("bugs");
//     let suggestion = document.getElementById("suggestion");
//     let timecomplexity = document.getElementById("timecomplexity");
//     let optimized = document.getElementById("optimized");
//     let text = data.review;
//     review.textContent= text;
//      bugs.textContent = "check review above";
//      suggestion.textContent ="Optimization suggestions coming soon";
//      timecomplexity.textContent ="Analyzing....";
//     console.log("review btn clicked");
//     console.log("code value", code);

// });


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

reviewbtn.addEventListener("click", async function () {
    const code = document.getElementById("code").value;

    if (code.trim() === "") {
        alert("Please enter code first");
        return;
    }

    reviewbtn.disabled = true;

    try {
        console.log("review btn clicked");
        console.log("code value", code);
        console.log("before fetch");

        const response = await fetch("http://localhost:5000/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code: code })
        });

        console.log("after fetch");

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

        review.textContent = text;
        bugs.textContent = "check review above";
        suggestion.textContent = "Optimization suggestions coming soon";
        timecomplexity.textContent = "Analyzing....";
        optimized.textContent = "Included in review";

    } catch (error) {
        document.getElementById("review").textContent = error.message;
    } finally {
        reviewbtn.disabled = false;
    }
});