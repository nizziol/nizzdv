// Blackjack - prosta implementacja
// Komentarze po polsku, łatwo rozszerzyć

// Elementy UI
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betInput");
const dealBtn = document.getElementById("dealBtn");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleBtn = document.getElementById("doubleBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const messageEl = document.getElementById("message");

const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");
const dealerValueEl = document.getElementById("dealerValue");
const playerValueEl = document.getElementById("playerValue");

// Stan gry
let balance = 1000;
let deck = [];
let dealerHand = [];
let playerHand = [];
let currentBet = 0;
let roundActive = false;
let playerStood = false;
let doubled = false;

// Inicjalizacja salda
balanceEl.textContent = balance;

// Tworzenie i tasowanie talii
function createDeck() {
  const suits = ["♠","♥","♦","♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const d = [];
  for (let s of suits) {
    for (let r of ranks) {
      d.push({suit:s, rank:r});
    }
  }
  // użyjemy 6 talii (kasyno)
  let full = [];
  for (let i=0;i<6;i++) full = full.concat(d);
  return shuffle(full);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pobierz wartość ręki, uwzględnia Asy (1 lub 11)
function handValue(hand) {
  let value = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === "A") { aces++; value += 11; }
    else if (["K","Q","J"].includes(c.rank)) value += 10;
    else value += Number(c.rank);
  }
  // jeśli za dużo, zmniejsz Aces z 11 na 1
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

// Render kart na ekranie
function renderHands(hideDealerSecond = true) {
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";

  dealerHand.forEach((c, idx) => {
    const el = createCardEl(c, (hideDealerSecond && idx===1));
    dealerCardsEl.appendChild(el);
  });

  playerHand.forEach(c => {
    playerCardsEl.appendChild(createCardEl(c, false));
  });

  dealerValueEl.textContent = hideDealerSecond ? "Wartość: ?" : "Wartość: " + handValue(dealerHand);
  playerValueEl.textContent = "Wartość: " + handValue(playerHand);
}

// Tworzy element reprezentujący kartę (ukryta karta - back)
function createCardEl(card, hidden=false) {
  const div = document.createElement("div");
  div.className = "card";
  if (hidden) {
    div.innerHTML = `<div class="top">?</div><div class="mid">🂠</div><div class="bot">?</div>`;
    return div;
  }
  div.innerHTML = `<div class="top">${card.rank}${card.suit}</div><div class="mid">${card.rank}</div><div class="bot">${card.suit}</div>`;
  return div;
}

// Reset stanu przed rundą
function resetRound() {
  if (!deck || deck.length < 52) deck = createDeck();
  dealerHand = [];
  playerHand = [];
  currentBet = 0;
  roundActive = false;
  playerStood = false;
  doubled = false;
  setButtonsState({deal:true, hit:false, stand:false, double:false, newRound:false});
  messageEl.textContent = "Wprowadź zakład i naciśnij Rozdaj.";
  renderHands(true);
}

// Ustaw stan przycisków
function setButtonsState({deal, hit, stand, double, newRound}) {
  dealBtn.disabled = !deal;
  hitBtn.disabled = !hit;
  standBtn.disabled = !stand;
  doubleBtn.disabled = !double;
  newRoundBtn.disabled = !newRound;
}

// Rozdanie
dealBtn.addEventListener("click", () => {
  const bet = Math.floor(Number(betInput.value));
  if (!bet || bet <= 0) { messageEl.textContent = "Podaj poprawny zakład."; return; }
  if (bet > balance) { messageEl.textContent = "Brak wystarczających środków."; return; }

  currentBet = bet;
  balance -= bet;
  balanceEl.textContent = balance;

  // Rozpocznij rundę
  roundActive = true;
  playerStood = false;
  doubled = false;
  if (!deck || deck.length < 52) deck = createDeck();

  // 2 karty dla gracza i dealera
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());

  renderHands(true);

  // Sprawdź blackjacki
  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  setButtonsState({deal:false, hit:true, stand:true, double: (playerHand.length===2), newRound:false});
  messageEl.textContent = "Twoja tura — Hit lub Stand. Możesz też Double (podwaja zakład).";

  // jeśli gracz ma blackjack
  if (playerVal === 21) {
    // jeśli dealer też ma blackjack => push
    if (dealerVal === 21) {
      // push – zwróć zakład
      balance += currentBet;
      messageEl.textContent = "Push — obaj blackjack. Zakład zwrócony.";
      setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
      roundActive = false;
      renderHands(false);
      balanceEl.textContent = balance;
      return;
    } else {
      // player blackjack pays 3:2
      const win = Math.floor(currentBet * 1.5);
      balance += currentBet + win;
      messageEl.textContent = `Blackjack! Wygrałeś ${win} $.`;
      setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
      roundActive = false;
      renderHands(false);
      balanceEl.textContent = balance;
      return;
    }
  }
});

// Hit
hitBtn.addEventListener("click", () => {
  if (!roundActive) return;
  playerHand.push(deck.pop());
  renderHands(true);

  const val = handValue(playerHand);
  if (val > 21) {
    messageEl.textContent = `Przegrałeś — bust (${val}).`;
    roundActive = false;
    setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
    renderHands(false);
  } else {
    // jeśli po hicie nadal gra, double już niedostępne
    setButtonsState({deal:false, hit:true, stand:true, double:false, newRound:false});
  }
});

// Stand -> dealer plays
standBtn.addEventListener("click", () => {
  if (!roundActive) return;
  playerStood = true;
  dealerPlay();
});

// Double (podwaja zakład, 1 karta, koniec tury)
doubleBtn.addEventListener("click", () => {
  if (!roundActive) return;
  if (balance < currentBet) { messageEl.textContent = "Za mało środków by podwoić."; return; }
  // podwój zakład
  balance -= currentBet;
  currentBet *= 2;
  doubled = true;
  balanceEl.textContent = balance;

  // daj 1 kartę i zakończ tury gracza
  playerHand.push(deck.pop());
  renderHands(true);

  if (handValue(playerHand) > 21) {
    messageEl.textContent = `Bust po double (${handValue(playerHand)}). Przegrałeś.`;
    roundActive = false;
    setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
    renderHands(false);
    return;
  }
  // teraz dealer
  dealerPlay();
});

// Logika dealera
function dealerPlay() {
  // odkryj karty dealera
  renderHands(false);

  // dealer dobiera do 17 (soft 17 policy: stop at 17)
  while (handValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
    renderHands(false);
  }

  // Sprawdź wynik
  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  if (dealerVal > 21) {
    // dealer bust -> player wins
    const win = currentBet * 2;
    balance += win;
    messageEl.textContent = `Dealer przebił (dealer ${dealerVal}). Wygrałeś ${currentBet} $.`;
    // w payoutie: zwracamy zakład + wygrana (balance += bet*2) -> już zrobione
  } else if (dealerVal > playerVal) {
    messageEl.textContent = `Przegrałeś. Dealer ${dealerVal} vs Ty ${playerVal}.`;
  } else if (dealerVal < playerVal) {
    // player wins (payout 1:1)
    const win = currentBet * 2;
    balance += win;
    messageEl.textContent = `Wygrałeś! Dealer ${dealerVal} vs Ty ${playerVal}. Zysk: ${currentBet} $.`;
  } else {
    // push — remis
    balance += currentBet; // zwrot zakładu
    messageEl.textContent = `Push — remis (${playerVal}). Zakład zwrócony.`;
  }

  roundActive = false;
  setButtonsState({deal:false, hit:false, stand:false, double:false, newRound:true});
  renderHands(false);
  balanceEl.textContent = balance;
}

// Nowa runda
newRoundBtn.addEventListener("click", () => {
  // czy resetować talię gdy mało kart? robimy to automatycznie w resetRound()
  playerHand = [];
  dealerHand = [];
  currentBet = 0;
  resetRound();
});

// Inicjalizacja
resetRound();
