const newGameBtn = document.getElementById("newGameBtn");
const gamesDiv = document.getElementById("gamesDiv");

// Create Game game
newGameBtn.addEventListener("click", async () => {
  const newGame = {
    name: document.getElementById("gameName").value,
    game_state: "Start",
  };
  const result = await axios.post("/newGame", newGame);
  // Add new game to front end
  const game = result.data;
  const newGameDiv = document.createElement("div");
  newGameDiv.id = `game${game.id}`;
  newGameDiv.className = "game";
  const gameName = document.createElement("span");
  gameName.className = "gameName";
  gameName.textContent = game.name;
  // gameName.href = `/games/${game.id}`;
  newGameDiv.append(gameName);
  gamesDiv.append(newGameDiv);
});

let newPlayer;
const games = document.querySelectorAll(".gameDiv");
games.forEach((game) => {
  game.addEventListener("click", async (e) => {
    let clickedGame = e.currentTarget;
    const gameId = clickedGame.id;
    const result = await axios.post("/games/joinGame", { gameId });
    newPlayer = result.data;
    window.location.href = `/games/${gameId}`;
  });
});
