import { one_hundred_most_common_english_words } from '../resources/100-most-common-english-words.js';

const wordList = [
    ...one_hundred_most_common_english_words
];

let wordsInput;
let wordsWrapper;
let carret;
let words;
let startTime;

let totalLettersLength = 0;
let characterIndexNonDelete = 0;

let errorCount = 0;
let characterIndex = 0;
let wordIndex = 0;
let caretPosition = 0;

let lettersTyped = [];

document.addEventListener("DOMContentLoaded", function () {
    wordsInput = document.getElementById("wordsInput");
    wordsWrapper = document.getElementById("wordsWrapper");
    carret = document.getElementById("carret")
    words = document.getElementById("words")
    insertWords()
    wordsInput.focus();

    wordsInput.addEventListener("input", handleInput);
    document.getElementsByClassName("typingTest")[0].addEventListener("click", focusTypingTest);
});

function insertWords() {
    for (let index in wordList) {
        var word = wordList[index]

        var wordDiv = document.createElement("div");

        if (index == 0) {
            wordDiv.className = "word active";
        } else {
            wordDiv.className = "word";
        }

        for (let i = 0; i < word.length; i++) {
            totalLettersLength += 1;
            var letterTag = document.createElement("letter");
            letterTag.textContent = word[i];
            wordDiv.appendChild(letterTag);
        }

        words.appendChild(wordDiv);
    }
    totalLettersLength += wordList.length;
    totalLettersLength -= 1; // When last letter is typed then it's goal time.
}

function handleInput(e) {
    const input = e.data;

    // Start the timer if it hasn't started already
    if (characterIndexNonDelete === 0 && !startTime) {
        startTime = Date.now();
    }

    characterIndexNonDelete++;

    const currentWord = wordList[wordIndex];
    const elapsedTime = (Date.now() - startTime) / 1000;

    const typedLetter = {
        Time: elapsedTime,
        CurrentGrossWPM: Math.round((characterIndexNonDelete / 5) / (elapsedTime / 60)),
        Letter: input,
        Correct: currentWord[characterIndex] === input
    };

    lettersTyped.push(typedLetter);

    if (totalLettersLength === characterIndexNonDelete) {
        finished();
    }

    console.log({
        "StartTime": startTime,
        "CharacterIndexNonDelete": characterIndexNonDelete,
        "TotalLettersLength": totalLettersLength,
        "CharacterIndex": characterIndex,
        "Input": input,
        "Word": currentWord,
        "Correct": currentWord[characterIndex]
    });

    switch (true) {
        case input == null: // Handle backspace (input is null)
            colorLetter(currentWord[characterIndex], input);
            moveCaretLeft();
            break;

        case input != null && input != " ": // Handle regular input (not a space)
            colorLetter(currentWord[characterIndex], input);
            moveCaretRight();
            break;

        case input == " ": // Handle space input
            if (currentWord[characterIndex] == undefined) { // Move to the next word if end of current word
                characterIndex = -1;
                wordIndex += 1;
                let wordDivs = document.getElementsByClassName("word");
                wordDivs[wordIndex - 1].className = "word";
                wordDivs[wordIndex].className = "word active";
            } else { // Color the space character if within the word
                colorLetter(currentWord[characterIndex], input);
            }
            moveCaretRight();
            break;
    }
}

function finished() {
    fadeOutEffect(document.getElementsByClassName("typingTest")[0]);
    console.log("------------------ GOAL ------------------");
    const elapsedTime = (Date.now() - startTime) / 1000;
    const elapsedTimeMinutes = elapsedTime / 60;
    const grossWPM = Math.round((characterIndexNonDelete / 5) / elapsedTimeMinutes);
    const netWPM = Math.round(grossWPM - (errorCount / elapsedTimeMinutes));
    console.log({
        "ElapsedTime": elapsedTime,
        "ElapsedTimeMinutes": elapsedTimeMinutes,
        "GrossWPM": grossWPM,
        "NetWPM": netWPM
    });

    console.log(lettersTyped);

    var timeValues = lettersTyped.map(function (item) {
        return item.Time;
    });

    var grossWPMvalues = lettersTyped.map(function (item) {
        return item.CurrentGrossWPM;
    });

    var correctLettersTyped = lettersTyped.map(function (item) {
        return item.Correct == true;
    });

    // Using slice since the first two letters are often typed at high WPM, and will measure at < 200+
    // If this results in inaccuracies in the plot, then remove/alter.
    var grossWPMTrace = {
        x: [...timeValues],
        y: [...grossWPMvalues.slice(2)],
        type: 'scatter',
        text: [...grossWPMvalues.slice(2)],
        hoverinfo: 'text',
        mode: 'lines+markers',
        line: {
            shape: 'spline',
            smoothing: 1
        },
    };

    var layout = {
        plot_bgcolor: "#191919",
        paper_bgcolor: "#232323",
        yaxis: {
            title: 'Word per minute'
        }
    };

    var data = [grossWPMTrace];

    Plotly.newPlot('wpmChart', data, layout);

    document.getElementsByClassName("result")[0].style.visibility = "visible"
    document.getElementsByClassName("netWPM")[0].innerHTML = netWPM
    document.getElementsByClassName("grossWPM")[0].innerHTML = grossWPM

    console.log(correctLettersTyped);
    document.getElementsByClassName("cim")[0].innerHTML =
        correctLettersTyped.filter((value) => value).length + "/" +
        correctLettersTyped.filter((value) => !value).length
}

function fadeInEffect(fadeTarget) {
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity < 1) {
            fadeTarget.style.opacity += 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 25);
}

function fadeOutEffect(fadeTarget) {
    var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 25);
}

function colorLetter(correctLetter, input) {
    let parent = document.getElementsByClassName("word active");
    let letterNode = parent[0].childNodes[characterIndex];

    console.log(letterNode);

    if (correctLetter == input) {
        letterNode.className = "correct"
    } else {
        letterNode.className = "incorrect"
        errorCount += 1;
    }
}

function moveCaretLeft() {
    caretPosition = caretPosition - 12;
    carret.style.left = caretPosition + "px";
    characterIndex -= 1;
}

function moveCaretRight() {
    caretPosition = caretPosition + 12;
    carret.style.left = caretPosition + "px";
    characterIndex += 1;
}

function focusTypingTest() {
    wordsInput.focus();
}