const newTableBtn = document.getElementById("newTableBtn");
const tablesDiv = document.getElementById("tablesDiv");

// Create Game Table
newTableBtn.addEventListener("click", async () => {
  console.log("clicked!");
  const newTable = {
    name: document.getElementById("tableName").value,
  };
  console.log(newTable);
  const result = await axios.post("/newTable", newTable);
  console.log(result);
  // Add new table to front end
  const table = result.data;
  const newTableDiv = document.createElement("div");
  newTableDiv.id = `table${table.id}`;
  const tableName = document.createElement("div");
  tableName.className = "tableName";
  tableName.textContent = table.name;
  newTableDiv.append(tableName);
  for (let i = 0; i < 3; i += 1) {
    const seatDiv = document.createElement("div");
    seatDiv.textContent = `Seat ${i + 1}`;
    seatDiv.className = "seat";
    newTableDiv.append(seatDiv);
  }
  tablesDiv.append(newTableDiv);
});
