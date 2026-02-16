// =========================
// VARIABLES GLOBALES
// =========================

const gridSize = 20;
let grid = [];
let revealCost = 5;
let revealedCount = 1;

let factoryBoost = 1; // Bonus techno électronique

// =========================
// RESSOURCES
// =========================

const resources = {
  wood: { name: "Bois", emoji: "🪵", amount: 0 },
  stone: { name: "Pierre", emoji: "🪨", amount: 0 },
  copper: { name: "Cuivre", emoji: "🟫", amount: 0 },
  iron: { name: "Fer", emoji: "⛓️", amount: 0 },
  aluminum: { name: "Aluminium", emoji: "⚪", amount: 0 },
  oil: { name: "Pétrole", emoji: "🛢️", amount: 0 },
  crystal: { name: "Cristal", emoji: "🔮", amount: 0 },

  cable: { name: "Câble", emoji: "🔌", amount: 0 },
  plastic: { name: "Plastique", emoji: "🧴", amount: 0 },
  circuit: { name: "Circuit", emoji: "🔁", amount: 0 },
  fuel: { name: "Carburant", emoji: "⛽", amount: 0 },
  battery: { name: "Batterie", emoji: "🔋", amount: 0 },
  engine: { name: "Moteur", emoji: "⚙️", amount: 0 },
  robot: { name: "Robot", emoji: "🤖", amount: 0 }
};

// =========================
// MACHINES
// =========================

const machines = [
  {
    id: "cable_factory",
    name: "Usine de câbles",
    emoji: "🔌",
    needs: "none",
    consumes: { copper: 1 },
    produces: "cable",
    produceRate: 2.2,
    cost: { iron: 50, wood: 10 },
    power: 1.5
  },
  {
    id: "plastic_factory",
    name: "Usine de plastique",
    emoji: "🧴",
    needs: "none",
    consumes: { oil: 0.8 },
    produces: "plastic",
    produceRate: 1.3,
    cost: { iron: 50, copper: 10 },
    power: 0.7
  },
  {
    id: "circuit_factory",
    name: "Usine de circuits",
    emoji: "🔁",
    needs: "none",
    consumes: { copper: 0.6, plastic: 0.7 },
    produces: "circuit",
    produceRate: 0.9,
    cost: { aluminum: 50, copper: 10 },
    power: 0.5
  },
  {
    id: "refinery",
    name: "Raffinerie",
    emoji: "🏭",
    needs: "none",
    consumes: { oil: 2 },
    produces: "fuel",
    produceRate: 3,
    cost: { iron: 120, aluminum: 100 },
    power: 2
  },
  {
    id: "battery_factory",
    name: "Usine de batteries",
    emoji: "🔋",
    needs: "none",
    consumes: { copper: 0.6, aluminum: 0.7 },
    produces: "battery",
    produceRate: 1,
    cost: { aluminum: 90, copper: 40 },
    power: 0.7
  },
  {
    id: "engine_factory",
    name: "Usine de moteurs",
    emoji: "⚙️",
    needs: "none",
    consumes: { cable: 2 },
    produces: "engine",
    produceRate: 1,
    cost: { iron: 90, aluminum: 70 },
    power: 2
  },
  {
    id: "robot_factory",
    name: "Usine de robots",
    emoji: "🤖",
    needs: "none",
    consumes: { cable: 5, aluminum: 1.4, engine: 2 },
    produces: "robot",
    produceRate: 1,
    cost: { cable: 300, aluminum: 90 },
    power: 0.7
  }
];

// =========================
// TECHNOLOGIES
// =========================

