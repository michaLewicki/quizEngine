var buttons;
var questionsArray = {}
var correctAnswer;
var whichGroup = 0;
var roundNumber = 1;
var question;
var answers;
var groupCount = 0;
var lifelines;
var questionsCount = 0;
var results;
var currentQuestion;
var pointsForCurrentQuestion = 0;
var randomNumber = 0;
var continueGame = true;

window.onload = function () {
    disable();
    buttons = document.getElementsByClassName("button");

    question = document.getElementsByClassName("question")[0];
    answers = document.getElementsByClassName("answers")[0];

    //czytanie i przetwarzanie pytañ z pliku
    var file = document.getElementById("file");
    var reader, text, textArray, questions;
    var text;
    file.onchange = function () {
        reader = new FileReader();
        reader.readAsText(file.files[0]);
        reader.onload = function (e) {
            text = reader.result;
            textArray = text.split('\n');
            questions = new Array(textArray.length - 1);
            for (let i = 0; i < textArray.length - 1; i++) {
                questions[i] = textArray[i].split('\t');
            }
            questionsCount = questions.length;
            for (let i = 0; i < questions.length; i++) {
                if (questions[i].length != 13) {
                    questionsArray = {};
                    return;
                }
                if (questionsArray[questions[i][1]] == null) questionsArray[questions[i][1]] = new Array();
                questionsArray[questions[i][1]].push([questions[i][0], questions[i][2], [questions[i][3], !!parseInt(questions[i][4], 10)], [questions[i][5], !!parseInt(questions[i][6], 10)], [questions[i][7], !!parseInt(questions[i][8], 10)], [questions[i][9], !!parseInt(questions[i][10], 10)], questions[i][11], questions[i][12]]);
            }
            file.className = "hidden";
            document.getElementsByClassName("file")[0].className = "hidden";
            document.getElementsByClassName("fileSelected")[0].classList.remove("hidden");
            console.log(questionsArray);
            document.getElementsByClassName("groupsSelection")[0].classList.remove("hidden");
        }
    }

    //start gry
    document.getElementsByClassName("start")[0].onclick = function () {
        document.getElementsByClassName("fileSelection")[0].className += " hidden";
        document.getElementsByClassName("groupsSelection")[0].className += " hidden";
        document.getElementsByClassName("points")[0].classList.remove("hidden");
        groupCount = document.getElementsByClassName("groupsSelection")[0].getElementsByTagName("input")[0].value;
        results = new Array(groupCount - 1);
        lifelines = new Array(groupCount - 1);
        for (let i = 0; i < groupCount; i++) {
            results[i] = 0;
            lifelines[i] = 1;
        }
        printTable();
        document.getElementsByClassName("number" + whichGroup)[0].className += " currentGroup";

        if (questionsCount < groupCount) {
            alert("Pyta\u0144 jest mniej ni\u017c grup!");
        }
        else {
            showPossiblePoints();
        }
    }

}

function showPossiblePoints() {
    document.getElementsByClassName("pointsSelection")[0].classList.remove("hidden");
    var left = new Array();
    for (let i in questionsArray) {
        if (questionsArray[i].length > 0) left.push(i);
    }
    var toChoose = document.getElementsByClassName("toChoose")[0];
    for (let i = 0; i < left.length; i++) {
        toChoose.innerHTML += "<button class='btn' id='" + left[i] + "' onclick='showTheQuestion(this)'>" + left[i] + "</button>";
    }
}

function buttonClicked(e) {
    markSelectedButton(buttons[parseInt(e.id, 10)]);
    showCorrectAnswer(correctAnswer);
    if (e.id == correctAnswer.id) {
        results[whichGroup - 1] += pointsForCurrentQuestion;
    }
}

function showTheQuestion(e) {
    document.getElementsByClassName("pointsSelection")[0].className += " hidden";
    document.getElementsByClassName("toChoose")[0].innerHTML = "";

    question.classList.remove("hidden");
    answers.classList.remove("hidden");

    pointsForCurrentQuestion = parseInt(e.id, 10);
    randomNumber = Math.floor(Math.random() * questionsArray[pointsForCurrentQuestion].length);
    currentQuestion = questionsArray[pointsForCurrentQuestion][randomNumber];

    question.innerHTML += "<div style='font-family: Cursive; font-size: 16px; padding: 10px;'>Pytanie numer " + currentQuestion[0] + "</div>" + currentQuestion[1];
    buttons[0].firstChild.data = "A: " + currentQuestion[2][0];
    buttons[1].firstChild.data = "B: " + currentQuestion[3][0];
    buttons[2].firstChild.data = "C: " + currentQuestion[4][0];
    buttons[3].firstChild.data = "D: " + currentQuestion[5][0];

    for (let i = 2; i < 6; i++) {
        if (currentQuestion[i][1]) {
            correctAnswer = buttons[i - 2];
            break;
        }
    }
    if (lifelines[whichGroup] != 0)
        document.getElementsByClassName("lifeButton")[whichGroup].disabled = false;

    whichGroup++;
    questionsCount--;
}

