window.addEventListener('load', function () {

let termBtn = document.getElementById("termBtn");
let dateBtn = document.getElementById("dateBtn");
let dateStatus = 0; //0: term, 1: date
termBtn.onclick = function() {
  dateStatus = 0;
  console.log("term");
  document.getElementById("date-selection").hidden = true;
  document.getElementById("term-selection").hidden= false;
}
dateBtn.onclick = function() {
  dateStatus = 1;
  console.log("date");
  document.getElementById("term-selection").hidden= true;
  document.getElementById("date-selection").hidden= false;
}

})
fetch("http://127.0.0.1:8080/").then
