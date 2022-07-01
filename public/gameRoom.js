const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
const quitBtn = document.getElementById("quitBtn");
let currentPlayersArr = [];
let currentPlayer;
const numOfPlayers = 4;

async function WaitForPlayers(gameId) {
  quitBtn.addEventListener("click", quitGame);
  let result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  currentPlayer = {
    id: result.data.player?.userId,
    role: result.data.player?.role,
  };
  result = await axios.get(`/games/${gameId}/info`);
<<<<<<< HEAD

=======
>>>>>>> feature/sixPlayers
  // If there any new players:
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
<<<<<<< HEAD
        const pMsg = document.createElement("p");
        outputMsgContainer.append(pMsg);
=======
>>>>>>> feature/sixPlayers

        if (result.data.players.length < numOfPlayers) {
          outputMsgContainer.textContent =
            "Please wait for more players to join the room.";
        }
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

  let gameState = result.data.gameState;
  if (gameState === "Waiting") {
    setTimeout(WaitForPlayers.bind(null, gameId), 2000);
    return;
  }

  if (gameState === "Night") {
    nightMode();
    return;
  }
  if (gameState === "Day") {
    dayMode();
    return;
  }
  if (gameState === "Game over") {
    showWinnerInfo();
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
          votedVillager.style.background = "#36273e";
          clickedVillager.style.background = "red";
          votedVillager = clickedVillager;
        }

        vote = clickedVillager.id;
        const postVote = await axios.post(`/games/${gameId}/voteVillager`, {
          vote,
        });
        return;
      });
    }
  });
}

async function nightMode() {
  quitBtn.style.display = "none";
  outputMsgContainer.textContent = "NIGHT - Werewolf pick a villager to kill!";
  document.body.style.background = "#4b5875";
  const result = await axios.get(`/games/${gameId}/players`);
  console.log(result.data);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
<<<<<<< HEAD
  console.log(alive);
  const playersDiv = document.querySelectorAll(".player");

  //******************************************************** */
  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      playersDiv[i].style.background = "gray";
      if (currentPlayer.id !== currentPlayersArr[i].id) {
        const pMsg = document.createElement("p");
        const p2 = document.createElement("p");
        const pRole = document.createElement("p");
        pMsg.textContent = `Night: Poor ${playersDiv[i].textContent} got killed!`;
        for (let j = 0; j < result.data.length; j++) {
          if (currentPlayersArr[i].id === result.data[j].userId) {
            pRole.textContent = result.data[j].role; // Can use villager image as background
          }
        }
        outputMsgContainer.append(pMsg);
        playersDiv[i].append(pRole);
      } else {
        const p3 = document.createElement("p");
        p3.textContent += `Sorry, you got killed!`;
        outputMsgContainer.append(p3);
      }
    }
  }
  //*************************************** */
=======
  const dead = result.data.filter((p) => !p.alive);

  const playersDiv = document.querySelectorAll(".player");

  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      if (currentPlayer.id !== currentPlayersArr[i].id) {
        const pRole = document.createElement("p");
        outputMsgContainer.textContent = `Poor ${playersDiv[i].textContent} got killed!`;
        for (let j = 0; j < dead.length; j++) {
          if (currentPlayersArr[i].id === dead[j].userId) {
            pRole.textContent = dead[j].role; // Can use villager image as background
            if (dead[j].role === "Villager") {
              playersDiv[i].style.backgroundImage =
                "url('../imgs/villager.jpg')";
              playersDiv[i].style.color = "white";
            } else {
              playersDiv[i].style.backgroundImage =
                "url('../imgs/werewolf.jpg')";
            }
            playersDiv[i].style.backgroundSize = "100px 100px";
          }
        }
        playersDiv[i].append(pRole);
      } else {
        outputMsgContainer.textContent += `Sorry, you got killed!`;
        if (currentPlayer.role === "Villager") {
          playersDiv[i].style.backgroundImage = "url('../imgs/villager.jpg')";
          playersDiv[i].style.color = "white";
        } else {
          playersDiv[i].style.backgroundImage = "url('../imgs/werewolf.jpg')";
        }
        playersDiv[i].style.backgroundSize = "100px 100px";
      }
    }
  }
