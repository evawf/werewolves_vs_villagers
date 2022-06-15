const playersContainer = document.getElementById("playersContainer");
const outputMsgContainer = document.getElementById("outputMsg");
const gameId = document.getElementById("gameId").value;
const currentPlayersArr = [];
const playersDiv = document.querySelectorAll(".player");
playersDiv.forEach((playerDiv) => {
  let playerId = Number(playerDiv.id);
  currentPlayersArr.push(playerId);
});

// Add new player to front end
const displayNewPlayers = async () => {
  const result = await axios.get(`/games/${gameId}/getPlayers`);
  const players = result.data;
  players.forEach((player) => {
    if (!currentPlayersArr.includes(player.id)) {
      const newPlayerDiv = document.createElement("div");
      const pName = document.createElement("p");
      const pRole = document.createElement("p");
      newPlayerDiv.className = "player";
      newPlayerDiv.id = player.id;
      pName.textContent = "player.displayName";
      pRole.textContent = "player.userGame.role";
      newPlayerDiv.append(pName);
      newPlayerDiv.append(pRole);
      playersContainer.append(newPlayerDiv);
    }
  });
};

// All players onboard: Game start - NIGHT MODE
const voteVillageOut = () => {
  if (playersDiv.length === 3) {
    console.log("Game Start: NIGHT MODE");
    outputMsgContainer.textContent =
      "Game start: NIGHT - Werevolves wakeup now! Choose a villager to kill!";
  } else {
    outputMsgContainer.textContent =
      "Please wait for more players to join the room.";
  }
};

displayNewPlayers();
voteVillageOut();
