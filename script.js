let deck = [];
let playerHand = [];
let dealerHand = [];
let playerBet = 0;
let playerMoney = 1000;
let wins = 0;
let losses = 0;
let ties = 0;

document.getElementById('bet-button').addEventListener('click', startGame);
document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('double-button').addEventListener('click', doubleBet);
document.getElementById('split-button').addEventListener('click', split);

function startGame() {
    playerBet = parseInt(document.getElementById('bet-amount').value);
    if (playerBet > playerMoney) {
        alert('No tienes suficiente dinero para esa apuesta.');
        return;
    }
    playerMoney -= playerBet;
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [drawCard(), drawCard()];
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
    playerHand.push(drawCard());
    if (getHandValue(playerHand) > 21) {
        endGame('Perdiste');
    }
    updateUI();
}

function stand() {
    while (getHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    if (dealerValue > 21 || playerValue > dealerValue) {
        endGame('Ganaste');
    } else if (playerValue < dealerValue) {
        endGame('Perdiste');
    } else {
        endGame('Empate');
    }
    updateUI();
}

function doubleBet() {
    if (playerBet * 2 > playerMoney) {
        alert('No tienes suficiente dinero para doblar la apuesta.');
        return;
    }
    playerMoney -= playerBet;
    playerBet *= 2;
    hit();
    if (getHandValue(playerHand) <= 21) {
        stand();
    }
}

function split() {
    // Implementar lógica de dividir mano
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

function updateUI() {
    document.getElementById('player-hand').innerHTML = handToString(playerHand);
    document.getElementById('dealer-hand').innerHTML = handToString(dealerHand);
    document.getElementById('wins').textContent = `Ganadas: ${wins}`;
    document.getElementById('losses').textContent = `Perdidas: ${losses}`;
    document.getElementById('ties').textContent = `Empates: ${ties}`;
}

function handToString(hand) {
    return hand.map(card => `${card.value}${card.suit}`).join(' ');
}

function endGame(result) {
    alert(result);
    if (result === 'Ganaste') {
        wins++;
        playerMoney += playerBet * 2;
    } else if (result === 'Perdiste') {
        losses++;
    } else {
        ties++;
        playerMoney += playerBet;
    }
    playerHand = [];
    dealerHand = [];
    updateUI();
}
