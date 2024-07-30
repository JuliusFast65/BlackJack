let deck = [];
let players = [];
let dealerHand = [];
let currentPlayer = 0;
let wins = 0;
let losses = 0;
let ties = 0;

// Event listeners for navigation and game controls
document.getElementById('next-to-names').addEventListener('click', setupNames);
document.getElementById('next-to-bets').addEventListener('click', setupBets);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('double-button').addEventListener('click', doubleBet);
document.getElementById('split-button').addEventListener('click', split);

// Set up player names and initial balances
function setupNames() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    const playerNamesDiv = document.getElementById('player-names');
    playerNamesDiv.innerHTML = '';
    for (let i = 0; i < numPlayers; i++) {
        playerNamesDiv.innerHTML += `
            <div>
                <label for="player-name-${i}">Nombre del jugador ${i + 1}:</label>
                <input type="text" id="player-name-${i}">
                <label for="player-balance-${i}">Saldo inicial:</label>
                <input type="number" id="player-balance-${i}" min="1" value="100">
            </div>
        `;
    }
    document.getElementById('setup-players').classList.add('hidden');
    document.getElementById('setup-names').classList.remove('hidden');
}

// Set up bets for each player
function setupBets() {
    const playerBetsDiv = document.getElementById('player-bets');
    playerBetsDiv.innerHTML = '';
    players = [];
    for (let i = 0; i < document.querySelectorAll('[id^="player-name-"]').length; i++) {
        const name = document.getElementById(`player-name-${i}`).value;
        const balance = parseInt(document.getElementById(`player-balance-${i}`).value);
        players.push({
            name: name,
            hand: [],
            balance: balance,
            bet: 0,
            id: i
        });
        playerBetsDiv.innerHTML += `
            <div>
                <h2>${name}</h2>
                <label for="player-bet-${i}">Apuesta:</label>
                <input type="number" id="player-bet-${i}" min="1" value="10">
            </div>
        `;
    }
    document.getElementById('setup-names').classList.add('hidden');
    document.getElementById('place-bets').classList.remove('hidden');
}

// Start the game by dealing cards and updating UI
function startGame() {
    players.forEach(player => {
        const bet = parseInt(document.getElementById(`player-bet-${player.id}`).value);
        if (bet > player.balance) {
            alert(`Jugador ${player.name}, no tienes suficiente dinero para esa apuesta.`);
            return;
        }
        player.bet = bet;
        player.balance -= bet;
    });

    document.getElementById('place-bets').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    deck = createDeck();
    shuffleDeck(deck);

    // Deal initial cards
    players.forEach(player => {
        player.hand = [drawCard(), drawCard()];
    });
    dealerHand = [drawCard(), drawCard()];

    updateUI();
}

// Create a deck of cards
function createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ suit, value });
        }
    }
    return newDeck.concat(newDeck); // 2 barajas
}

// Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Draw a card from the deck
function drawCard() {
    return deck.pop();
}

// Handle "hit" action
function hit() {
    players[currentPlayer].hand.push(drawCard());
    if (getHandValue(players[currentPlayer].hand) > 21) {
        alert(`Jugador ${players[currentPlayer].name}, te pasaste.`);
        nextPlayer();
    }
    updateUI();
}

// Handle "stand" action
function stand() {
    nextPlayer();
}

// Handle "double" action
function doubleBet() {
    const player = players[currentPlayer];
    if (player.bet * 2 > player.balance) {
        alert('No tienes suficiente dinero para doblar la apuesta.');
        return;
    }
    player.balance -= player.bet;
    player.bet *= 2;
    hit();
    if (getHandValue(player.hand) <= 21) {
        nextPlayer();
    }
}

// Handle "split" action (not implemented)
function split() {
    alert('Función de dividir aún no implementada.');
}

// Calculate the value of a hand
function getHandValue(hand) {
    let value = 0;
    let numAces = 0;
    for (let card of hand) {
        if (card.value === 'A') {
            numAces++;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {

// Completar el valor de la mano
        value += parseInt(card.value);
    }
    while (value > 21 && numAces > 0) {
        value -= 10;
        numAces--;
    }
    return value;
}

// Cambiar al siguiente jugador o el dealer
function nextPlayer() {
    currentPlayer++;
    if (currentPlayer >= players.length) {
        dealerPlay();
    } else {
        updateUI();
    }
}

// Juega el dealer
function dealerPlay() {
    while (getHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    determineWinners();
    resetGame();
}

// Determina los ganadores al final del juego
function determineWinners() {
    const dealerValue = getHandValue(dealerHand);
    players.forEach(player => {
        const playerValue = getHandValue(player.hand);
        if (playerValue > 21) {
            losses++;
            alert(`Jugador ${player.name} perdió.`);
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            wins++;
            player.balance += player.bet * 2;
            alert(`Jugador ${player.name} ganó.`);
        } else if (playerValue < dealerValue) {
            losses++;
            alert(`Jugador ${player.name} perdió.`);
        } else {
            ties++;
            player.balance += player.bet;
            alert(`Jugador ${player.name} empató.`);
        }
    });
    updateStatistics();
}

// Actualiza la interfaz de usuario
function updateUI() {
    const playerInfoDiv = document.getElementById('player-info');
    playerInfoDiv.innerHTML = '';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
            <h2>${player.name}</h2>
            <div>Mano: <span id="player-hand-${player.id}">${handToString(player.hand)}</span></div>
            <div>Saldo: $<span id="player-balance-${player.id}">${player.balance}</span></div>
        `;
        playerInfoDiv.appendChild(playerDiv);
    });
    document.getElementById('dealer-hand').textContent = handToString(dealerHand);
}

// Convierte una mano a cadena de texto
function handToString(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join(' ');
}

// Actualiza las estadísticas del juego
function updateStatistics() {
    document.getElementById('wins').textContent = `Ganadas: ${wins}`;
    document.getElementById('losses').textContent = `Perdidas: ${losses}`;
    document.getElementById('ties').textContent = `Empates: ${ties}`;
}

// Reinicia el juego para la siguiente ronda
function resetGame() {
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
    });
    dealerHand = [];
    currentPlayer = 0;
    setupBets();
}





                
