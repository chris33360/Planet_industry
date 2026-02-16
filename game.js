/* ============================
   RESSOURCES
============================ */
let revealedCount = 0;
const revealCost = 2;
const resources = {
  wood:      { name: "Bois", emoji: "🪵", amount: 100 },
  iron:      { name: "Fer", emoji: "🔘", amount: 80 },
  stone:     { name: "Pierre", emoji: "🪨", amount: 50 },
  copper:    { name: "Cuivre", emoji: "🟠", amount: 0 },
  coal:      { name: "Charbon", emoji: "⚫", amount: 10 },
  oil:       { name: "Pétrole", emoji: "🛢️", amount: 0 },
  aluminum:  { name: "Aluminium", emoji: "🧪", amount: 0 },
  water:     { name: "Eau", emoji: "💧", amount: 0 },
  uranium:   { name: "Uranium", emoji: "☢️", amount: 0 },
  crystal:   { name: "Cristal", emoji: "💎", amount: 0 },
  glass:     { name: "Verre", emoji: "🧊", amount: 0 },
  energy:    { name: "Énergie", emoji: "⚡", amount: 0 } // non stockable
};

/* ============================
   DÉBITS PAR SECONDE
============================ */

const productionRates = {
  water: 2,
  oil: 0.5,
  wood: 2,
  stone: 1.5,
  copper: 0.6,
  aluminum: 0.5,
  crystal: 0.6,
  uranium: 0.2,
  iron: 0.8
};

/* ============================
   MACHINES
============================ */

const machines = [
  {
    id: "sawmill",
    name: "Scierie",
    produces: "wood",
    emoji: "🪚",
    needs: "forest",
    cost: { wood: 30, iron: 10 },
    power: 0.8
  },
  {
    id: "extractor",
    name: "Extracteur",
    emoji: "💧",
    needs: ["water", "oil"],
    cost: { aluminum: 30, iron: 20 },
    power: 1.2
  },
  {
    id: "drill",
    name: "Foreuse",
    emoji: "⛏️",
    needs: ["iron", "stone", "copper", "aluminum", "crystal", "uranium"],
    cost: { iron: 30 },
    power: 1.2
  },
  {
    id: "wood_to_coal",
    name: "Carboniseur",
    produces: "coal",
    consumes: { wood: 1 },
    produceRate: 0.8,
    emoji: "🔥",
    needs: "none",
    cost: { wood: 20, stone: 10 },
    power: 0.3
  },
  {
    id: "coal_powerplant",
    name: "Centrale à charbon",
    produces: "energy",
    consumes: { coal: 1 },
    produceRate: 3,
    emoji: "🏭",
    needs: "none",
    cost: { iron: 40, stone: 20 },
    power: 0
  },

  /* === VERRERIE === */
  {
    id: "glassworks",
    name: "Verrerie",
    emoji: "🧊",
    needs: "stone",
    consumes: { crystal: 0.8 },
    produces: "glass",
    produceRate: 1.2,
    cost: { aluminum: 40, stone: 20 },
    power: 0.8
  },

  /* === PANNEAU SOLAIRE === */
  {
    id: "solar_panel",
    name: "Panneau solaire",
    emoji: "🔆",
    needs: "none",
    produces: "energy",
    produceRate: 0.6,
    cost: { aluminum: 5, glass: 20 },
    power: 0
  },

  /* === TOUR SOLAIRE === */
  {
    id: "solar_tower",
    name: "Tour solaire",
    emoji: "🌞",
    needs: "none",
    produces: "energy",
    cost: { aluminum: 100, glass: 20, stone: 20 },
    power: 0
  }
];

let selectedMachine = null;

/* ============================
   DIMENSIONS
============================ */

let gridWidth = 50;
let gridHeight = 25;

/* ============================
   GÉNÉRATION NATURELLE
============================ */

const weights = {
  none: 0.66,
  forest: 0.10,
  iron: 0.04,
  stone: 0.04,
  copper: 0.03,
  oil: 0.03,
  water: 0.05,
  aluminum: 0.02,
  crystal: 0.01,
  uranium: 0.006
};

