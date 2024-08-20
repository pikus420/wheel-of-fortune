const phrasal = document.querySelectorAll(".phrasal")[0];
const phraseInput = document.querySelectorAll(".phraseInput")[0];
const playButton = document.querySelectorAll(".playButton")[0];
const guessPanel = document.querySelectorAll(".guessing")[0];
const letterInput = document.querySelectorAll(".letterInput")[0];
const guessButton = document.querySelectorAll(".guessButton")[0];
const eventLog = document.querySelectorAll(".log")[0];
const wheelOfFortune = document.querySelectorAll('.wheel')[0];
const showButton = document.querySelectorAll('.showButton')[0];
const vowels = ['A', 'E', 'I', 'O', 'U', 'Y', "Ą", "Ę", "Ó"];
let phrase = "";
let hiddenPhrase = [];
let len = 0;
let gameStarted = false;
let spinValue = 0;
let spinValueTemp = 0;
let wheelValues = [300, 200, 150, "NAGRODA", 250, 1500, "BANKRUT", 1000, 150, 400, 250, "GRAJ DALEJ", "STOP", 500, 250, 400, 350, 1000, 200, 300, "NIESPODZIANKA", 400, 250, 200]
let whichField = 0;
wheelValues.reverse(); //bo kręci się w lewo xD

phraseInput.focus();

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
    disableInput(letterInput);
    disableInput(guessButton);
    disableInput(showButton);
}

function inputsWhenGame() {
    disableInput(phraseInput);
    disableInput(playButton);
    enableInput(letterInput);
    enableInput(guessButton);
    enableInput(showButton);
}

inputsWhenNoGame();

function sendMessage(mess){
    const message = document.createElement("p");
    message.innerText = mess;
    eventLog.appendChild(message);
    if(eventLog.childElementCount > 7)
        eventLog.firstChild.remove();
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



//zgadywanie literek
function letterGuessing() {
    if(!gameStarted)
        return;
    else if (wheelValues[whichField] == "STOP" || wheelValues[whichField] == "BANKRUT") {
        sendMessage(`Nie powinno się odgadywać litery na tym polu...`);
        return;
    }

    let letter = letterInput.value[0].toUpperCase();
    letterInput.value = "";
    
    if(letter == "." || letter == "," || letter == ":" || letter == "\'" || letter == " " || letter == "?" || letter == "!"){
        sendMessage(`Nieprawidłowy znak!`);
        return;
    }

    let isVowel = false;
    for (let i = 0; i < vowels.length; i++) {
        if (letter == vowels[i]) {
            isVowel = true;
            break;
        }
    }
    if (isVowel) {
        if (wheelValues[whichField] != "GRAJ DALEJ") 
            sendMessage(`Pobrano 200 punktów.`);
    } 

    let counter = 0;
    for(let i = 0; i < len; i++){
        if(hiddenPhrase[i] == letter) {
            sendMessage(`Ta litera jest już odsłonięta.`);
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
            if (wheelValues[whichField] == "NAGRODA" || wheelValues[whichField] == "NIESPODZIANKA" || wheelValues[whichField] == "GRAJ DALEJ")
                sendMessage(`Uzyskano ` + counter * 500 + ` punktów.`);
            else
                sendMessage(`Uzyskano ` + counter * wheelValues[whichField] + ` punktów.`);
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
        if(onlyVowels)
            sendMessage(`Nie ma już spółgłosek!!`);
        if (guessed) {
            sendMessage(`Odgadnięto hasło.`);
            inputsWhenNoGame();
        }

    }
    else{
        sendMessage(`Ta litera nie występuje w haśle.`);
    }
}

//nowa gra
function gameStart() {
    if(phraseInput.value == ""){
        sendMessage("Należy wpisać jakieś hasło.");
        return;
    }
    eventLog.innerHTML = "";
    phrase = phrase.replace(phrase, phraseInput.value.toUpperCase());
    phraseInput.value = "";
    hiddenPhrase = phrase.split("");
    len = hiddenPhrase.length;

    for(let i = 0; i < len; i++){   
        if(hiddenPhrase[i] != " ")
            if(hiddenPhrase[i] != ",")
                if(hiddenPhrase[i] != ".")
                    if(hiddenPhrase[i] != ":")
                        if(hiddenPhrase[i] != "\'")
                            if(hiddenPhrase[i] != "?")
                                if(hiddenPhrase[i] != "!")
                                    hiddenPhrase[i] = "_";
    }
    hiddenPhrase = hiddenPhrase.join("");

    refreshDisplay(hiddenPhrase);

    sendMessage("Rozpoczęto nową grę.");
    gameStarted = true;
    guessed = 0;
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

//pokazywanie całego hasła
showButton.addEventListener("click", ()=>{
    if(!gameStarted)
        return;
    refreshDisplay(phrase);
    sendMessage("Odsłonięto hasło.");
    gameStarted = false;
    inputsWhenNoGame();
})

wheelOfFortune.addEventListener("click", ()=>{
    //kręcenie się koła
    let randomSpin = Math.floor(Math.random() * 3700) + 300;
    spinValue += randomSpin;
    spinValueTemp += randomSpin;
    const rotation = 'rotate' + '(' + spinValue + 'deg' + ')';
    wheelOfFortune.style.transform = rotation;

    //wyświetlanie wartości z koła
    while (spinValueTemp >= 360) {
        spinValueTemp -= 360;
    }
    do {
        if (spinValueTemp > -7.5 && spinValueTemp < 7.5) {
            break;
        } else {
            spinValueTemp -= 15;
            whichField += 1;
            if (whichField == 24)
                whichField = 0;
        }
    } while (true);
    setTimeout(function(){
        sendMessage(`Wylosowana wartość: ${wheelValues[whichField]}`);
        letterInput.focus();
    }, 3000);
})