>>>>>>> feature/sixPlayers

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
    showWinnerInfo();
    return;
  }
  if (game.gameState === "Day") {
    dayMode();
    return;
  }
}

function installVoteWerewolfClickEvent(playersDivs) {
  let vote = null;
  let votedPlayer = null;
  playersDivs.forEach((player) => {
    if (player.dataset.you === "false") {
      player.addEventListener("click", async function click(e) {
        const clickedPlayer = e.currentTarget;
        if (votedPlayer === null) {
          clickedPlayer.style.background = "red";
          votedPlayer = clickedPlayer;
        }
        if (votedPlayer !== null && votedPlayer !== clickedPlayer) {
          votedPlayer.style.background = "#36273e";
          clickedPlayer.style.background = "red";
          votedPlayer = clickedPlayer;
        }
        vote = clickedPlayer.id;
        const postVote = await axios.post(`/games/${gameId}/voteWereWolf`, {
          vote,
        });
        return postVote;
      });
    }
  });
}

async function dayMode() {
  quitBtn.style.display = "none";
  document.body.style.background = "#fcd9b6";
  const result = await axios.get(`/games/${gameId}/players`);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
  const dead = result.data.filter((p) => !p.alive);
  const playersDiv = document.querySelectorAll(".player");
<<<<<<< HEAD
  console.log(currentPlayersArr);
=======

>>>>>>> feature/sixPlayers
  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      if (currentPlayer.id !== currentPlayersArr[i].id) {
<<<<<<< HEAD
        const pMsg = document.createElement("p");
        const pRole = document.createElement("p");
        pMsg.textContent = `Day: Poor villager ${playersDiv[i].textContent} got killed! Now let's find out who's the werewolf!`;
        pRole.textContent = "Villager"; // Can use villager image as background
        outputMsgContainer.append(pMsg);
=======
        const pRole = document.createElement("p");
        outputMsgContainer.textContent = `Day - Poor villager ${playersDiv[i].textContent} got killed! Now let's find out who's the werewolf!`;
        pRole.textContent = "Villager";

        // Can use villager image as background
>>>>>>> feature/sixPlayers
        playersDiv[i].append(pRole);
      } else {
        outputMsgContainer.textContent = `Sorry, you got killed by werewolf!`;
      }
      playersDiv[i].style.backgroundImage = "url('../imgs/villager.jpg')";
      playersDiv[i].style.backgroundSize = "100px 100px";
      playersDiv[i].style.color = "white";
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

  if (game.gameState === "Game over") {
    showWinnerInfo();
    return;
  }
  if (game.gameState === "Night") {
    nightMode();
    return;
  }
}

async function showWinnerInfo() {
  document.body.style.background = "none";
  const result = await axios.get(`/games/${gameId}/players`);
  const players = result.data;
  let alivePlayers = players.filter((p) => p.alive);
<<<<<<< HEAD
  console.log(alivePlayers);
  if (alivePlayers.length > 1) {
=======
  const werewolves = alivePlayers.filter((p) => p.role === "Werewolf");
  const villagers = alivePlayers.filter((p) => p.role === "Villager");

  if (werewolves.length === 0) {
    alert("Villagers Won!");
    initGame();
    return;
  } else if (villagers.length === 0) {
    alert("Werewolves Won!");
    initGame();
    return;
  } else {
>>>>>>> feature/sixPlayers
    alert("Game over! No winner.");
    initGame();
    return;
  }
}

async function initGame() {
  await axios.post(`/games/${gameId}/init`);
  window.location.href = `/gameHall`;
  return;
}

async function quitGame() {
  const result = await axios.post(`/games/${gameId}/quitGame`);
  const leavedPlayer = result.data.leavedPlayer.user;
  const leavedPlayerDiv = document.getElementById(`${leavedPlayer.id}`);
  leavedPlayerDiv.remove();
  outputMsgContainer.textContent = `${leavedPlayer.displayName} left this room.`;
  window.location.href = `/gameHall`; // Redirect to game hall
  return;
}

WaitForPlayers(gameId);