const clusterResources = ["forest", "iron", "stone", "copper", "water"];
const isolatedResources = ["aluminum", "crystal", "uranium"];

const clusterCount = {
  forest: 7,
  iron: 4,
  stone: 4,
  copper: 3,
  water: 3
};

const spreadChance = 0.30;

function generateNaturalMap() {
  const map = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => "none")
  );

  for (const res of clusterResources) {
    const count = clusterCount[res];

    for (let i = 0; i < count; i++) {
      const cx = Math.floor(Math.random() * gridWidth);
      const cy = Math.floor(Math.random() * gridHeight);

      map[cy][cx] = res;

      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.random() < spreadChance) {
            const nx = cx + dx;
            const ny = cy + dy;

            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              map[ny][nx] = res;
            }
          }
        }
      }
    }
  }

  for (const res of isolatedResources) {
    const totalCells = gridWidth * gridHeight;
    const targetCount = Math.floor(weights[res] * totalCells);

    let placed = 0;

    while (placed < targetCount) {
      const x = Math.floor(Math.random() * gridWidth);
      const y = Math.floor(Math.random() * gridHeight);

      if (map[y][x] === "none") {
        map[y][x] = res;
        placed++;
      }
    }
  }

  const isolatedCommon = ["iron", "copper", "water", "aluminum", "forest"];

  for (const res of isolatedCommon) {
    const extra = Math.floor((gridWidth * gridHeight) * 0.002);

    let placed = 0;

    while (placed < extra) {
      const x = Math.floor(Math.random() * gridWidth);
      const y = Math.floor(Math.random() * gridHeight);

      if (map[y][x] === "none") {
        map[y][x] = res;
        placed++;
      }
    }
  }

  const oilCount = Math.floor(weights.oil * gridWidth * gridHeight);
  let oilPlaced = 0;

  while (oilPlaced < oilCount) {
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);

    if (map[y][x] === "none") {
      map[y][x] = "oil";
      oilPlaced++;
    }
  }

  return map;
}

const resourceEmojis = {
  none: "",
  forest: "🌲",
  iron: "🔘",
  stone: "🪨",
  copper: "🟠",
  aluminum: "🧪",
  crystal: "💎",
  uranium: "☢️",
  oil: "🛢️",
  water: "💧"
};

/* ============================
   GRILLE + BROUILLARD
============================ */

let grid = generateNaturalMap().map(row =>
  row.map(natural => ({
    machine: null,
    natural,
    revealed: false
  }))
);

function revealStartingArea() {
  const cx = Math.floor(gridWidth / 2);
  const cy = Math.floor(gridHeight / 2);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx;
      const y = cy + dy;

      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[y][x].revealed = true;
      }
    }
  }
}

revealStartingArea();
  /* ============================
  Tooltips
============================ */
function getMachineTooltip(machine) {
  let text = `${machine.emoji} ${machine.name}\n`;

  if (machine.cost) {
    text += `\nCoût : `;
    text += Object.entries(machine.cost)
      .map(([res, amt]) => `${resources[res].emoji}${amt}`)
      .join(" ");
  }

  if (machine.power > 0) {
    text += `\nConsomme ⚡ ${machine.power}/s`;
  }

  if (machine.produces === "energy") {
    text += `\nProduit ⚡ ${machine.produceRate || "variable"}/s`;
  }

  if (machine.consumes) {
    text += `\nConsomme : `;
    text += Object.entries(machine.consumes)
      .map(([res, amt]) => `${resources[res].emoji}${amt}/s`)
      .join(" ");
  }

  if (machine.produces && machine.produces !== "energy") {
    text += `\nProduit : ${resources[machine.produces].emoji}${machine.produceRate || productionRates[machine.produces]}/s`;
  }

  if (machine.id === "solar_tower") {
    text += `\nBonus : +1.8⚡ par panneau adjacent`;
  }

  return text;
}
 /* ============================
  Fonction pour calculer le coût dynamique
============================ */ 
function getRevealCost() {
  return Math.ceil(revealCost * Math.pow(1.2, revealedCount));
}

