// ===== CLASH ROYALE CARD DATA =====
const cards = [
    "Mega Knight", "Hog Rider", "Wizard", "Musketeer", "P.E.K.K.A",
    "Goblin Barrel", "Valkyrie", "Bandit", "Ice Wizard", "Firecracker",
    "Royal Giant", "Electro Wizard", "Lumberjack", "Night Witch"
];

// Broad hint categories (what the imposter sees)
const hintCategories = [
    "Tank",
    "Building",
    "Air Unit",
    "Ranged Unit",
    "Melee Unit",
    "Win Condition",
    "Support Card"
];


// GAME STATE
let totalPlayers = 0;
let currentPlayer = 1;
let imposter = 0;
let mainCard = "";
let hintCard = "";
let currentCluePlayer = 1;
let clues = [];

// DOM ELEMENTS
const setupScreen = document.getElementById("setup-screen");
const revealScreen = document.getElementById("reveal-screen");
const gameScreen = document.getElementById("game-screen");

const startBtn = document.getElementById("startGameBtn");
const nextBtn = document.getElementById("nextPlayerBtn");

const playerLabel = document.getElementById("playerLabel");
const roleText = document.getElementById("roleText");

const clueScreen = document.getElementById("clue-screen");
const clueBoardScreen = document.getElementById("clue-board-screen");



// START GAME
startBtn.addEventListener("click", () => {

    startBtn.addEventListener("click", () => {
    totalPlayers = parseInt(document.getElementById("playerCount").value);

    // Random imposter
    imposter = Math.floor(Math.random() * totalPlayers) + 1;

    // Choose random main card
    mainCard = cards[Math.floor(Math.random() * cards.length)];

    // Choose random hint category
    hintCard = hintCategories[Math.floor(Math.random() * hintCategories.length)];

    // Move to reveal screen
    currentPlayer = 1;
    setupScreen.classList.add("hidden");
    revealScreen.classList.remove("hidden");

    showPlayerRole();
});

});


// Show each player's role
function showPlayerRole() {
    playerLabel.textContent = `Player ${currentPlayer}`;

    if (currentPlayer === imposter) {
        roleText.innerHTML = `
            <strong>You are the IMPOSTER</strong><br><br>
            Your hint: <strong>${hintCard}</strong>
        `;
    } else {
        roleText.innerHTML = `
            You are NOT the imposter<br><br>
            Your card: <strong>${mainCard}</strong>
        `;
    }
}


// NEXT PLAYER BUTTON
nextBtn.addEventListener("click", () => {
    currentPlayer++;

    if (currentPlayer > totalPlayers) {
        // Move to gameplay screen
        revealScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        // Move to first clue round after 1 second
        setTimeout(startClueRound, 1000);
    } else {
        // Show next player's role
        showPlayerRole();
    }
});


// ===== START CLUE ROUND =====
function startClueRound() {
    gameScreen.classList.add("hidden");
    clueScreen.classList.remove("hidden");

    currentCluePlayer = 1;
    clues = [];

    updateCluePrompt();
}


// Show which player enters clue
function updateCluePrompt() {
    document.getElementById("cluePlayerLabel").textContent = 
        `Player ${currentCluePlayer}, your turn`;
}


// ===== SUBMIT CLUE =====
document.getElementById("submitClueBtn").addEventListener("click", () => {
    const value = document.getElementById("clueInput").value.trim();
    if (value === "") return;

    clues.push(`Player ${currentCluePlayer}: ${value}`);
    document.getElementById("clueInput").value = "";

    currentCluePlayer++;

    if (currentCluePlayer > totalPlayers) {
        // Show clue board
        showClueBoard();
    } else {
        updateCluePrompt();
    }
});


// ===== SHOW ALL CLUES FOR THE ROUND =====
function showClueBoard() {
    clueScreen.classList.add("hidden");
    clueBoardScreen.classList.remove("hidden");

    const list = document.getElementById("clueList");
    list.innerHTML = "";

    clues.forEach(clue => {
        const li = document.createElement("li");
        li.textContent = clue;
        list.appendChild(li);
    });
}


// ===== NEXT ROUND =====
document.getElementById("nextRoundBtn").addEventListener("click", () => {
    clueBoardScreen.classList.add("hidden");
    startClueRound();   // Repeat gameplay
});

// ===== CARD SELECTION LOGIC =====
let selectedCard = null;

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            // Remove highlight from previous selection
            cards.forEach(c => c.classList.remove("selected"));

            // Highlight new card
            card.classList.add("selected");

            // Store selected card in state
            selectedCard = card.dataset.card;

            console.log("Selected card:", selectedCard);
        });
    });
});

