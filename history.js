let userEmail = localStorage.getItem("loggedInUser");
let loggedInUser = localStorage.getItem("loggedInUser");
if(!loggedInUser){
    window.location.href = "auth.html"
}
let historycontainer = document.getElementById("historycontainer");

fetch(`http://localhost:5000/history?email=${userEmail}`).then((res) =>res.json()).then((data) =>{
    console.log(data);
    historycontainer.innerHTML = "";

data.forEach((item) => {
let reviewText = item.review || "";

let score = reviewText.split("Bugs Found:")[0].replace("Overall Score:", "").trim() || "N/A";

let bugs = reviewText.split("Bugs Found:")[1]?.split("Suggestions:")[0]?.trim() || "No bugs found";

let suggestions = reviewText.split("Suggestions:")[1]?.split("Time Complexity:")[0]?.trim() || "No suggestion";

let time = reviewText.split("Time Complexity:")[1]?.split("Optimized Code:")[0]?.trim() || "N/A";

let optimizedCode = reviewText.split("Optimized Code:")[1]?.trim() || "Code is already optimized";
    historycontainer.innerHTML += `
        <div class="history-card">
        <h3>Review #${item.id}</h3>

<p><strong>Code:</strong> ${item.code}</p>

<p><strong>Score:</strong> ${score}</p>

<p><strong>Bugs Found:</strong> ${bugs}</p>

<p><strong>Suggestions:</strong> ${suggestions}</p>

<p><strong>Time Complexity:</strong> ${time}</p>

<p><strong>Optimized Code:</strong> ${optimizedCode}</p>

<p><strong>Date:</strong> ${new Date(item.created_at).toLocaleString()}</p>
<button onclick ="deleteReview(${item.id})">Delete</button>
        </div>
    `;
});

    
})
.catch((err) =>{
    console.log(err);
});

async function deleteReview(id){
    let confirmdelete = confirm("Are you sure?");
    if(!confirmdelete){
        return;
    }
    await fetch(`http://localhost:5000/history/${id}`,{
        method: "DELETE"
    })
    location.reload();
    



}