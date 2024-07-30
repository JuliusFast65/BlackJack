let deck = [];
let players = [];
let dealerHand = [];
let currentPlayer = 0;
let wins = 0;
let losses = 0;
let ties = 0;

document.getElementById('start-button').addEventListener('click', setupGame);
document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('double-button').addEventListener('click', doubleBet);
document.getElementById('split-button').addEventListener('click', split);

function setupGame() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    const initialBalance = parseInt(document.getElementById('initial-balance').value);

    for (let i = 0; i < numPlayers; i++) {
        players.push({
            hand: [],
            balance: initialBalance,
            bet: 0,
            id: i
        });
    }

    document.getElementById('setup').classList.add('hidden');
    document.getElementById('player-info').classList.remove('hidden');
    document.getElementById('dealer-info').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('statistics').classList.remove('hidden');

    updatePlayerUI();
    startGame();
}

function startGame() {
    deck = createDeck();
    shuffleDeck(deck);

    // Collect bets
    players.forEach(player => {
        const bet = parseInt(prompt(`Jugador ${player.id + 1}, ingrese su apuesta:`));
        if (bet > player.balance) {
            alert('No tienes suficiente dinero para esa apuesta.');
            startGame();
            return;
        }
        player.bet = bet;
        player.balance -= bet;
    });

    // Deal initial cards
    players.forEach(player => {
        player.hand = [drawCard(), drawCard()];
    });
    dealerHand = [drawCard(), drawCard()];

    updateUI();
}

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

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCard() {
    return deck.pop();
}

function hit() {
    players[currentPlayer].hand.push(drawCard());
    if (getHandValue(players[currentPlayer].hand) > 21) {
        alert(`Jugador ${currentPlayer + 1}, te pasaste.`);
        nextPlayer();
    }
    updateUI();
}

function stand() {
    nextPlayer();
}

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

function split() {
    alert('Función de dividir aún no implementada.');
}

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
            value += parseInt(card.value);
        }
    }
    while (value > 21 && numAces > 0) {
        value -= 10;
        numAces--;
    }
    return value;
}

function nextPlayer() {
    currentPlayer++;
    if (currentPlayer >= players.length) {
        dealerPlay();
    } else {
        updateUI();
    }
}

function dealerPlay() {
    while (getHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    determineWinners();
    resetGame();
}

function determineWinners() {
    const dealerValue = getHandValue(dealerHand);
    players.forEach(player => {
        const playerValue = getHandValue(player.hand);
        if (playerValue > 21) {
            losses++;
            alert(`Jugador ${player.id + 1} perdió.`);
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            wins++;
            player.balance += player.bet * 2;
            alert(`Jugador ${player.id + 1} ganó.`);
        } else if (playerValue < dealerValue) {
            losses++;
            alert(`Jugador ${player.id + 1} perdió.`);
        } else {
            ties++;
            player.balance += player.bet;
            alert(`Jugador ${player.id + 1} empató.`);
        }
    });
    updateStatistics();
}

function updatePlayerUI() {
    const playerInfo = document.getElementById('player-info');
    playerInfo.innerHTML = '';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
            <h2>Jugador ${player.id + 1}</h2>
            <div>Mano: <span id="player-hand-${player.id}"></span></div>
            <div>Saldo: $<span id="player-balance-${player.id}">${player.balance}</span></div>
        `;
        playerInfo.appendChild(playerDiv);
    });
}

function updateUI() {
    players.forEach(player => {
        document.getElementById(`player-hand-${player.id}`).textContent = handToString(player.hand);
        document.getElementById(`player-balance-${player.id}`).textContent = player.balance;
    });
    document.getElementById('dealer-hand').textContent = handToString(dealerHand);
}

function handToString(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join(' ');
}

function updateStatistics() {
    document.getElementById('wins').textContent = `Ganadas: ${wins}`;
    document.getElementById('losses').textContent = `Perdidas: ${losses}`;
    document.getElementById('ties').textContent = `Empates: ${ties}`;
}

function resetGame() {
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
    });
    dealerHand = [];
    currentPlayer = 0;
    startGame();
}
