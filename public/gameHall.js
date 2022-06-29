const newGameBtn = document.getElementById("newGameBtn");
const gameRoomsContainer = document.getElementById("gameRoomsContainer");
const outputMsgDiv = document.getElementById("outputMsg");
const createRoomDiv = document.getElementById("createRoom");
const createRoomBtn = document.getElementById("createRoomBtn");
const cancelBtn = document.getElementById("cancelBtn");
createRoom.style.display = "none";
let currentGamesArr = [];
let gamesInfo;
const numOfPlayers = 4;
let currentPlayer;

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
  const ccurrentUserId = document.getElementById("currentUserId").value;
  console.log(ccurrentUserId);
  if (gameName.trim("")) {
    const newGame = {
      name: document.getElementById("gameName").value,
      gameState: "Waiting",
      ownerId: Number(ccurrentUserId),
    };

    await axios.post("/newGame", newGame);
    createRoom.style.display = "none";
    createRoomBtn.style.display = "block";
  } else {
    alert("Game name is empty!");
  }
  // let result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  // currentPlayer = {
  //   id: result.data.player?.userId,
  //   // role: result.data.player?.role,
  // };
});

// Display new game room
async function showNewGameRooms() {
  const result = await axios.get("/getGamesInfo");
  gamesInfo = result.data.games;
  console.log(result.data);
  if (result.data === "No game") {
    outputMsgDiv.textContent =
      "Create a game room then wait for your friends to join you.";
    return;
  } else {
    // Check if new game room
    outputMsgDiv.textContent = "Please choose a room or create your own room!";
    if (gamesInfo.length > currentGamesArr.length) {
      gamesInfo.forEach((game) => {
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
          const gameLink = document.createElement("span");
          gameLink.className = "gameName";
          gameLink.id = `${game.id}`;
          if (game.userGames.length < numOfPlayers) {
            gameLink.textContent = `${game.name} | ${game.userGames.length}/${numOfPlayers}`; // add number of players here
            gameLink.href = `/games/${game.id}`;
          } else {
            gameLink.textContent = `${game.name} | FULL`;
            gameLink.href = "none";
          }
          newGameDiv.append(gameLink);
          console.log("owner id: ", game.ownerId);
          const ccurrentUserId = document.getElementById("currentUserId").value;
          console.log("currentPlayer id: ", ccurrentUserId);
          if (ccurrentUserId === String(game.ownerId)) {
            console.log("you are the owner");
            const button = document.createElement("button");
            button.className = "deleteGameBtn";
            button.id = `game${game.id}`;
            button.textContent = "Delete";
            newGameDiv.append(button);
          }
          gameRoomsContainer.append(newGameDiv);
        }
      });
    }

    // If there is a game deleted by owner;
    if (gamesInfo.length < currentGamesArr.length) {
      currentGamesArr.forEach((game) => {
        if (
          !currentGamesArr
            .map((g) => {
              return g.id;
            })
            .includes(game.id)
        ) {
          currentGamesArr.splice(currentGamesArr.indexOf(game), 1);
          gameDiv = document.getElementById(`${game.id}`);
          gameDiv.remove();
        }
      });
    }

    const games = document.querySelectorAll(".gameName");
    games.forEach((game) => {
      game.addEventListener("click", async (e) => {
        console.log("clicked");
        let clickedGame = e.currentTarget;
        const gameId = clickedGame.id;
        const result = await axios.get(`/games/${gameId}/players`);
        const playerIdArr = result.data.map((p) => {
          return p.id;
        });
        console.log(playerIdArr);
        const ccurrentUserId = document.getElementById("currentUserId").value;
        const joinedPlayersNum = result.data.length;
        if (joinedPlayersNum < numOfPlayers) {
          await axios.post("/games/joinGame", { gameId });
          window.location.href = `/games/${gameId}`;
        } else if (playerIdArr.includes(ccurrentUserId)) {
          window.location.href = `/games/${gameId}`;
        } else {
          alert("Game room is full, please try another one.");
        }
      });
    });

    const deleteGameBtns = document.querySelectorAll(".deleteGameBtn");
    deleteGameBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const gameId = Number(btn.id.slice(4));
        const result = await axios.get(`/games/${gameId}/players`);
        console.log(result.data.length);
        if (result.data.length === 0) {
          await axios.post(`/games/${gameId}/delete`);
        }
      });
    });
    // }
  }
  // setTimeout(showNewGameRooms.bind(), 2000);
}

showNewGameRooms();
