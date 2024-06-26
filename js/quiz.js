// const
const BASE_URL = "https://sheetdb.io/api/v1/xvti32evlv42c"

let timerId;
let time = 0;

document.addEventListener('DOMContentLoaded', function () {

    // start quiz 
    // const timer = document.getElementById("timer");
    const quizForm = document.getElementById('quiz-form');
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restart-btn');
    const finishBtn = document.getElementById("finish-btn");

    const params = new URLSearchParams(window.location.search);
    const tense = params.get('tense');
    let quizDB = data[tense];

    let quizData = [];

    function shuffleOptions(options) {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options;
    }

    function loadQuiz() {
        quizForm.innerHTML = '';
        resultDiv.innerHTML = '';

        quizData = quizDB.sort(() => Math.random() - 0.5).slice(0, 5);

        quizData.forEach((quizItem, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question';

            const questionP = document.createElement('p');
            questionP.textContent = `${index + 1}. ${quizItem.question}`;
            questionDiv.appendChild(questionP);

            if (quizItem.description) {
                const descriptionP = document.createElement('p');
                descriptionP.textContent = quizItem.description;
                descriptionP.className = 'description';
                questionDiv.appendChild(descriptionP);
            }

            if (quizItem.type === 'MULTIPLE CHOICE') {
                const optionsUl = document.createElement('ul');
                optionsUl.className = 'options';

                const options = [];
                for (let i = 1; i <= 4; i++) {
                    if (quizItem[`option_${i}`]) {
                        options.push({
                            text: quizItem[`option_${i}`],
                            correct: i === 1
                        });
                    }
                }
                shuffleOptions(options);

                options.forEach((option, optionIndex) => {
                    const optionLi = document.createElement('li');
                    const optionInput = document.createElement('input');
                    optionInput.type = 'radio';
                    optionInput.name = `question${index + 1}`;
                    optionInput.value = option.text;
                    optionLi.appendChild(optionInput);
                    optionLi.appendChild(document.createTextNode(option.text));
                    optionsUl.appendChild(optionLi);
                });

                questionDiv.appendChild(optionsUl);
            } else if (quizItem.type === 'TEXT') {
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.name = `question${index + 1}`;
                textInput.placeholder = 'Жауапты енгізіңіз';
                questionDiv.appendChild(textInput);
            }

            quizForm.appendChild(questionDiv);
        });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Тексеру';
        submitBtn.addEventListener('click', showResults);

        quizForm.appendChild(submitBtn);
    }

    // run timer 
    startTimer();

    function showResults() {
        let score = 0;
        let allAnswered = true; // Flag to track if all questions are answered

        quizData.forEach((quizItem, index) => {
            const questionDiv = quizForm.children[index];
            let isCorrect = false;
            let answered = false; // Flag to track if the question is answered

            if (quizItem.type === 'MULTIPLE CHOICE') {
                const selectedOption = questionDiv.querySelector(`input[name="question${index + 1}"]:checked`);
                if (selectedOption) {
                    answered = true;
                    isCorrect = selectedOption.value === quizItem[`option_1`];
                }
            } else if (quizItem.type === 'TEXT') {
                const textInput = questionDiv.querySelector(`input[name="question${index + 1}"]`);
                if (textInput) {
                    answered = true;
                    isCorrect = compareTexts(textInput.value, quizItem[`option_1`]);
                }
            }

            if (answered) {
                if (isCorrect) {
                    score++;
                    questionDiv.classList.add('correct');
                    questionDiv.classList.remove('incorrect');
                } else {
                    questionDiv.classList.add('incorrect');
                    questionDiv.classList.remove('correct');
                }
            } else {
                allAnswered = false;
                questionDiv.classList.add('incorrect');
            }
        });

        if (!allAnswered) {
            resultDiv.textContent = 'Барлық сұрақтарға жауап беріңіз!';
        } else {
            quizForm.classList.add("all-answered");
            resultDiv.textContent = `Сіздің үпайыңыз ${score}/${quizData.length}`;
            this.disabled = true;

            // save results in sheet
           requestToSaveResult(`${score}/${quizData.length}`)
        }

    }

    function restartQuiz() {
        resultDiv.innerHTML = '';
        quizForm.classList.remove("all-answered");
        loadQuiz();
    }

    function normalizeText(text) {
        text = text.toLowerCase();
        // Remove spaces and symbols using a regex
        text = text.replace(/[\W_]/g, '');
        return text;
    }

    function compareTexts(text1, text2) {
        return normalizeText(text1) === normalizeText(text2);
    }

    restartBtn.addEventListener('click', restartQuiz);

    loadQuiz();
});


function requestToSaveResult(score) {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user?.name && !user?.surname) {
        window.location.href = "/";
    }
    console.log(user);

    const url = window.location.href;
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    const title = searchParams.get('tense');
    
    showLoading();
    fetch(BASE_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data :[{
            id: new Date().getTime(),
            score,
            name: user.name,
            surname: user.surname,
            title,
            time:getFormatedTime()
        }]})
    })
    .catch(() => {})
    .finally(() => {
        hideLoading();
        // startTimer()
        clearInterval(timerId);
        startTimer();
    })
}

function showLoading() {
    document.getElementById('loader-container').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loader-container').style.display = 'none';
}


// timer
function displayTime() {

    document.getElementById('timer').textContent = getFormatedTime();
}
function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (time >= 3600) {
        clearInterval(timer);
        alert("Time's up!");
        time= 0
        return;
    }
    time ++;
    displayTime();
}

function getFormatedTime() {
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return  `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function finishQuiz() {
    window.location.href = "/"
}