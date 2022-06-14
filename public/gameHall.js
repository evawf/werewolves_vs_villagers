const newGameBtn = document.getElementById("newGameBtn");
const gamesDiv = document.getElementById("gamesDiv");
const roles = ["Werewolf", "Villager"];
let wIdx = 2;
const rolesArr =
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
    const gameName = document.createElement("a");
    gameName.className = "gameName";
    gameName.textContent = game.name;
    gameName.href = `/games/${game.id}`;
    newGameDiv.append(gameName);
    gamesDiv.append(newGameDiv);
  });

// Enter the Game Room
// const getCurrentUser = async () => {
//   const result = await axios.get("/currentUser");
//   console.log(result.data.displayName);
//   return result.data.displayName;
// };

const games = document.querySelectorAll(".gameDiv");
games.forEach((game) => {
  game.addEventListener("click", async (e) => {
    let clickedGame = e.currentTarget;
    const gameId = clickedGame.id;
    const result = await axios.post("/games/joinGame", { gameId });
    console.log(result);
  });
});

// getCurrentUser();
