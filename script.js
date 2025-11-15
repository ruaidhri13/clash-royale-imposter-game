/* Clash Royale Imposter — MVP script
   Rules implemented:
   - select n players
   - pick a single secret card (random)
   - pick one imposter player (random)
   - imposter sees a category hint (not the card)
   - pass-the-device reveal per player
   - discussion is IRL, app only shows Start Discussion and Reveal Imposter UI
*/

// ---------- Data: card list (text only) ----------
const ALL_CARDS = [
  "Knight","Archers","Skeletons","Goblins","Spear Goblins","Bomber","Giant","Mini P.E.K.K.A",
  "Musketeer","Valkyrie","Hog Rider","Barbarians","Wall Breakers","Balloon","Witch","Skeleton Army",
  "Baby Dragon","Prince","Dark Prince","Minions","Minion Horde","Mega Minion","Elite Barbarians",
  "Royal Giant","Fisherman","Lumberjack","Bandit","Royal Ghost","Electro Wizard","Wizard","Ice Wizard",
  "Bowler","Hunter","Archer Queen","Monk","Phoenix","Golem","Ice Golem","Night Witch","Lava Hound",
  "Inferno Dragon","Mega Knight","Ram Rider","Sparky","P.E.K.K.A","Cannon Cart","Zappies","Guards",
  "Dart Goblin","Goblin Giant","Royal Hogs","Mother Witch","Electro Giant","Archer","Ice Spirit",
  "Fire Spirit","Heal Spirit","Electro Spirit","Bats","Goblin Barrel","Rascals","Golden Knight",
  "Skeleton King","Mighty Miner","Princess","Miner","Firecracker","Goblin Cage","Mortar","Tombstone",
  "Zap","Arrows","Fireball","Rocket","Freeze","Lightning","Rage","Clone","Poison","Tornado",
  "Barbarian Barrel","The Log","Giant Snowball","Earthquake","Mirror","Graveyard",
  "Cannon","Tesla","Inferno Tower","Bomb Tower","Goblin Hut","Furnace","X-Bow","Elixir Collector","Royal Hut"
];

// ---------- Categories for hints ----------
const CATEGORIES = [
  "Tank", "Building", "Air Unit", "Ranged Unit", "Melee Unit",
  "Win Condition", "Swarm", "Spell", "Support"
];

// small lookup sets to classify reliably (extendable)
const BUILDINGS = new Set(["Cannon","Tesla","Inferno Tower","Bomb Tower","Goblin Hut","Furnace","X-Bow","Elixir Collector","Royal Hut","Mortar","Goblin Cage","Tombstone"]);
const SPELLS = new Set(["Zap","Arrows","Fireball","Rocket","Freeze","Lightning","Rage","Clone","Poison","Tornado","Barbarian Barrel","The Log","Giant Snowball","Earthquake","Mirror","Graveyard"]);
const AIR_KEYWORDS = ["Dragon","Hound","Balloon","Minion","Inferno Dragon","Lava Hound","Bats","Baby Dragon"];
const WIN_CONDITIONS = new Set(["Hog Rider","Royal Giant","Balloon","Goblin Barrel","Giant","Golem","P.E.K.K.A","Mega Knight"]);
const SWARM_KEYWORDS = ["Army","Horde","Skeletons","Goblins","Spear Goblins","Minion Horde","Bats","Rascals"];
const TANK_KEYWORDS = ["Giant","Golem","P.E.K.K.A","Royal Giant","Mega Knight","Electro Giant","Lava Hound"];
const SUPPORT_KEYWORDS = ["Wizard","Musketeer","Witch","Electro Wizard","Ice Wizard","Princess","Archer Queen","Mother Witch","Firecracker","Musketeer"];

// ---------- Game state ----------
let state = {
  totalPlayers: 4,
  secretCard: null,
  imposterIndex: null, // 1-based player index
  hintCategory: null,
  currentRevealPlayer: 1,
  phase: "setup" // setup -> reveal -> discussion -> result
};

