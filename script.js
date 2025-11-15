// GAME STATE
let totalPlayers = 0;
let currentPlayer = 1;
let imposter = 0;

// DOM ELEMENTS
const setupScreen = document.getElementById("setup-screen");
const revealScreen = document.getElementById("reveal-screen");
const gameScreen = document.getElementById("game-screen");

const startBtn = document.getElementById("startGameBtn");
const nextBtn = document.getElementById("nextPlayerBtn");

const playerLabel = document.getElementById("playerLabel");
const roleText = document.getElementById("roleText");


// START GAME
startBtn.addEventListener("click", () => {
    totalPlayers = parseInt(document.getElementById("playerCount").value);

    // Randomly choose imposter
    imposter = Math.floor(Math.random() * totalPlayers) + 1;

    // Go to reveal screen
    setupScreen.classList.add("hidden");
    revealScreen.classList.remove("hidden");

    showPlayerRole();
});


// Show each player's role
function showPlayerRole() {
    playerLabel.textContent = `Player ${currentPlayer}`;
    roleText.textContent = (currentPlayer === imposter)
        ? "You are the IMPOSTER"
        : "You are NOT the imposter";
}


// NEXT PLAYER BUTTON
nextBtn.addEventListener("click", () => {
    currentPlayer++;

    if (currentPlayer > totalPlayers) {
        // Move to gameplay screen
        revealScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
    } else {
        // Show next player's role
        showPlayerRole();
    }
});
