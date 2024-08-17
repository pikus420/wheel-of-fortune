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

function sendMessage(mess){
    const message = document.createElement("p");
    message.innerText = mess;
    eventLog.appendChild(message);
    if(eventLog.childElementCount > 7)
        eventLog.firstChild.remove();
}

function refreshDisplay(phrase){
    phrasal.innerHTML = "";
    const toDisplay = phrase.split("");
    toDisplay.forEach(letter => {
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
        phrasal.appendChild(tile);
    });
}

//nowa gra
playButton.addEventListener("click", ()=>{
    if(phraseInput.value == ""){
        sendMessage("Należy wpisać jakieś hasło.")
        return;
    }
    eventLog.innerHTML = ""
    phrase = phrase.replace(phrase, phraseInput.value.toUpperCase());
    phraseInput.value = "";
    hiddenPhrase = phrase.split("");
    len = hiddenPhrase.length

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
    hiddenPhrase = hiddenPhrase.join("")

    refreshDisplay(hiddenPhrase);

    sendMessage("Rozpoczęto nową grę.");
    gameStarted = true;
    phraseInput.style.opacity = 0.3;
    playButton.style.opacity = 0.3;
})

//zgadywanie literek
guessButton.addEventListener("click", ()=>{
    if(!gameStarted)
        return;

    let letter = letterInput.value[0].toUpperCase();
    letterInput.value = "";
    
    if(letter == "." || letter == "," || letter == ":" || letter == "\'" || letter == " " || letter == "?" || letter == "!"){
        sendMessage(`Nieprawidłowy znak!`);
        return;
    }

    let counter = 0;
    for(let i = 0; i < len; i++){

        if(phrase[i] == letter){
            counter++;
            hiddenPhrase = hiddenPhrase.substring(0, i) + letter + hiddenPhrase.substring(i + 1);
        }
            
    }

    if(counter > 0){
        refreshDisplay(hiddenPhrase);
        sendMessage(`${letter} występuje ${counter} raz(y).`);
        let onlyVowels = true;
        for(let i = 0; i < len; i++){
            let notAVowel = 0;
            if(hiddenPhrase[i] == "_"){
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

    }
    else{
        sendMessage(`${letter} nie występuje w haśle.`);
    }
})

//pokazywanie całego hasła
showButton.addEventListener("click", ()=>{
    if(!gameStarted)
        return;
    refreshDisplay(phrase);
})

wheelOfFortune.addEventListener("click", ()=>{
    let randomSpin = Math.floor(Math.random() * 3700) + 300;
    spinValue += randomSpin;
    const rotation = 'rotate' + '(' + spinValue + 'deg' + ')';

    wheelOfFortune.style.transform = rotation; 
})

