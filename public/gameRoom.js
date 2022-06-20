const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
restartBtn.style.display = "none";
let currentPlayersArr = [];
let currentPlayer;

async function WaitForPlayers(gameId) {
  let result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  console.log(result.data);
  currentPlayer = {
    id: result.data.player?.userId,
    role: result.data.player?.role,
  };

  result = await axios.get(`/games/${gameId}/info`);
  console.log("players array from db: ", result.data.players.length);

  // if there any new players:
  if (result.data.players.length > currentPlayersArr.length) {
    result.data.players.forEach((player) => {
      if (
        !currentPlayersArr
          .map((p) => {
            return p.id;
          })
          .includes(player.id)
      ) {
        currentPlayersArr.push(player);
        const newPlayerDiv = document.createElement("div");
        const pName = document.createElement("p");
        const pRole = document.createElement("p");
        newPlayerDiv.className = "player";
        newPlayerDiv.id = player.id;
        newPlayerDiv.dataset.you = player.you;
        pName.textContent = player.displayName;
        pRole.textContent = player.role;
        newPlayerDiv.append(pName);
        newPlayerDiv.append(pRole);
        playersContainer.append(newPlayerDiv);
      }
    });
  }

  // If there is a player left the game;
  if (result.data.players.length < currentPlayersArr.length) {
    currentPlayersArr.forEach((player) => {
      if (
        !result.data.players
          .map((p) => {
            return p.id;
          })
          .includes(player.id)
      ) {
        currentPlayersArr.splice(currentPlayersArr.indexOf(player), 1);
        playerDiv = document.getElementById(`${player.id}`);
        playerDiv.remove();
      }
    });
  }

  console.log("current player array: ", currentPlayersArr.length);

  let gameState = result.data.gameState;
  if (gameState === "Waiting") {
    outputMsgContainer.textContent =
      "Please wait for more players to join the room.";
    setTimeout(WaitForPlayers.bind(null, gameId), 2000);
    return;
  }

  if (gameState === "Night") {
    nightMode();
    return;
  }
  if (gameState === "Day") {
    console.log("day mode");
    dayMode();
    return;
  }
  if (gameState === "Game over") {
    console.log("game over");
    restartGame();
    return;
  }
}

function installVoteVillagerClickEvent(playersDivs) {
  let votedVillager = null;
  let vote = null;
  playersDivs.forEach((player) => {
    if (player.dataset.you === "false") {
      player.addEventListener("click", async function click(e) {
        const clickedVillager = e.currentTarget;
        // Choose one villager only
        if (votedVillager === null) {
          clickedVillager.style.background = "red";
          votedVillager = clickedVillager;
        }
        if (votedVillager !== null && votedVillager !== clickedVillager) {
          votedVillager.style.background = "none";
          clickedVillager.style.background = "red";
          votedVillager = clickedVillager;
        }

        vote = clickedVillager.id;
        const postVote = await axios.post(`/games/${gameId}/voteVillager`, {
          vote,
        });
        return vote;
      });
    }
  });
}

async function nightMode() {
  outputMsgContainer.textContent =
    "Game start: NIGHT - Werevolves open your eyes and choose a villager to kill!";
  document.body.style.background = "#FFB6C1";

  const result = await axios.get(`/games/${gameId}/players`);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
  const playersDiv = document.querySelectorAll(".player");

  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      playersDiv[i].style.background = "gray";
      outputMsgContainer.textContent = `Poor villager ${playersDiv[i].textContent} got killed! Attention! All villagers!! We must find the bad werewolf and put an end to it.`;
    }
  }

  // Werewolf select a villager
  if (currentPlayer.role === "Werewolf") {
    const activePlayersDiv = [];
    alive.forEach((playerId) => {
      activePlayersDiv.push(document.getElementById(`${playerId}`));
    });
    installVoteVillagerClickEvent(activePlayersDiv);
  }
  waitForNightToFinish();
}

