
async function fetchToday() {
  const res = await fetch("/api/stars");
  const data = await res.json();
  updateCounts(data);
  updateTodayList(data);
}

async function addStar(person) {
  const reasonInput = document.getElementById(`${person.toLowerCase()}-reason`);
  const starsSelect = document.getElementById(`${person.toLowerCase()}-stars`);
  const reason = reasonInput.value.trim();
  const numStars = parseInt(starsSelect.value) || 1;
  
  reasonInput.value = "";
  starsSelect.value = 1;

  await fetch("/api/stars", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person, reason, numStars })
  });

  fetchToday();
  

  // Aggregate weekly and monthly totals
  const weekly = {};
  const monthly = {};

  Object.entries(data).forEach(([date, entries]) => {
    const d = new Date(date);
    const week = `${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`;
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!weekly[week]) weekly[week] = { Peter: 0, Katie: 0 };
    if (!monthly[month]) monthly[month] = { Peter: 0, Katie: 0 };

    ['Peter', 'Katie'].forEach(person => {
      weekly[week][person] += entries[person].length;
      monthly[month][person] += entries[person].length;
    });
  });

  const totalsDiv = document.createElement("div");
  totalsDiv.innerHTML = "<h3>Weekly Totals</h3>";
  Object.entries(weekly).sort().forEach(([week, totals]) => {
    totalsDiv.innerHTML += `<p><strong>${week}</strong> — Peter: ${totals.Peter}, Katie: ${totals.Katie}</p>`;
  });

  totalsDiv.innerHTML += "<h3>Monthly Totals</h3>";
  Object.entries(monthly).sort().forEach(([month, totals]) => {
    totalsDiv.innerHTML += `<p><strong>${month}</strong> — Peter: ${totals.Peter}, Katie: ${totals.Katie}</p>`;
  });

  container.appendChild(totalsDiv);

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }


fetchHistory();
}

function updateCounts(data) {
  document.getElementById("peter-count").textContent = data.Peter.length;
  document.getElementById("katie-count").textContent = data.Katie.length;
}

function updateTodayList(data) {
  const list = document.getElementById("today-list");
  list.innerHTML = "";
  
  const totalStars = data.Peter.length + data.Katie.length;
  
  if (totalStars === 0) {
    const li = document.createElement("li");
    li.textContent = "No stars awarded today";
    li.style.fontStyle = "italic";
    li.style.color = "#666";
    list.appendChild(li);
  } else {
    ["Peter", "Katie"].forEach(person => {
      data[person].forEach(reason => {
        const li = document.createElement("li");
        li.textContent = `${person}: ⭐ ${reason}`;
        list.appendChild(li);
      });
    });
  }
}

async function fetchHistory() {
  const res = await fetch("/api/history");
  const data = await res.json();
  const container = document.getElementById("history");
  container.innerHTML = "";

  Object.keys(data).reverse().forEach(date => {
    const summary = document.createElement("details");
    const summaryTitle = document.createElement("summary");
    summaryTitle.textContent = `${date} — Peter: ${data[date].Peter.length}, Katie: ${data[date].Katie.length}`;
    summary.appendChild(summaryTitle);

    const ul = document.createElement("ul");
    ["Peter", "Katie"].forEach(person => {
      const historyMap = {};
      data[date][person].forEach(reason => {
        const key = reason.trim();
        historyMap[key] = (historyMap[key] || 0) + 1;
      });

      for (const [reason, count] of Object.entries(historyMap)) {
        const li = document.createElement("li");
        const stars = "⭐".repeat(count);
        li.textContent = count > 1 ? `${person}: ${stars} ${reason}` : `${person}: ⭐ ${reason}`;
        ul.appendChild(li);
      }
    });

    summary.appendChild(ul);
    container.appendChild(summary);
  });
}

fetchToday();


  // Aggregate weekly and monthly totals
  const weekly = {};
  const monthly = {};

  Object.entries(data).forEach(([date, entries]) => {
    const d = new Date(date);
    const week = `${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`;
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!weekly[week]) weekly[week] = { Peter: 0, Katie: 0 };
    if (!monthly[month]) monthly[month] = { Peter: 0, Katie: 0 };

    ['Peter', 'Katie'].forEach(person => {
      weekly[week][person] += entries[person].length;
      monthly[month][person] += entries[person].length;
    });
  });

  const totalsDiv = document.createElement("div");
  totalsDiv.innerHTML = "<h3>Weekly Totals</h3>";
  Object.entries(weekly).sort().forEach(([week, totals]) => {
    totalsDiv.innerHTML += `<p><strong>${week}</strong> — Peter: ${totals.Peter}, Katie: ${totals.Katie}</p>`;
  });

  totalsDiv.innerHTML += "<h3>Monthly Totals</h3>";
  Object.entries(monthly).sort().forEach(([month, totals]) => {
    totalsDiv.innerHTML += `<p><strong>${month}</strong> — Peter: ${totals.Peter}, Katie: ${totals.Katie}</p>`;
  });

  container.appendChild(totalsDiv);

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }


fetchHistory();


function editEntry(person, index, currentReason, currentCount) {
  const newReason = prompt("Edit reason:", currentReason);
  if (newReason === null) return;
  const newCount = prompt("Edit number of stars:", currentCount);
  if (newCount === null || isNaN(newCount) || newCount < 1) return;

  fetch("/api/stars", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person, index, newReason, newCount })
  }).then(() => {
    fetchToday();
    fetchHistory();
  });
}

function deleteEntry(person, index) {
  if (!confirm("Delete this star entry?")) return;

  fetch("/api/stars", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person, index })
  }).then(() => {
    fetchToday();
    fetchHistory();
  });
}
