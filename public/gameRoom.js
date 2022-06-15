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
      pName.textContent = player.displayName;
      pRole.textContent = player.userGame.role;
      newPlayerDiv.append(pName);
      newPlayerDiv.append(pRole);
      playersContainer.append(newPlayerDiv);
    }
  });
};

// All players onboard: Game start - NIGHT MODE
const voteVillager = async () => {
  if (playersDiv.length === 3) {
    console.log("Game Start: NIGHT MODE");
    outputMsgContainer.textContent =
      "Game start: NIGHT - Werevolves open your eyes and choose a villager to kill!";
    document.body.style.background = "gray";
  } else {
    outputMsgContainer.textContent =
      "Please wait for more players to join the room.";
  }
  const currentPlayerRole = await axios.get(
    `/games/${gameId}/getCurrentPlayerRole`
  );

  if (currentPlayerRole.data === "Werevolf") {
    // Display all werevolves's role
    const werevolves = document.querySelectorAll(".Werevolf");
    werevolves.forEach((werevolf) => {
      werevolf.style.display = "block";
    });

    // Enable villagers container for click to vote out
    const villagers = document.querySelectorAll(".Villager");
    console.log(villagers);
    villagers.forEach((villager) => {
      villager.addEventListener("click", async (e) => {
        const votedVillager = e.currentTarget;
        votedVillager.style.background = "pink";
        const vote = votedVillager.id;
        const postVote = await axios.post(`/games/${gameId}/vote`, { vote });
        console.log(postVote);
      });
    });

    // Check vote and return result
    const voteResult = await axios.get(`/games/${gameId}/voteResult`);
    console.log(voteResult);
  }
};

// setInterval(displayNewPlayers, 1000);
displayNewPlayers();
voteVillager();
