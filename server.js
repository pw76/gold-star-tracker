
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

const DATA_PATH = path.join(__dirname, "stars.json");

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}), "utf8");
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

app.get("/api/stars", (req, res) => {
  const data = loadData();
  const today = getTodayDate();
  res.json(data[today] || { Peter: [], Katie: [] });
});

app.post("/api/stars", (req, res) => {
  const { person, reason, numStars = 1 } = req.body;
  const data = loadData();
  const today = getTodayDate();

  if (!data[today]) data[today] = { Peter: [], Katie: [] };
  
  for (let i = 0; i < numStars; i++) {
    data[today][person].push(reason || "");
  }

  saveData(data);
  res.json({ success: true });
});

app.get("/api/history", (req, res) => {
  const data = loadData();
  res.json(data);
});



app.put("/api/stars", (req, res) => {
  const { person, index, newReason, newCount } = req.body;
  const data = loadData();
  const today = getTodayDate();

  if (!data[today] || !data[today][person] || !data[today][person][index]) {
    return res.status(400).json({ error: "Entry not found." });
  }

  data[today][person][index] = {
    reason: newReason.trim(),
    count: parseInt(newCount, 10)
  };

  saveData(data);
  res.json({ success: true });
});

app.delete("/api/stars", (req, res) => {
  const { person, index } = req.body;
  const data = loadData();
  const today = getTodayDate();

  if (!data[today] || !data[today][person] || !data[today][person][index]) {
    return res.status(400).json({ error: "Entry not found." });
  }

  data[today][person].splice(index, 1);
  saveData(data);
  res.json({ success: true });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
