const newGameBtn = document.getElementById("newGameBtn");
const gamesDiv = document.getElementById("gamesDiv");

// Create Game game
newGameBtn.addEventListener("click", async () => {
  console.log("clicked!");
  const newGame = {
    name: document.getElementById("gameName").value,
  };
  const result = await axios.post("/newGame", newGame);
  // Add new game to front end
  const game = result.data;
  const newGameDiv = document.createElement("div");
  newGameDiv.id = `game${game.id}`;
  newGameDiv.className = "game";
  const gameName = document.createElement("div");
  gameName.className = "gameName";
  gameName.textContent = game.name;
  newGameDiv.append(gameName);
  gamesDiv.append(newGameDiv);
});

// Join the game game
// const getCurrentUser = async () => {
//   const result = await axios.get("/currentUser");
//   console.log(result.data.displayName);
//   return result.data.displayName;
// };

// const games = document.querySelectorAll(".game");
// games.forEach((game) => {
//   game.addEventListener("click", async (e) => {
//     let clickedGame = e.currentTarget;
//     console.log(clickedGame.id);
//   });
// });

// getCurrentUser();
