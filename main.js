let data;
fetch("data.json").then(res=>res.json()).then(x => {
    data = x;
});

const phrasal = document.querySelectorAll(".phrasal")[0];
const phraseInput = document.querySelectorAll(".phraseInput")[0];
const playButton = document.querySelectorAll(".playButton")[0];
const playersButton = document.querySelectorAll(".playersButton")[0];
const guessPanel = document.querySelectorAll(".guessing")[0];
const letterInput = document.querySelectorAll(".letterInput")[0];
const guessButton = document.querySelectorAll(".guessButton")[0];
const eventLog = document.querySelectorAll(".log")[0];
const wheelOfFortune = document.querySelectorAll('.wheel')[0];
const showButton = document.querySelectorAll('.showButton')[0];
const spinButton = document.querySelectorAll('.spinButton')[0];
const myBar = document.getElementById("myBar");
const scoreboard = document.getElementById("scoreboard");

const playerModal = document.getElementById("playerModal");
const playerNameInput = document.getElementById("playerNameInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalPlayerList = document.getElementById("modalPlayerList");

const vowels = ['A', 'E', 'I', 'O', 'U', 'Y', "Ą", "Ę", "Ó"];
const spinDuration = 6000;
let phrase = "";
let hiddenPhrase = [];
let len = 0;
let gameStarted = false;
let spinValue = 0;
let spinValueTemp = 0;
let wheelValues = [300, 200, 150, "NAGRODA", 250, 1500, "BANKRUT", 1000, 150, 400, 250, "GRAJ DALEJ", "STOP", 500, 250, 400, 350, 1000, 200, 300, "NIESPODZIANKA", 400, 250, 200];
let whichField = 0;

// System graczy
let players = [];
let currentPlayerIndex = 0;
let startingPlayerIndex = 0; // Zmienna pilnująca kto zaczyna rundę

wheelValues.reverse(); 
inputsWhenNoGame();

function disableInput(input) {
    input.style.opacity = 0.3;
    input.disabled = true;
}

function enableInput(input) {
    input.style.opacity = 1;
    input.disabled = false;
}

function inputsWhenNoGame() {
    enableInput(phraseInput);
    enableInput(playButton);
    enableInput(playersButton);
    disableInput(letterInput);
    disableInput(guessButton);
    disableInput(showButton);
}

function inputsWhenGame() {
    disableInput(phraseInput);
    disableInput(playButton);
    disableInput(playersButton);
    enableInput(letterInput);
    enableInput(guessButton);
    enableInput(showButton);
}

function sendMessage(mess){
    const message = document.createElement("p");
    message.innerText = mess;
    eventLog.appendChild(message);
    if(eventLog.childElementCount > 7)
        eventLog.firstChild.remove();
    eventLog.scrollTop = eventLog.scrollHeight;
}

function refreshDisplay(phrase){
    phrasal.innerHTML = "";
    const toDisplay = phrase.split(" ");

    toDisplay.forEach(word => {
        const wordContainer = document.createElement("div");
        wordContainer.className = "word";
        const wordArray = word.split("");
        wordArray.forEach(letter => {
            const tile = document.createElement("div");
            if(letter == "_"){
                tile.classList = "tile";
            }
            else if(letter == " "){
                tile.classList = "tile empty";
            }
            else{
                tile.classList = "tile";
                tile.innerHTML = `<div>${letter}</div>`;
            }
            wordContainer.appendChild(tile);
        })
        phrasal.appendChild(wordContainer);
    })
}

// Obsługa UI graczy i modalu
playersButton.addEventListener("click", () => {
    playerModal.style.display = "flex";
    updateModalList();
});

closeModalBtn.addEventListener("click", () => {
    playerModal.style.display = "none";
    updateScoreboard();
});

addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name) {
        players.push({ name: name, roundScore: 0, bank: 0 });
        playerNameInput.value = "";
        updateModalList();
    }
});

playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addPlayerBtn.click();
});

function updateModalList() {
    modalPlayerList.innerHTML = "";
    players.forEach((p, index) => {
        const li = document.createElement("li");
        li.innerText = p.name;
        
        const delBtn = document.createElement("span");
        delBtn.innerText = " ❌";
        delBtn.style.cursor = "pointer";
        delBtn.onclick = () => {
            players.splice(index, 1);
            updateModalList();
        };
        li.appendChild(delBtn);
        modalPlayerList.appendChild(li);
    });
}

