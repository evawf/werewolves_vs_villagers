const newGameBtn = document.getElementById("newGameBtn");
const gameRoomsContainer = document.getElementById("gameRoomsContainer");
const outputMsgDiv = document.getElementById("outputMsg");
const createRoomDiv = document.getElementById("createRoom");
const createRoomBtn = document.getElementById("createRoomBtn");
const cancelBtn = document.getElementById("cancelBtn");
createRoom.style.display = "none";
let currentGamesArr = [];
let games;

// Cancel new room creation
cancelBtn.addEventListener("click", () => {
  createRoom.style.display = "none";
  createRoomBtn.style.display = "block";
});

// Show room create div
createRoomBtn.addEventListener("click", () => {
  createRoom.style.display = "block";
  createRoomBtn.style.display = "none";
});

// Create Game game
newGameBtn.addEventListener("click", async () => {
  const gameName = document.getElementById("gameName").value;
  if (gameName.trim("")) {
    const newGame = {
      name: document.getElementById("gameName").value,
      gameState: "Waiting",
    };
    const result = await axios.post("/newGame", newGame);
    createRoom.style.display = "none";
    createRoomBtn.style.display = "block";
  } else {
    alert("Game name is empty!");
  }
});

// Display new game room
async function showNewGameRooms() {
  const result = await axios.get("/getGamesInfo");
  gamesArr = result.data.games;
  console.log(gamesArr);
  // Check if new game room
  outputMsgDiv.textContent =
    "Please choose a room to join the game or create your own game!";
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
        console.log(game.userGames.length);
        const newGameDiv = document.createElement("div");
        newGameDiv.className = "game";
        newGameDiv.id = `${game.id}`;
        const gameLink = document.createElement("span");
        gameLink.className = "gameName";
        gameLink.textContent = `${game.name} | ${game.userGames.length}/3`; // add number of players here
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
  // setTimeout(showNewGameRooms.bind(), 2000);
}

showNewGameRooms();
