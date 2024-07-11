const LOADER = document.querySelector("#loader");
const TITLE = document.querySelector(".title");
let form = document.querySelector("#settings");
let rowsCols = document.querySelector("#number");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (rowsCols.value == "") {
    return alert("Please enter all fields");
  }

  if (rowsCols.value > 50) {
    alert("Maze too large!");
    return;
  }

  localStorage.setItem("mazeSize", 600);
  localStorage.setItem("number", rowsCols.value);
  TITLE.style.setProperty("display", "none");
  form.style.setProperty("display", "none");
  LOADER.style.setProperty("display", "block");
  setTimeout(() => (window.location.href = "maze.html"), 3000);
  //window.location.href = "maze.html";
  // window.location.replace("maze.html");
});