const technologies = [
  {
    id: "plastic_processing",
    name: "Traitement du plastique",
    cost: { iron: 50, copper: 20 },
    unlocks: ["plastic_factory"],
    unlocked: false
  },
  {
    id: "electronics",
    name: "Électronique avancée",
    cost: { aluminum: 40, copper: 30 },
    unlocks: ["circuit_factory"],
    unlocked: false,
    bonus: "factoryBoost"
  },
  {
    id: "fuel_refining",
    name: "Raffinage du carburant",
    cost: { iron: 80, aluminum: 60 },
    unlocks: ["refinery"],
    unlocked: false
  },
  {
    id: "battery_tech",
    name: "Technologie des batteries",
    cost: { aluminum: 50, copper: 40 },
    unlocks: ["battery_factory"],
    unlocked: false
  },
  {
    id: "mechanical_engineering",
    name: "Ingénierie mécanique",
    cost: { iron: 100, aluminum: 50 },
    unlocks: ["engine_factory"],
    unlocked: false
  },
  {
    id: "robotics",
    name: "Robotique",
    cost: { cable: 200, aluminum: 80 },
    unlocks: ["robot_factory"],
    unlocked: false
  }
];

// =========================
// FONCTIONS UTILITAIRES
// =========================

function canAfford(cost) {
  return Object.entries(cost).every(([res, amt]) => resources[res].amount >= amt);
}

function payCost(cost) {
  Object.entries(cost).forEach(([res, amt]) => {
    resources[res].amount -= amt;
  });
}

function getRevealCost() {
  return Math.ceil(revealCost * Math.pow(1.2, revealedCount));
}

// =========================
// RÉVÉLER TOUTE LA CARTE (Robotique)
// =========================

function revealEntireMap() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid[y][x].revealed = true;
    }
  }
  renderGrid();
}

// =========================
// ARBRE TECHNOLOGIQUE
// =========================

function renderTechTree() {
  const div = document.getElementById("techList");
  div.innerHTML = "";

  technologies.forEach(tech => {
    const btn = document.createElement("button");

    let costText = Object.entries(tech.cost)
      .map(([res, amt]) => `${resources[res].emoji}${amt}`)
      .join(" ");

    btn.textContent = `${tech.name} (${costText})`;

    if (tech.unlocked) {
      btn.classList.add("unlocked");
      btn.textContent += " ✔️";
      btn.disabled = true;
    }

    btn.onclick = () => {
      if (!canAfford(tech.cost)) return;

      payCost(tech.cost);
      tech.unlocked = true;

      if (tech.id === "robotics") {
        revealEntireMap();
      }

      if (tech.bonus === "factoryBoost") {
        factoryBoost = 1.1;
      }

      renderTechTree();
      renderMachines();
      renderResources();
    };

    div.appendChild(btn);
  });
}

// =========================
// GÉNÉRATION DE LA CARTE
// =========================

function generateGrid() {
  grid = [];
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = {
        natural: "none",
        revealed: false,
        machine: null
      };
    }
  }

  grid[10][10].revealed = true;
}

// =========================
// AFFICHAGE DE LA CARTE
// =========================

function renderGrid() {
  const div = document.getElementById("grid");
  div.innerHTML = "";

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      const tile = grid[y][x];

      if (!tile.revealed) {
        cell.className = "tile hidden";
        cell.textContent = "❓";
      } else {
        cell.className = "tile";
        cell.textContent = tile.machine ? tile.machine.emoji : "⬜";
      }

      div.appendChild(cell);
    }
  }
}

// =========================
// AFFICHAGE RESSOURCES
// =========================

function renderResources() {
  const div = document.getElementById("resources");
  div.innerHTML = "";

  Object.entries(resources).forEach(([id, res]) => {
    const span = document.createElement("span");
    span.textContent = `${res.emoji} ${res.amount}`;
    div.appendChild(span);
  });
}

// =========================
// AFFICHAGE MACHINES
// =========================

function renderMachines() {
  const div = document.getElementById("machineList");
  div.innerHTML = "";

  machines.forEach(machine => {
    const locked = technologies.some(t => t.unlocks.includes(machine.id) && !t.unlocked);
    if (locked) return;

    const btn = document.createElement("button");
    btn.textContent = `${machine.emoji} ${machine.name}`;
    div.appendChild(btn);
  });
}

// =========================
// INITIALISATION
// =========================

function init() {
  generateGrid();
  renderGrid();
  renderResources();
  renderMachines();
  renderTechTree();
}

init();
