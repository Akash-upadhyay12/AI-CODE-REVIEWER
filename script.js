let clear = document.getElementById("clear");
let reviewbtn = document.getElementById("reviewbtn");
clear.addEventListener("click", function(){
    let code = document.getElementById("code");
    
    code.value = "";
});
reviewbtn.addEventListener("click", function(){
    let review = document.getElementById("review");
    let scorecount = document.getElementById("scorecount");
    let code = document.getElementById("code");
    if(code.value == ""){
        alert("please enter code");
        review.innerText ="Waiting for review...."; 
        scorecount.textContent = "0/100";
    }
    else{
        review.innerText ="Reviewing your code...";
        scorecount.textContent = "99";
    }
    



})