/* ============================
   AJOUT : BOIS + FER AU DÉPART
============================ */

function placeStartingResources() {
  const revealedCells = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (grid[y][x].revealed && grid[y][x].natural === "none") {
        revealedCells.push({ x, y });
      }
    }
  }

  if (revealedCells.length < 2) return;

  revealedCells.sort(() => Math.random() - 0.5);

  const woodCell = revealedCells[0];
  grid[woodCell.y][woodCell.x].natural = "forest";

  const ironCell = revealedCells[1];
  grid[ironCell.y][ironCell.x].natural = "iron";
}

placeStartingResources();

/* ============================
   BROUILLARD
============================ */

function revealAdjacent(x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
        grid[ny][nx].revealed = true;
      }
    }
  }
}

function isAdjacentToRevealed(x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
        if (grid[ny][nx].revealed) return true;
      }
    }
  }
  return false;
}

/* ============================
   RENDU UI
============================ */

function computeRatePerSecond(resourceId) {

  /* === Calcul du ratio énergétique === */

  let energyProduced = 0;
  let energyConsumed = 0;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      if (machine.power > 0) {
        energyConsumed += machine.power;
      }

      if (machine.produces === "energy") {
        if (machine.id === "solar_panel") {
          energyProduced += 0.6;
        }
        else if (machine.id === "coal_powerplant") {
          if (resources.coal.amount >= 1) {
            energyProduced += 3;
          }
        }
        else if (machine.id === "solar_tower") {
          let bonus = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                if (grid[ny][nx].machine === "solar_panel") {
                  bonus += 3 * 0.6;
                }
              }
            }
          }
          energyProduced += bonus;
        }
      }
    }
  }

  let energyRatio = 1;
  if (energyProduced < energyConsumed) {
    energyRatio = energyProduced / energyConsumed;
  }

  /* === Calcul du rendement réel === */

  let rate = 0;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      /* === Extracteur === */
      if (machine.id === "extractor") {
        if (resourceId === "water" && grid[y][x].natural === "water") {
          rate += 2 * energyRatio;
        }
        if (resourceId === "oil" && grid[y][x].natural === "oil") {
          rate += 0.5 * energyRatio;
        }
      }

      /* === Foreuse === */
      else if (machine.id === "drill") {
        const nat = grid[y][x].natural;
        const valid = ["iron", "stone", "copper", "aluminum", "crystal", "uranium"];
        if (valid.includes(nat) && nat === resourceId) {
          rate += productionRates[nat] * energyRatio;
        }
      }

      /* === Machines qui consomment === */
      else if (machine.consumes && machine.produces === resourceId) {
        let canRun = true;
        for (const [res, amount] of Object.entries(machine.consumes)) {
          if (resources[res].amount < amount) {
            canRun = false;
            break;
          }
        }
        if (canRun) {
          rate += machine.produceRate * energyRatio;
        }
      }

         /* === Machines simples === */
      else if (machine.produces === resourceId && !machine.consumes) {
        const rateBase = productionRates[machine.produces] || 0;
        rate += rateBase * energyRatio;
      }
    }
  }

  /* === Consommations visibles === */
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      if (machine.consumes && machine.consumes[resourceId]) {
        rate -= machine.consumes[resourceId] * energyRatio;
      }
    }
  }

  return rate;
}

