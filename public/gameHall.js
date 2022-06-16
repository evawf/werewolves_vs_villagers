const newGameBtn = document.getElementById("newGameBtn");
const gameRoomsContainer = document.getElementById("gameRoomsContainer");
const outputMsgDiv = document.getElementById("outputMsg");
let currentGamesArr = [];
let games;

// Create Game game
newGameBtn.addEventListener("click", async () => {
  const newGame = {
    name: document.getElementById("gameName").value,
    game_state: "Waiting",
  };
  const result = await axios.post("/newGame", newGame);
});

// Display new game room
async function showNewGameRooms() {
  const result = await axios.get("/getGamesInfo");
  gamesArr = result.data.games;
  // Check if new game room
  outputMsgDiv.textContent = "Welcome! Please create a room to play!";
  if (gamesArr.length > currentGamesArr.length) {
    gamesArr.forEach((game) => {
      if (
        !currentGamesArr
          .map((g) => {
            return g.id;
          })
          .includes(game.id)
      ) {
        currentGamesArr.push(game);
        const newGameDiv = document.createElement("div");
        newGameDiv.className = "game";
        newGameDiv.id = `${game.id}`;
        const gameLink = document.createElement("span");
        gameLink.className = "gameName";
        gameLink.textContent = game.name;
        gameLink.href = `/games/${game.id}`;
        newGameDiv.append(gameLink);
        gameRoomsContainer.append(newGameDiv);
      }
    });
    games = document.querySelectorAll(".game");
    games.forEach((game) => {
      game.addEventListener("click", async (e) => {
        console.log("clicked");
        let clickedGame = e.currentTarget;
        const gameId = clickedGame.id;
        await axios.post("/games/joinGame", { gameId });
        window.location.href = `/games/${gameId}`;
      });
    });
  }
  setTimeout(showNewGameRooms.bind(), 2000);
}

showNewGameRooms();