async function waitForNightToFinish() {
  const result = await axios.get(`/games/${gameId}/info`);
  const game = result.data;
  if (game.gameState === "Night") {
    setTimeout(waitForNightToFinish, 2000);
    return;
  }

  //go to day mode
  if (game.gameState === "Game over") {
    alert("Game over");
    restartGame();
    return;
  }
  if (game.gameState === "Day") {
    dayMode();
    return;
  }
}

function installVoteWerewolfClickEvent(playersDivs) {
  console.log(playersDivs);
  let vote = null;
  let votedPlayer = null;
  playersDivs.forEach((player) => {
    console.log(player);
    if (player.dataset.you === "false") {
      player.addEventListener("click", async function click(e) {
        console.log("you clicked");
        const clickedPlayer = e.currentTarget;
        if (votedPlayer === null) {
          clickedPlayer.style.background = "blue";
          votedPlayer = clickedPlayer;
        }
        if (votedPlayer !== null && votedPlayer !== clickedPlayer) {
          votedPlayer.style.background = "none";
          clickedPlayer.style.background = "blue";
          votedPlayer = clickedPlayer;
        }
        vote = clickedPlayer.id;
        console.log(vote);
        const postVote = await axios.post(`/games/${gameId}/voteWereWolf`, {
          vote,
        });
        return vote;
      });
    }
  });
}

async function dayMode() {
  document.body.style.background = "Yellow";

  const result = await axios.get(`/games/${gameId}/players`);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
  const playersDiv = document.querySelectorAll(".player");

  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      playersDiv[i].style.background = "gray";
      outputMsgContainer.textContent = `Poor villager ${playersDiv[i].textContent} got killed! Attention! All villagers!! We must find the bad werewolf and put an end to it.`;
    }
  }

  // Only active player can vote to kill werewolf
  const activePlayersDiv = [];
  alive.forEach((id) => {
    activePlayersDiv.push(document.getElementById(`${id}`));
  });

  // Call vote function
  if (alive.includes(currentPlayer.id)) {
    installVoteWerewolfClickEvent(activePlayersDiv);
  }

  waitForDayToFinish();
}

async function waitForDayToFinish() {
  const result = await axios.get(`/games/${gameId}/info`);
  const game = result.data;
  if (game.gameState === "Day") {
    setTimeout(waitForDayToFinish, 2000);
    return;
  }

  //go to day mode
  if (game.gameState === "Game over") {
    alert("Game over");
    restartGame();
    return;
  }
  if (game.gameState === "Night") {
    nightMode();
    return;
  }
}

async function restartGame() {
  const result = await axios.get(`/games/${gameId}/players`);
  const players = result.data;
  let alivePlayers = players.filter((p) => p.alive);
  const winners = alivePlayers[0].role;
  outputMsgContainer.textContent = `Congrats! The winner is ${winners}! Click the button to play again!`;
  restartBtn.style.display = "block";
  restartBtn.addEventListener("click", async () => {
    try {
      await axios.post(`/games/${gameId}/restartGame`);
      const playersDiv = document.querySelectorAll(".player");
      playersDiv.forEach((player) => {
        player.style.background = "none";
      });
      outputMsgContainer.textContent =
        "Wait for all players click restart button.";
      restartBtn.style.display = "none";
    } catch (error) {
      console.log("Error message: ", error);
    }
  });
  waitForAllPlayerRestartGame();
}

async function waitForAllPlayerRestartGame() {
  const result = await axios.get(`/games/${gameId}/info`);
  const game = result.data;
  if (game.gameState === "Game over") {
    setTimeout(waitForAllPlayerRestartGame, 2000);
    return;
  }
  if (game.gameState === "Night") {
    nightMode();
    return;
  }
}

async function quitGame() {
  const result = await axios.post(`/games/${gameId}/quitGame`);
  const leavedPlayer = result.data.leavedPlayer.user;
  console.log(leavedPlayer);
  const leavedPlayerDiv = document.getElementById(`${leavedPlayer.id}`);
  leavedPlayerDiv.remove();
  outputMsgContainer.textContent = `${leavedPlayer.displayName} left this room.`;
  window.location.href = `/gameHall`; // Redirect to game hall for current user
  updateGameRoomStatus();
}

quitBtn.addEventListener("click", quitGame);
WaitForPlayers(gameId);
