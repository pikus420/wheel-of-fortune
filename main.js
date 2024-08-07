const phrasal = document.querySelectorAll(".phrasal")[0];
const phraseInput = document.querySelectorAll(".phraseInput")[0];
const playButton = document.querySelectorAll(".playButton")[0];
const guessPanel = document.querySelectorAll(".guessing")[0];
const letterInput = document.querySelectorAll(".letterInput")[0];
const guessButton = document.querySelectorAll(".guessButton")[0];
const eventLog = document.querySelectorAll(".log")[0];
const wheelOfFortune = document.querySelectorAll('.wheel')[0];
const vowels = ['A', 'E', 'I', 'O', 'U', 'Y', "Ą", "Ę", "Ó"];
let phrase = "";
let hiddenPhrase = [];
let len = 0;
let gameStarted = false;

function sendMessage(mess){
    const message = document.createElement("p");
    message.innerText = mess;
    eventLog.appendChild(message);
    if(eventLog.childElementCount > 7)
        eventLog.firstChild.remove();
}

playButton.addEventListener("click", ()=>{
    if(phraseInput.value == ""){
        sendMessage("Należy wpisać jakieś hasło.")
        return;
    }

    phrase = phrase.replace(phrase, phraseInput.value.toUpperCase());
    phraseInput.value = "";
    hiddenPhrase = phrase.split("");
    len = hiddenPhrase.length

    for(let i = 0; i < len; i++){   
        if(hiddenPhrase[i] != " ")
            hiddenPhrase[i] = "_";
    }
    hiddenPhrase = hiddenPhrase.join("")

    phrasal.innerText = hiddenPhrase;
    sendMessage("Rozpoczęto nową grę.");
    gameStarted = true;
})


guessButton.addEventListener("click", ()=>{
    if(!gameStarted)
        return;
    let letter = letterInput.value[0].toUpperCase();
    letterInput.value = "";
    let counter = 0;
    for(let i = 0; i < len; i++){

        if(phrase[i] == letter){
            counter++;
            hiddenPhrase = hiddenPhrase.substring(0, i) + letter + hiddenPhrase.substring(i + 1);
        }
            
    }

    if(counter > 0){
        phrasal.innerText = hiddenPhrase;
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
                if(notAVowel == 6){
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

wheelOfFortune.addEventListener("click", ()=>{
    let randomSpin = Math.floor(Math.random() * 500) * 20;

    const rotation = 'rotate' + '(' + randomSpin + 'deg' + ')';

    wheelOfFortune.style.transform = rotation; 
})

