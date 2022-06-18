const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
const restartBtn = document.getElementById("restartBtn");
restartBtn.style.display = "none";
let currentPlayersArr = [];
let currentPlayer;
async function getCurrentPlayer() {
  const result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  currentPlayer = result.data.player;
}

async function waitForPlayersgameId(gameId) {
  const result = await axios.get(`/games/${gameId}/info`);
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
        pName.textContent = player.displayName;
        pRole.textContent = player.role;
        newPlayerDiv.append(pName);
        newPlayerDiv.append(pRole);
        playersContainer.append(newPlayerDiv);
      }
    });
  }
  if (currentPlayersArr.length === 3) {
    const result = await axios.get(`/games/${gameId}/gameState`);
    let game_state = result.data.game.game_state;
    if (game_state === "Night") {
      console.log("night mode");
      nightMode();
    }
    if (game_state === "Day") {
      console.log("day mode");
      dayMode();
    }
    if (game_state === "Game over") {
      console.log("Game over");
      // If game over, players can restart the game or leave the game
      resetGame();
    }
  }
  outputMsgContainer.textContent =
    "Please wait for more players to join the room.";
  // setTimeout(waitForPlayersgameId.bind(null, gameId), 2000);
}

function voteVillager(players, werevolf) {
  let votedVillager = null;
  let vote = null;
  players.forEach((player) => {
    if (Number(player.id) !== werevolf.userId) {
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
  document.body.style.background = "gray";

  const getActivePlayers = await axios.get(`/games/${gameId}/activePlayers`);
  const activePlayersArr = getActivePlayers.data.playersArr;
  console.log(activePlayersArr);
  const playersDiv = document.querySelectorAll(".player");
  for (let i = 0; i < currentPlayer.length; i += 1) {
    if (!currentPlayer[i].alive) {
      playersDiv[i].style.background = "gray";
      currentPlayer[i].role = activePlayersArr[i].role;
      outputMsgContainer.textContent = `Poor ${currentPlayer[i].role} ${playersDiv[i].textContent} got killed`;
    }
  }
  // Werewolf select a villager
  const activePlayersDiv = [];
  activePlayersArr.forEach((player) => {
    activePlayersDiv.push(document.getElementById(`${player.id}`));
  });

  if (currentPlayer.role === "Werewolf") {
    console.log(currentPlayer);
    voteVillager(activePlayersDiv, currentPlayer);
  }
  const voteResult = await axios.get(`/games/${gameId}/voteVillagerResult`);
  const votedVillager = voteResult.data.user;
  if (votedVillager) {
    const diedVillagerDiv = document.getElementById(`${votedVillager.userId}`);
    diedVillagerDiv.style.background = "red";
  }
  return;
}

function voteWerewolf(players, currentPlayer) {
  let vote = null;
  let votedPlayer = null;
  // console.log(players);
  // console.log(currentPlayer);
  players.forEach((player) => {
    if (Number(player.id) !== currentPlayer.userId && currentPlayer.alive) {
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
  document.body.style.background = "none";
  const result = await axios.get(`/games/${gameId}/activePlayers`);
  const playersDiv = document.querySelectorAll(".player");
  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!currentPlayersArr[i].alive) {
      playersDiv[i].style.background = "gray";
      outputMsgContainer.textContent = `Poor villager ${playersDiv[i].textContent} got killed! Attention! All villagers!! We must find the bad werewolf and put an end to it.`;
    }
  }
  const activePlayersArr = result.data.playersArr;
  // Only active player can vote to kill werewolf
  const activePlayersDiv = [];
  activePlayersArr.forEach((player) => {
    activePlayersDiv.push(document.getElementById(`${player.id}`));
  });
  // Call vote function
  voteWerewolf(activePlayersDiv, currentPlayer);
  const voteResult = await axios.get(`/games/${gameId}/voteWerewolfResult`);
  console.log(voteResult.data.user);

  const votedPlayer = voteResult.data.user;
  console.log(votedPlayer.user.displayName);
  if (votedPlayer) {
    const diedPlayerDiv = document.getElementById(`${votedPlayer.userId}`);
    diedPlayerDiv.style.background = "red";
    if (votedPlayer.role == "Werewolf") {
      outputMsgContainer.textContent = `Hoooooooray!!! Werewolf ${votedPlayer.user.displayName} got killed!`;
    } else {
      outputMsgContainer.textContent = `Oh no!!! Poor villager ${votedPlayer.user.displayName} got killed!`;
    }
  }
  return;
}

async function resetGame() {
  const result = await axios.get(`/games/${gameId}/activePlayers`);
  const players = result.data.players;
  const winners = players[0].role;
  outputMsgContainer.textContent = `Congrats! The winner is ${winners}s! Click the button to play again!`;
  restartBtn.style.display = "block";
  restartBtn.addEventListener("click", async () => {
    try {
      await axios.post(`/games/${gameId}/restartGame`);
    } catch (error) {
      console.log("Error message: ", error);
    }
  });
}

waitForPlayersgameId(gameId);
getCurrentPlayer();
