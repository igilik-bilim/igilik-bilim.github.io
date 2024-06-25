
document.addEventListener('DOMContentLoaded', function () {
    // modal vars
    const modal = document.getElementById("modal");
    const userName = document.getElementById("modal-form-name");
    const userSurname = document.getElementById("modal-form-surname");
    const modalSubmitButton = document.getElementById("modal-submit-btn");

    // Show the modal 
    modal?.classList?.add("show");

    // Close the modal 
    modalSubmitButton?.addEventListener("click", () => {
        console.log("User name ",userName.value,)
        if(userName.value?.length && userSurname.value?.length) {
            localStorage.setItem("user",JSON.stringify({name: userName.value,surname: userSurname.value}));
           
            modal.classList.remove("show");
            setTimeout(() => {
                modal.style.display = "none";
            }, 500); 
        }else{
            alert("Fill fields")
        } 
    });


    // start quiz 
    const quizForm = document.getElementById('quiz-form');
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restart-btn');

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

            // save results in sheet
           
            const user = JSON.parse(localStorage.getItem("user"));
            console.log({
                id: new Date().getTime().toString(),
                name: user.name,
                surname: user.surname,
                score: `${score}/${quizData.length}`
        });
            fetch("https://sheetdb.io/api/v1/dxoui1uk1vetj", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ data :[{
                    id: new Date().getTime(),
                    name: user.name,
                    surname: user.surname,
                    score: `${score}/${quizData.length}`
                }]})
            })
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
