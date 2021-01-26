const g = document.querySelector('g');
const circle = document.querySelector('circle');

const sad = "M 150 200 Q 225 120 300 200";
const happy = "M 150 200 Q 225 300 300 200";

var checkbox = document.querySelector("input");
var smile = document.querySelector("path");
var placeholder = document.getElementById('placeholder');

checkbox.addEventListener("change", function() {
    if (checkbox.checked) {
        placeholder.innerHTML = "Happy";
        smile.setAttribute("d", happy);
    } else {
        placeholder.innerHTML = "Sad";
        smile.setAttribute("d", sad);
    }
});