// ---------- DOM refs ----------
const setupScreen = document.getElementById("setup-screen");
const revealScreen = document.getElementById("reveal-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const previewCardEl = document.getElementById("previewCard");
const startGameBtn = document.getElementById("startGameBtn");
const shuffleCardBtn = document.getElementById("shuffleCardBtn");

const revealTitle = document.getElementById("revealTitle");
const revealBtn = document.getElementById("revealBtn");
const hidePassBtn = document.getElementById("hidePassBtn");
const revealBox = document.getElementById("revealBox");
const revealRole = document.getElementById("revealRole");
const revealCard = document.getElementById("revealCard");

const startDiscussionBtn = document.getElementById("startDiscussionBtn");
const revealImposterBtn = document.getElementById("revealImposterBtn");
const restartBtn = document.getElementById("restartBtn");
const voteList = document.getElementById("voteList");

const resultText = document.getElementById("resultText");
const playAgainBtn = document.getElementById("playAgainBtn");
const backToSetupBtn = document.getElementById("backToSetupBtn");

const playerCountSelect = document.getElementById("playerCount");

// ---------- Utility: pick random ----------
function randFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ---------- Heuristic category resolver (MVP) ----------
function getCategoryFor(cardName){
  if (BUILDINGS.has(cardName)) return "Building";
  if (SPELLS.has(cardName)) return "Spell";
  if (WIN_CONDITIONS.has(cardName)) return "Win Condition";

  // exact checks for air units
  for (const k of AIR_KEYWORDS) if (cardName.includes(k)) return "Air Unit";
  for (const k of SWARM_KEYWORDS) if (cardName.includes(k)) return "Swarm";
  for (const k of TANK_KEYWORDS) if (cardName.includes(k)) return "Tank";
  for (const k of SUPPORT_KEYWORDS) if (cardName.includes(k)) return "Support";

  // fallback: if contains "Wizard", "Musketeer" -> ranged
  if (cardName.toLowerCase().includes("wizard") || cardName.toLowerCase().includes("musketeer") || cardName.toLowerCase().includes("archer") || cardName.toLowerCase().includes("princess")) {
    return "Ranged Unit";
  }

  // final fallback
  return "Support";
}

// ---------- UI helpers ----------
function showOnly(section){
  [setupScreen,revealScreen,gameScreen,resultScreen].forEach(s => s.classList.add('hidden'));
  section.classList.remove('hidden');
}

// preview a card on setup
function previewCard(){
  const c = state.secretCard || randFrom(ALL_CARDS);
  previewCardEl.textContent = c;
}

// ---------- Game flow functions ----------
function setupPickCard(){
  // pick a new secret card and preview it
  state.secretCard = randFrom(ALL_CARDS);
  previewCard();
}

function startGame(){
  // read player count
  state.totalPlayers = Math.max(3, Math.min(12, Number(playerCountSelect.value) || 4));

  // pick secret card and hint
  if (!state.secretCard) state.secretCard = randFrom(ALL_CARDS);
  state.hintCategory = getCategoryFor(state.secretCard);

  // pick imposter
  state.imposterIndex = Math.floor(Math.random()* state.totalPlayers) + 1; // 1-based

  // reset reveal flow
  state.currentRevealPlayer = 1;
  state.phase = "reveal";

  // show reveal screen
  updateRevealUI();
  showOnly(revealScreen);

  // build vote list for later
  buildVoteButtons();
}

function updateRevealUI(){
  revealTitle.textContent = `Player ${state.currentRevealPlayer}`;
  revealBox.classList.add('hidden');
  revealBtn.classList.remove('hidden');
  hidePassBtn.classList.add('hidden');
  revealRole.textContent = "";
  revealCard.textContent = "";
  document.getElementById("privatePrompt").classList.remove('hidden');
}

function revealForCurrentPlayer(){
  // show card/hint for the current player
  const i = state.currentRevealPlayer;
  revealBox.classList.remove('hidden');
  document.getElementById("privatePrompt").classList.add('hidden');

  if (i === state.imposterIndex){
    revealRole.textContent = "You are the IMPOSTER (do not reveal)";
    revealCard.textContent = `Hint: ${state.hintCategory}`;
  } else {
    revealRole.textContent = "You are NOT the imposter";
    revealCard.textContent = `Card: ${state.secretCard}`;
  }

  revealBtn.classList.add('hidden');
  hidePassBtn.classList.remove('hidden');
}

function hideAndPass(){
  // increment player
  state.currentRevealPlayer++;
  if (state.currentRevealPlayer > state.totalPlayers){
    // finished reveal, move to discussion screen
    state.phase = "discussion";
    prepareDiscussionScreen();
    showOnly(gameScreen);
  } else {
    // show next player's reveal prompt
    updateRevealUI();
  }
}

// builds vote buttons for reveal stage
function buildVoteButtons(){
  voteList.innerHTML = "";
  for (let i=1;i<=state.totalPlayers;i++){
    const b = document.createElement('button');
    b.textContent = `Player ${i}`;
    b.className = 'vote-btn';
    b.dataset.player = i;
    b.addEventListener('click', () => confirmRevealChoice(i));
    voteList.appendChild(b);
  }
}

function prepareDiscussionScreen(){
  // show discussion screen; votes available but group handles discussion IRL
  buildVoteButtons();
  showOnly(gameScreen);
}

function confirmRevealChoice(playerIndex){
  // host tapped the player the group voted for
  // show result screen with whether they were the imposter
  const wasImposter = (playerIndex === state.imposterIndex);
  const txt = [];
  txt.push(`Chosen: Player ${playerIndex}`);
  txt.push(`Imposter: Player ${state.imposterIndex}`);
  txt.push(`Secret card: ${state.secretCard}`);
  txt.push(`Imposter hint: ${state.hintCategory}`);
  txt.push('');
  if (wasImposter){
    txt.push("✅ Correct! The chosen player WAS the imposter. Word-holders win.");
  } else {
    txt.push("❌ Wrong. The chosen player was NOT the imposter. Imposter wins.");
  }

  resultText.innerHTML = txt.map(line => `<div>${line}</div>`).join('');
  state.phase = "result";
  showOnly(resultScreen);
}

function restartGameKeepCard(){
  // keep the same secret card but reshuffle imposter
  state.imposterIndex = Math.floor(Math.random()* state.totalPlayers) + 1;
  state.currentRevealPlayer = 1;
  state.phase = "reveal";
  updateRevealUI();
  showOnly(revealScreen);
}

function backToSetup(){
  state = {
    totalPlayers: 4,
    secretCard: null,
    imposterIndex: null,
    hintCategory: null,
    currentRevealPlayer: 1,
    phase: "setup"
  };
  previewCard();
  showOnly(setupScreen);
}

// ---------- Event wiring ----------
shuffleCardBtn.addEventListener('click', () => {
  setupPickCard();
});

startGameBtn.addEventListener('click', () => {
  setupPickCard(); // ensure there is a chosen card
  startGame();
});

revealBtn.addEventListener('click', () => revealForCurrentPlayer());
hidePassBtn.addEventListener('click', () => hideAndPass());

startDiscussionBtn.addEventListener('click', () => {
  // purely UI: toggles a small "discussion started" visual (no internal timer)
  startDiscussionBtn.textContent = "Discussion started (in-person)";
  setTimeout(() => startDiscussionBtn.textContent = "Start Discussion", 1500);
});

revealImposterBtn.addEventListener('click', () => {
  // show vote buttons (host taps the voted player)
  buildVoteButtons();
  alert("After voting in real life, tap the player the group chose to reveal.");
});

restartBtn.addEventListener('click', () => {
  // keep same card but reshuffle imposter index & start reveal again
  restartGameKeepCard();
});

playAgainBtn.addEventListener('click', () => {
  // same secret card and players: reshuffle imposter and go to reveal
  restartGameKeepCard();
});
backToSetupBtn.addEventListener('click', () => backToSetup());

// initial preview
previewCard();
showOnly(setupScreen);