function renderResources() {
  const div = document.getElementById("resources");
  div.innerHTML = "";

  /* Calcul énergie instantanée */
  let energyProduced = 0;
  let energyConsumed = 0;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      if (machine.power > 0) energyConsumed += machine.power;

      if (machine.id === "solar_panel") {
        energyProduced += 0.6;
      }
      else if (machine.id === "coal_powerplant") {
        if (resources.coal.amount >= 1) energyProduced += 3;
      }
      else if (machine.id === "solar_tower") {
        let bonus = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              if (grid[ny][nx].machine === "solar_panel") {
                bonus += 3 * 0.6;
              }
            }
          }
        }
        energyProduced += bonus;
      }
    }
  }

  const netEnergy = energyProduced - energyConsumed;

  /* Affichage des ressources */
  Object.entries(resources).forEach(([id, res]) => {
    const row = document.createElement("div");
    row.className = "row";

    if (id === "energy") {
      row.innerHTML = `<span>${res.emoji} ${res.name} (${netEnergy.toFixed(1)}/s)</span><span>${netEnergy.toFixed(1)}</span>`;
    } else {
      const rate = computeRatePerSecond(id);
      row.innerHTML = `<span>${res.emoji} ${res.name} (${rate.toFixed(1)}/s)</span><span>${res.amount.toFixed(1)}</span>`;
    }

    div.appendChild(row);
  });
}

function renderMachines() {
  const div = document.getElementById("machines");
  div.innerHTML = "";

  machines.forEach(machine => {
    const btn = document.createElement("button");

    let costText = Object.entries(machine.cost || {})
      .map(([res, amt]) => `${resources[res].emoji}${amt}`)
      .join(" ");

    btn.textContent = `${machine.emoji} ${machine.name}${costText ? " (" + costText + ")" : ""}`;
    btn.onmouseenter = (e) => {
  const tooltip = document.getElementById("tooltip");
  tooltip.textContent = getMachineTooltip(machine);
  tooltip.style.display = "block";
  tooltip.style.left = (e.pageX + 15) + "px";
  tooltip.style.top = (e.pageY + 15) + "px";
};

btn.onmousemove = (e) => {
  const tooltip = document.getElementById("tooltip");
  tooltip.style.left = (e.pageX + 15) + "px";
  tooltip.style.top = (e.pageY + 15) + "px";
};

btn.onmouseleave = () => {
  const tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
};

    btn.onclick = () => {
      selectedMachine = machine.id;
      renderMachines();
    };

    if (selectedMachine === machine.id) btn.classList.add("selected");

    div.appendChild(btn);
  });
}

function renderGrid() {
  const div = document.getElementById("grid");
  div.innerHTML = "";

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const tile = grid[y][x];

      if (!tile.revealed) {
        cell.textContent = "⬛";
        cell.style.opacity = "0.4";
      } else {
        cell.style.opacity = "1";
        if (!tile.machine) {
          cell.textContent = resourceEmojis[tile.natural];
        } else {
          const m = machines.find(m => m.id === tile.machine);
          cell.textContent = m.emoji;
        }
      }

      cell.onclick = () => {
        const t = grid[y][x];

       if (!t.revealed) {
  if (!isAdjacentToRevealed(x, y)) return;

  const cost = getRevealCost();

  if (resources.wood.amount < cost) {
    console.log("Pas assez de bois pour révéler cette case");
    return;
  }

  resources.wood.amount -= cost;

  t.revealed = true;
  revealedCount++;

  renderResources();
  renderGrid();
  return;
}


        placeMachine(x, y);
        renderGrid();
      };

      cell.oncontextmenu = (e) => {
        e.preventDefault();
        removeMachine(x, y);
      };

      div.appendChild(cell);
    }
  }
}

/* ============================
   PLACEMENT / SUPPRESSION
============================ */

function canAfford(cost) {
  if (!cost) return true;
  return Object.entries(cost).every(([res, amount]) =>
    resources[res].amount >= amount
  );
}

function payCost(cost) {
  if (!cost) return;
  Object.entries(cost).forEach(([res, amount]) => {
    resources[res].amount -= amount;
  });
}

function placeMachine(x, y) {
  if (!selectedMachine) return;

  const tile = grid[y][x];
  if (tile.machine) return;

  const machine = machines.find(m => m.id === selectedMachine);

  if (Array.isArray(machine.needs)) {
    if (!machine.needs.includes(tile.natural)) return;
  } else if (machine.needs !== "none" && tile.natural !== machine.needs) {
    return;
  }

  if (!canAfford(machine.cost)) return;

  payCost(machine.cost);

  tile.machine = selectedMachine;

  revealAdjacent(x, y);

  renderGrid();
  renderResources();
}