function updateScoreboard() {
    scoreboard.innerHTML = "";
    if (players.length === 0) return;

    players.forEach((p, index) => {
        const card = document.createElement("div");
        card.className = `player-card ${index === currentPlayerIndex && gameStarted ? "active" : ""}`;
        card.innerHTML = `
            <div class="name">${p.name}</div>
            <div class="round-score">${p.roundScore} pkt</div>
            <div class="bank">Bank: ${p.bank}</div>
        `;
        scoreboard.appendChild(card);
    });
}

function nextTurn() {
    if (players.length === 0) return;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateScoreboard();
    sendMessage(`Kolej gracza: ${players[currentPlayerIndex].name}`);
}

// Zgadywanie literek
function letterGuessing() {
    if(!gameStarted) return;
    
    // Blokada odgadywania gdy gracz nie wymusił nowej tury po stracie
    if (wheelValues[whichField] == "STOP" || wheelValues[whichField] == "BANKRUT") {
        sendMessage(`Nie można odgadywać. Zakręć kołem!`);
        return;
    }

    let letter = letterInput.value[0]?.toUpperCase();
    letterInput.value = "";
    
    if(!letter || letter == "." || letter == "," || letter == ":" || letter == "\'" || letter == " " || letter == "?" || letter == "!" || letter == "-"){
        sendMessage(`Nieprawidłowy znak!`);
        return;
    }

    let isVowel = vowels.includes(letter);
    if (isVowel) {
        if (players.length > 0 && players[currentPlayerIndex].roundScore < 200) {
            sendMessage(`Za mało punktów! Samogłoska kosztuje 200.`);
            return; 
        }
        if (wheelValues[whichField] != "GRAJ DALEJ") {
            sendMessage(`Pobrano 200 punktów za samogłoskę.`);
            if(players.length > 0) {
                players[currentPlayerIndex].roundScore -= 200;
                updateScoreboard();
            }
        }
    } 

    let counter = 0;
    for(let i = 0; i < len; i++){
        if(hiddenPhrase[i] == letter) {
            sendMessage(`Ta litera jest już odsłonięta.`);
            nextTurn(); 
            return;
        }
        if(phrase[i] == letter){
            counter++;
            hiddenPhrase = hiddenPhrase.substring(0, i) + letter + hiddenPhrase.substring(i + 1);
        }
    }

    if(counter > 0){
        refreshDisplay(hiddenPhrase);
        sendMessage(`Ta litera występuje ${counter} raz(y).`);

        if (!isVowel) {
            let pts = 0;
            if (["NAGRODA", "NIESPODZIANKA", "GRAJ DALEJ"].includes(wheelValues[whichField])) {
                pts = 500;
            } else {
                pts = parseInt(wheelValues[whichField]) || 0;
            }
            
            let earnedPoints = counter * pts;
            sendMessage(`Uzyskano ${earnedPoints} punktów.`); 
            
            if (players.length > 0) {
                players[currentPlayerIndex].roundScore += earnedPoints;
                updateScoreboard();
            }
        }
        
        let onlyVowels = true;
        let guessed = true;
        for(let i = 0; i < len; i++){
            let notAVowel = 0;
            if(hiddenPhrase[i] == "_"){
                guessed = false;
                for(let j = 0; j < vowels.length; j++){
                    if(phrase[i] != vowels[j]){
                        notAVowel++;
                    }
                }
                if(notAVowel == vowels.length){
                    onlyVowels = false;
                    break;
                }
            }
        }
        if(onlyVowels) sendMessage(`Nie ma już spółgłosek!!`);
        
        if (guessed) {
            sendMessage(`Odgadnięto hasło!`);
            if (players.length > 0) {
                let winner = players[currentPlayerIndex];
                winner.bank += winner.roundScore;
                sendMessage(`${winner.name} wygrywa rundę i zgarnia ${winner.roundScore} do banku!`);
                players.forEach(p => p.roundScore = 0);
            }
            gameStarted = false;
            updateScoreboard();
            inputsWhenNoGame();
        }

    }
    else {
        sendMessage(`Ta litera nie występuje w haśle.`);
        nextTurn();
    }
}