function markSelectedButton(someButton) {
    someButton.className += " yellow";
    for (let i = 0; i < 4; i++) {
        buttons[i].className += " clicked";
        buttons[i].disabled = true;
    }
    document.getElementsByClassName("lifeButton")[whichGroup - 1].disabled = true;
}

function showCorrectAnswer(someButton) {
    document.onkeydown = async function (e) {
        if (e.key == " ") {
            document.onkeydown = () => false;
            document.onclick = () => false;
            someButton.className += " green";
            await sleep(500);
            someButton.classList.remove("green");
            await sleep(500);
            someButton.className += " green";
            await sleep(500);
            someButton.classList.remove("green");
            await sleep(500);
            someButton.className += " green";

            printTable();
            if (whichGroup >= groupCount) {
                var summary = document.getElementsByClassName("summary")[0];
                summary.classList.remove("hidden");
                summary.innerHTML = "Podsumowanie po " + roundNumber + ". turze:";
                if (questionsCount < groupCount) {
                    summary.innerHTML = "<b>Koniec pyta\u0144!</b> Ostateczne wyniki, po " + roundNumber + ". turze:";
                    continueGame = false;
                    disable();
                }
                whichGroup = 0;
                roundNumber++;
            }
            document.onclick = () => true;
            var draggable = document.getElementById("draggable");
            draggable.classList.remove("hidden");
            document.getElementById("explanation-draggable").innerHTML = "<span style='font-style: italic; font-size: 20px;'>" + currentQuestion[6] + "</span><br/><br/>" + currentQuestion[7];
            dragElement(draggable);

            if(continueGame) {
                await sleep(500);
                document.onkeydown = () => true;
                changeActionToEnter();
            }
        }
        else return false;
    }
}
function changeActionToEnter() {
    disable();
    document.onkeydown = function (e) {
        if (e.key == "Enter") {
            nextQuestion();
        }
    }
}
function nextQuestion() {
    disable();
    question.className += " hidden";
    answers.className += " hidden";
    document.getElementById("draggable").className = "hidden";
    document.getElementsByClassName("summary")[0].className += " hidden";

    var currentGroup = document.getElementsByClassName("number" + whichGroup)[0];
    if (!currentGroup.classList.contains("currentGroup")) currentGroup.className += " currentGroup";

    document.getElementsByClassName("green")[0].classList.remove("green");
    document.getElementsByClassName("yellow")[0].classList.remove("yellow");
    for (let i = 0; i < 4; i++) {
        buttons[i].classList.remove("clicked");
        buttons[i].disabled = false;
    }
    question.innerHTML = "";

    questionsArray[pointsForCurrentQuestion].splice(randomNumber, 1);
    //console.log(questionsArray);

    showPossiblePoints();
}

function printTable() {
    var table = document.getElementsByClassName("tables")[0];
    table.innerHTML = "";
    var BGcolors = ["yellow", "blue", "red", "green", "white", "black"];
    var colors = ["black", "white", "white", "white", "black", "white"];
    for (let i = 0; i < groupCount; i++) {
        table.innerHTML += "<div class='table number" + i + "' style='background-color: " + BGcolors[i] + "; color: " + colors[i] + "; width: 15%;'>" + results[i] + "</div>";
    }
    table.innerHTML += "</br>";
    for (let i = 0; i < groupCount; i++) {
        table.innerHTML += "<div style='width: 15%; display: inline-block;'><button class='lifeButton' id='" + i + "' onclick='changeBackground(this)' style='background-color:" + ((lifelines[i] == 1) ? "greenyellow" : "crimson") + ";'></button></div>";
        document.getElementsByClassName("lifeButton")[i].disabled = true;
    }
}
function changeBackground(e) {
    lifelines[e.id] = 0;
    e.style.background = "cyan";
    e.disabled = true;
}

function dragElement(element) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.style.top = 30 + "%";
    element.style.left = 20 + "%";
    if (document.getElementById("explanation-" + element.id)) {
        document.getElementById("explanation-" + element.id).onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function disable() {
    document.onkeydown = function (e) {
        if (e.key == "Escape") return true;
        return false;
    }
}
function enable() {
    document.onkeydown = function (e) {
        return true;
    }
}
window.onbeforeunload = function () {
    return "Po od\u015bwie\u017ceniu wszystkie dane zostan\u0105 utracone!!!";
}