function removeMachine(x, y) {
  grid[y][x].machine = null;
  renderGrid();
}

/* ============================
   PRODUCTION (ÉNERGIE NON STOCKABLE)
============================ */

function autoProductionTick() {

  let energyProduced = 0;
  let energyConsumed = 0;

  /* === Calcul énergie === */
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      if (machine.power > 0) energyConsumed += machine.power;

      if (machine.id === "solar_panel") {
        energyProduced += 0.6;
      }
      else if (machine.id === "coal_powerplant") {
        if (resources.coal.amount >= 1) energyProduced += 3;
      }
      else if (machine.id === "solar_tower") {
        let bonus = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              if (grid[ny][nx].machine === "solar_panel") {
                bonus += 3 * 0.6;
              }
            }
          }
        }
        energyProduced += bonus;
      }
    }
  }

  let energyRatio = 1;
  if (energyProduced < energyConsumed) {
    energyRatio = energyProduced / energyConsumed;
  }

  /* === Production des ressources === */
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const machineId = grid[y][x].machine;
      if (!machineId) continue;

      const machine = machines.find(m => m.id === machineId);

      /* === Extracteur === */
      if (machine.id === "extractor") {
        if (grid[y][x].natural === "water") resources.water.amount += 2 * energyRatio;
        if (grid[y][x].natural === "oil") resources.oil.amount += 0.5 * energyRatio;
      }

      /* === Foreuse === */
      else if (machine.id === "drill") {
        const nat = grid[y][x].natural;
        const valid = ["iron", "stone", "copper", "aluminum", "crystal", "uranium"];
        if (valid.includes(nat)) {
          resources[nat].amount += productionRates[nat] * energyRatio;
        }
      }

      /* === Machines qui consomment === */
      else if (machine.consumes) {
        let canRun = true;

        for (const [res, amount] of Object.entries(machine.consumes)) {
          if (resources[res].amount < amount) {
            canRun = false;
            break;
          }
        }

        if (!canRun) continue;

        for (const [res, amount] of Object.entries(machine.consumes)) {
          resources[res].amount -= amount * energyRatio;
        }

        resources[machine.produces].amount += machine.produceRate * energyRatio;
      }

      /* === Machines simples === */
      else if (machine.produces) {
        const rate = productionRates[machine.produces] || 0;
        resources[machine.produces].amount += rate * energyRatio;
      }
    }
  }

  renderResources();
}

/* Tick */
setInterval(autoProductionTick, 1000);

/* ============================
   RESTART
============================ */

function restartGame() {
  Object.keys(resources).forEach(r => resources[r].amount = 0);
  resources.wood.amount = 100;
  resources.iron.amount = 80;
  resources.stone.amount = 50;

  grid = generateNaturalMap().map(row =>
    row.map(natural => ({
      machine: null,
      natural,
      revealed: false
    }))
  );

  revealStartingArea();
  placeStartingResources();
  renderResources();
  renderGrid();
}

/* ============================
   ROTATION 90°
============================ */

function toggleOrientation() {
  const oldWidth = gridWidth;
  const oldHeight = gridHeight;

  gridWidth = oldHeight;
  gridHeight = oldWidth;

  const newGrid = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => null)
  );

  for (let y = 0; y < oldHeight; y++) {
    for (let x = 0; x < oldWidth; x++) {
      const newX = y;
      const newY = oldWidth - 1 - x;
      newGrid[newY][newX] = grid[y][x];
    }
  }

  grid = newGrid;

  document.querySelector(".grid").style.gridTemplateColumns =
    `repeat(${gridWidth}, 32px)`;

  renderGrid();
}

/* ============================
   INIT
============================ */
  renderGrid();
  renderResources();
  renderMachines();

