const wordList = [
    "test",
    "test",
    "test"
];

let wordsInput;
let wordsWrapper;
let carret;
let words;
let startTime;

let totalLettersLength = 0;
let characterIndexNonDelete = 0;

errorCount = 0;
let characterIndex = 0;
let wordIndex = 0;

let lettersTyped = [];

document.addEventListener("DOMContentLoaded", function () {
    wordsInput = document.getElementById("wordsInput");
    wordsWrapper = document.getElementById("wordsWrapper");
    carret = document.getElementById("carret")
    words = document.getElementById("words")
    insertWords()
    wordsInput.focus();

    wordsInput.addEventListener("input", handleInput);
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
    var input = e.data;

    if (characterIndexNonDelete == 0) {
        if (!startTime) {
            startTime = Date.now();
        }
    }

    characterIndexNonDelete += 1;
    let currentWord = wordList[wordIndex];

    lettersTyped.push({
        "Time": (Date.now() - startTime) / 1000,
        "CurrentGrossWPM": Math.round((characterIndexNonDelete / 5) / (((Date.now() - startTime) / 1000) / 60)),
        "Letter": input,
        "Correct": currentWord[characterIndex] == input
    });

    if (totalLettersLength == characterIndexNonDelete) {
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

    if (input == null) {
        colorLetter(currentWord[characterIndex], input);
        moveCaretLeft();
    } else if (input != null && input != " ") {
        colorLetter(currentWord[characterIndex], input);
        moveCaretRight();
    } else if (input == " ") {
        moveCaretRight();
        if (currentWord[characterIndex] == undefined) {
            characterIndex = 0;
            wordIndex += 1;
            let wordDivs = document.getElementsByClassName("word");

            wordDivs[wordIndex - 1].className = "word";
            wordDivs[wordIndex].className = "word active";
        }
    }
}

function finished() {
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
        xaxis: {
            title: 'Time'
        },
        yaxis: {
            title: 'WPM'
        }
    };

    var data = [grossWPMTrace];

    Plotly.newPlot('wpmChart', data, layout);
}

function colorLetter(correctLetter, input) {
    let parent = document.getElementsByClassName("word active");
    let letterNode = parent[0].childNodes[characterIndex];

    let correct = correctLetter == input;

    if (correct) {
        letterNode.className = "correct"
    } else {
        letterNode.className = "incorrect"
        errorCount += 1;
    }
}

function moveCaretLeft() {
    currentCarretPosition = carret.getBoundingClientRect().right;
    caretPosition = Math.min(currentCarretPosition - 10);
    carret.style.left = caretPosition + "px";
    characterIndex -= 1;
}

function moveCaretRight() {
    currentCarretPosition = carret.getBoundingClientRect().right;
    caretPosition = Math.min(currentCarretPosition + 10);
    carret.style.left = caretPosition + "px";
    characterIndex += 1;
}
