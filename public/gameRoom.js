const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
let currentPlayersArr = [];

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
    // gameMode = "Night";
    nightMode();
    return;
  }
  outputMsgContainer.textContent =
    "Please wait for more players to join the room.";
  setTimeout(waitForPlayersgameId.bind(null, gameId), 2000);
}

function voteVillager(players, werevolf) {
  let votedVillager = null;
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

        const vote = clickedVillager.id;
        const postVote = await axios.post(`/games/${gameId}/voteVillager`, {
          vote,
        });
      });
    }
  });
}

async function nightMode() {
  outputMsgContainer.textContent =
    "Game start: NIGHT - Werevolves open your eyes and choose a villager to kill!";
  document.body.style.background = "gray";
  // Werewolf select a villager
  const result = await axios.get(`/games/${gameId}/getCurrentPlayer`);
  const currentPlayer = result.data.player;
  if (currentPlayer.role === "Werevolf") {
    const allPlayers = document.querySelectorAll(".player");
    voteVillager(allPlayers, currentPlayer);
  }
}

async function dayMode() {
  document.body.style.background = "none";
  console.log("Day mode now!");
  const result = await axios.get(`/games/${gameId}/voteResult`);
  const diedVillager = result.data.user;
  console.log(diedVillager);
  const diedVillagerDiv = document.getElementById(`${diedVillager.userId}`);
  diedVillagerDiv.style.background = "gray";
  outputMsgContainer.textContent = `Poor villager ${diedVillager.user.displayName} got killed by werevolf! Attention! All villagers!! We must find the bad werewolf and put an end to it.`;
}

waitForPlayersgameId(gameId);