// Nowa gra
function gameStart() {
    eventLog.innerHTML = "";
    sendMessage("Rozpoczęto nową grę.");
    phrase = ""; 

    if(phraseInput.value == "" && data && data.phrases){
        const dataLength = data.phrases.length;
        let randomPhraseId = Math.floor(Math.random() * dataLength);
        sendMessage("Wylosowano hasło z puli.");
        sendMessage(`Kategoria hasła: ${data.phrases[randomPhraseId][1]}`);
        phrase = data.phrases[randomPhraseId][0].toUpperCase();
    }
    else if (phraseInput.value != "") {
        phrase = phraseInput.value.toUpperCase();
        phraseInput.value = "";
    } else {
        phrase = "BRAK HASŁA";
    }
    
    hiddenPhrase = phrase.split("");
    len = hiddenPhrase.length;

    for(let i = 0; i < len; i++){   
        if(![" ", ",", ".", ":", "\'", "?", "!", "-"].includes(hiddenPhrase[i])) {
            hiddenPhrase[i] = "_";
        }
    }
    hiddenPhrase = hiddenPhrase.join("");

    refreshDisplay(hiddenPhrase);
    gameStarted = true;
    
    if (players.length > 0) {
        // Zabezpieczenie gdyby usunięto graczy w międzyczasie
        if (startingPlayerIndex >= players.length) {
            startingPlayerIndex = 0;
        }
        
        currentPlayerIndex = startingPlayerIndex; // Ustawiamy odpowiedniego gracza
        players.forEach(p => p.roundScore = 0);
        updateScoreboard();
        sendMessage(`Grę rozpoczyna: ${players[currentPlayerIndex].name}`);
        
        // Przygotowujemy index na kolejną rundę
        startingPlayerIndex = (startingPlayerIndex + 1) % players.length;
    }

    inputsWhenGame();
}

playButton.addEventListener("click", gameStart);
phraseInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") gameStart();
})

guessButton.addEventListener("click", letterGuessing);
letterInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") letterGuessing();
})

// Pokazywanie całego hasła
showButton.addEventListener("click", ()=>{
    if(!gameStarted) return;
    refreshDisplay(phrase);
    sendMessage("Odsłonięto hasło.");
    
    if (players.length > 0) {
        let winner = players[currentPlayerIndex];
        winner.bank += winner.roundScore;
        sendMessage(`${winner.name} wygrywa rundę!`);
        players.forEach(p => p.roundScore = 0);
        updateScoreboard();
    }

    gameStarted = false;
    inputsWhenNoGame();
})

// Kręcenie się koła
function wheelSpinning(ifRand) {
    if(!gameStarted) return;

    let spin = 0;
    if (ifRand == 0)
        spin = Math.floor(Math.random() * 3700) + 300;
    else 
        spin = Math.floor(Math.random() * 60 + 300) * spinPower / 30;
    
    spinValue += spin;
    spinValueTemp += spin;
    const rotation = `rotate(${spinValue}deg)`;
    wheelOfFortune.style.transform = rotation;

    while (spinValueTemp >= 360) {
        spinValueTemp -= 360;
    }
    do {
        if (spinValueTemp > -7.5 && spinValueTemp < 7.5) {
            break;
        } else {
            spinValueTemp -= 15;
            whichField += 1;
            if (whichField >= 24)
                whichField = 0;
        }
    } while (true);

    setTimeout(function(){
        sendMessage(`Wylosowana wartość: ${wheelValues[whichField]}`);
        
        if (players.length > 0) {
            if (wheelValues[whichField] == "BANKRUT") {
                sendMessage(`${players[currentPlayerIndex].name} BANKRUTUJE!`);
                players[currentPlayerIndex].roundScore = 0;
                updateScoreboard();
                nextTurn();
                return;
            } else if (wheelValues[whichField] == "STOP") {
                sendMessage(`${players[currentPlayerIndex].name} TRACI KOLEJKĘ!`);
                nextTurn();
                return;
            }
        }
        letterInput.focus();
    }, spinDuration);
}

wheelOfFortune.addEventListener("click", function() {
    wheelSpinning(0);
})

let spinPower = 30;
let Interval;

spinButton.addEventListener("mousedown", function() {
    if(!gameStarted) return;
    myBar.classList.add("whenLoading");
    Interval = setInterval(() => {if (spinPower < 150) spinPower++;}, 15);
});

spinButton.addEventListener("mouseup", function() {
    if(!gameStarted) return;
    clearInterval(Interval);
    wheelSpinning(1);
    spinPower = 30;
    myBar.classList.remove("whenLoading");
});