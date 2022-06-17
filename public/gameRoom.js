const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
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
    // gameMode = "Night";
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
          clickedVillager.style.background = "pink";
          votedVillager = clickedVillager;
        }
        if (votedVillager !== null && votedVillager !== clickedVillager) {
          votedVillager.style.background = "none";
          clickedVillager.style.background = "pink";
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
  let vote;
  outputMsgContainer.textContent =
    "Game start: NIGHT - Werevolves open your eyes and choose a villager to kill!";
  document.body.style.background = "gray";
  // Werewolf select a villager
  // const result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  // const currentPlayer = result.data.player;
  if (currentPlayer.role === "Werevolf") {
    const allPlayers = document.querySelectorAll(".player");
    voteVillager(allPlayers, currentPlayer);
  }
  console.log("first");
  const voteResult = await axios.get(`/games/${gameId}/voteResult`);
  console.log(voteResult);
  console.log("second");
  const votedVillager = voteResult.data.user;
  console.log(votedVillager);
  if (votedVillager) {
    const diedVillagerDiv = document.getElementById(`${votedVillager.userId}`);
    console.log(diedVillagerDiv);
    diedVillagerDiv.style.background = "red";
    outputMsgContainer.textContent = `Poor villager ${votedVillager.user.displayName} got killed by werevolf! Attention! All villagers!! We must find the bad werewolf and put an end to it.`;
  }
  return;
}

function voteWerewolf(players, currentPlayer) {
  let vote = null;
  let votedWerewolf = null;
  players.forEach((player) => {
    if (Number(player.id) !== currentPlayer.userId) {
      player.addEventListener("click", async function click(e) {
        console.log("you clicked");
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
    }
  }
  // console.log(result.data.playersArr);
  const activePlayersArr = result.data.playersArr;
  console.log(activePlayersArr);
  // console.log(currentPlayersArr);
  console.log(currentPlayer);
  // Only active player can vote to kill werewolf
  const activePlayersDiv = [];
  activePlayersArr.forEach((player) => {
    activePlayersDiv.push(document.getElementById(`${player.id}`));
  });
  console.log(activePlayersDiv);
  voteWerewolf(activePlayersDiv, currentPlayer);
}

waitForPlayersgameId(gameId);
getCurrentPlayer();
