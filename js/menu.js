let form = document.querySelector("#settings");
let size = document.querySelector("#size");
let rowsCols = document.querySelector("#number");

form.addEventListener("submit", function () {
  if (rowsCols.value == "" || size.value == "") {
    return alert("Please enter all fields");
  }

  if (size.value > 600 || rowsCols.value > 50) {
    alert("Maze too large!");
    return;
  }

  localStorage.setItem("mazeSize", size.value);
  localStorage.setItem("number", rowsCols.value);
  // window.location.href = "maze.html";
  // window.location.replace("maze.html");
});
