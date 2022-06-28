const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
const quitBtn = document.getElementById("quitBtn");
let currentPlayersArr = [];
let currentPlayer;
const numOfPlayers = 4;
// let killedPlayers = [];

async function WaitForPlayers(gameId) {
  quitBtn.addEventListener("click", quitGame);
  let result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  currentPlayer = {
    id: result.data.player?.userId,
    role: result.data.player?.role,
  };

  result = await axios.get(`/games/${gameId}/info`);
  console.log(result);
  // let allPlayers = result.data.players;
  // allPlayers.map((player) => {
  //   !player.alive ? killedPlayers.push(player) : 0;
  // });

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
        const pMsg = document.createElement("p");
        // pMsg.textContent = `Player ${player.displayName} has joined.`;
        outputMsgContainer.append(pMsg);

        if (result.data.players.length < numOfPlayers) {
          const pWait = document.createElement("p");
          pWait.textContent = "Please wait for more players to join the room.";
          outputMsgContainer.append(pWait);
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
    // setTimeout(WaitForPlayers.bind(null, gameId), 2000);
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
  quitBtn.style.display = "none";
  const p = document.createElement("p");
  p.textContent = "Game start: NIGHT - Werewolf pick a villager to kill!";
  outputMsgContainer.append(p);

  document.body.style.background = "#4b5875";
  const result = await axios.get(`/games/${gameId}/players`);
  console.log("night mode: line 129, ", result);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
  const dead = result.data.filter((p) => !p.alive);
  console.log(dead);

  const playersDiv = document.querySelectorAll(".player");
  //******************************************************** */
  // console.log("night:", killedPlayers);

  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      playersDiv[i].style.background = "gray";
      if (currentPlayer.id !== currentPlayersArr[i].id) {
        const pMsg = document.createElement("p");
        const pRole = document.createElement("p");
        pMsg.textContent = `Poor ${playersDiv[i].textContent} got killed!`;
        for (let j = 0; j < dead.length; j++) {
          if (currentPlayersArr[i].id === dead[j].userId) {
            pRole.textContent = dead[j].role; // Can use villager image as background
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
    // setTimeout(waitForNightToFinish, 2000);
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
  // console.log(playersDivs);
  let vote = null;
  let votedPlayer = null;
  playersDivs.forEach((player) => {
    // console.log(player);
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
        console.log(postVote.data);
        return;
      });
    }
  });
}

async function dayMode() {
  quitBtn.style.display = "none";
  document.body.style.background = "#fcd9b6";
  const result = await axios.get(`/games/${gameId}/players`);
  console.log("line 225 day mode: ", result);
  const alive = result.data.filter((p) => p.alive).map((p) => p.userId);
  const dead = result.data.filter((p) => !p.alive);
  console.log(dead);
  const playersDiv = document.querySelectorAll(".player");
  // console.log("day mode: ", killedPlayers);

  for (let i = 0; i < currentPlayersArr.length; i += 1) {
    if (!alive.includes(currentPlayersArr[i].id)) {
      playersDiv[i].style.background = "gray";
      if (currentPlayer.id !== currentPlayersArr[i].id) {
        const pMsg = document.createElement("p");
        const p2 = document.createElement("p");
        const pRole = document.createElement("p");
        pMsg.textContent = `Day: Poor villager ${playersDiv[i].textContent} got killed! Now let's find out who's the werewolf!`;
        // p2.textContent = "Let's find out who's the bad werewolf!";
        pRole.textContent = "Villager"; // Can use villager image as background
        outputMsgContainer.append(pMsg);
        // outputMsgContainer.append(p2);
        playersDiv[i].append(pRole);
      } else {
        const p3 = document.createElement("p");
        p3.textContent += `Sorry, you got killed by werewolf!`;
        outputMsgContainer.append(p3);
      }
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
    // setTimeout(waitForDayToFinish, 2000);
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
  console.log(result.data);
  const players = result.data;
  let alivePlayers = players.filter((p) => p.alive);
  const werewolves = alivePlayers.filter((p) => p.role === "Werevolf");
  const villagers = alivePlayers.filter((p) => p.role === "Villager");
  console.log("werewolf:", werewolves);
  console.log("villager:", villagers);

  if (werewolves.length === 0) {
    alert("Villagers Won!");
    initGame();
    return;
  } else if (villagers.length === 0) {
    alert("Werewolves Won!");
    initGame();
    return;
  } else {
    alert("Game over! No winner.");
    initGame();
    return;
  }

  ///////////////////////////////////////
  // if (alivePlayers.length > 1) {
  //   alert("Game over! No winner.");
  //   initGame();
  //   return;
  // }
  // const winners = alivePlayers[0].role;
  // console.log(winners);
  // const pWinner = document.createElement("p");
  // pWinner.textContent = `Congrats! The winner is ${winners}! Click the button to play again!`;
  // outputMsgContainer.append(pWinner);
  // alert(`Congrats! The winner is ${winners}.`);
  // initGame();
}

async function initGame() {
  await axios.post(`/games/${gameId}/init`);
  window.location.href = `/gameHall`;
}

async function quitGame() {
  const result = await axios.post(`/games/${gameId}/quitGame`);
  const leavedPlayer = result.data.leavedPlayer.user;
  console.log(leavedPlayer);
  const leavedPlayerDiv = document.getElementById(`${leavedPlayer.id}`);
  leavedPlayerDiv.remove();
  outputMsgContainer.textContent = `${leavedPlayer.displayName} left this room.`;
  window.location.href = `/gameHall`; // Redirect to game hall
}

WaitForPlayers(gameId);
