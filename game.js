// --- Utility Functions ---

// Greatest Common Divisor
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// Random Integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format a fraction, simplifying it
function formatFraction(num, den) {
    if (den === 0) return "undefined";
    let common = gcd(num, den);
    num = num / common;
    den = den / common;

    // Handle negatives
    if (den < 0) {
        num = -num;
        den = -den;
    }

    if (den === 1) return `${num}`;
    if (num === 0) return "0";
    return `${num}/${den}`;
}

// --- Question Generators ---

// 1. Basic Arithmetic & BODMAS (No Indices)
function generateBodmas() {
    const templates = [
        // a + b * c
        () => {
            const a = getRandomInt(1, 20);
            const b = getRandomInt(2, 9);
            const c = getRandomInt(2, 9);
            return { question: `${a} + ${b} × ${c}`, answer: `${a + b * c}` };
        },
        // (a + b) * c
        () => {
            const a = getRandomInt(1, 10);
            const b = getRandomInt(1, 10);
            const c = getRandomInt(2, 6);
            return { question: `(${a} + ${b}) × ${c}`, answer: `${(a + b) * c}` };
        },
        // a * b - c
        () => {
            const a = getRandomInt(2, 9);
            const b = getRandomInt(2, 9);
            const c = getRandomInt(1, 20);
            return { question: `${a} × ${b} - ${c}`, answer: `${a * b - c}` };
        },
        // a + (b / c) - Ensure clean division
        () => {
            const c = getRandomInt(2, 10);
            const ans = getRandomInt(2, 10);
            const b = c * ans; // b / c = ans
            const a = getRandomInt(1, 20);
            return { question: `${a} + (${b} ÷ ${c})`, answer: `${a + ans}` };
        },
        // a / b + c - Ensure clean division
        () => {
            const b = getRandomInt(2, 10);
            const ans = getRandomInt(2, 10);
            const a = b * ans;
            const c = getRandomInt(1, 20);
            return { question: `${a} ÷ ${b} + ${c}`, answer: `${ans + c}` };
        }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template();
}

// 2. Fractions
function generateFraction() {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let num1 = getRandomInt(1, 5);
    let den1 = getRandomInt(2, 6);
    let num2 = getRandomInt(1, 5);
    let den2 = getRandomInt(2, 6);

    let answerNum, answerDen;

    if (op === '+') {
        answerNum = num1 * den2 + num2 * den1;
        answerDen = den1 * den2;
    } else if (op === '-') {
        // Ensure positive result for 5th grade usually, but let's just do it and allow negatives if needed
        answerNum = num1 * den2 - num2 * den1;
        answerDen = den1 * den2;
    } else if (op === '×') {
        answerNum = num1 * num2;
        answerDen = den1 * den2;
    } else if (op === '÷') {
        answerNum = num1 * den2;
        answerDen = den1 * num2;
    }

    const questionStr = `${num1}/${den1} ${op} ${num2}/${den2}`;
    const answerStr = formatFraction(answerNum, answerDen);

    return { question: questionStr, answer: answerStr };
}

function generateQuestion() {
    // 60% chance for BODMAS, 40% for fractions
    const r = Math.random();
    if (r < 0.6) {
        return generateBodmas();
    } else {
        return generateFraction();
    }
}

// --- Game State & Logic ---

let currentQuestion = null;
let score = 0;
let highScore = localStorage.getItem('mathGameHighScore') || 0;
let lives = 3;

// --- DOM Elements ---
document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const gameOverScreen = document.getElementById("game-over-screen");

    const startBtn = document.getElementById("start-btn");
    const submitBtn = document.getElementById("submit-btn");
    const restartBtn = document.getElementById("restart-btn");
    const answerInput = document.getElementById("answer-input");

    const questionEl = document.getElementById("question");
    const scoreDisplay = document.getElementById("score-display");
    const highScoreDisplay = document.getElementById("high-score-display");
    const livesDisplay = document.getElementById("lives-display");
    const feedbackMsg = document.getElementById("feedback-message");

    const finalScoreEl = document.getElementById("final-score");
    const newHighScoreMsg = document.getElementById("new-high-score-msg");

    // Initialize High Score display
    highScoreDisplay.textContent = `High Score: ${highScore}`;

    function updateStats() {
        scoreDisplay.textContent = `Score: ${score}`;
        let hearts = "";
        for(let i=0; i<lives; i++) hearts += "❤️";
        livesDisplay.textContent = `Lives: ${hearts}`;
    }

    function setNextQuestion() {
        currentQuestion = generateQuestion();
        questionEl.textContent = currentQuestion.question + " = ?";
        answerInput.value = "";
        answerInput.focus();
    }

    function endGame() {
        gameScreen.classList.add("hidden");
        gameOverScreen.classList.remove("hidden");
        finalScoreEl.textContent = `Your Score: ${score}`;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mathGameHighScore', highScore);
            newHighScoreMsg.classList.remove("hidden");
            highScoreDisplay.textContent = `High Score: ${highScore}`;
        } else {
            newHighScoreMsg.classList.add("hidden");
        }
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        if (userAnswer === "") return;

        // Strip spaces from user answer (e.g. " 1 / 2 " -> "1/2")
        const cleanUserAnswer = userAnswer.replace(/\s/g, '');

        if (cleanUserAnswer === currentQuestion.answer) {
            // Correct
            score += 10;
            feedbackMsg.textContent = "Correct! 🎉";
            feedbackMsg.className = "correct";
            updateStats();
            setTimeout(() => {
                feedbackMsg.textContent = "";
                feedbackMsg.className = "";
                setNextQuestion();
            }, 800);
        } else {
            // Incorrect
            lives -= 1;
            feedbackMsg.textContent = `Oops! The correct answer was ${currentQuestion.answer}`;
            feedbackMsg.className = "incorrect";
            updateStats();

            if (lives <= 0) {
                setTimeout(() => {
                    feedbackMsg.textContent = "";
                    feedbackMsg.className = "";
                    endGame();
                }, 1500);
            } else {
                setTimeout(() => {
                    feedbackMsg.textContent = "";
                    feedbackMsg.className = "";
                    setNextQuestion();
                }, 1500);
            }
        }
    }

    // Event Listeners
    startBtn.addEventListener("click", () => {
        score = 0;
        lives = 3;
        updateStats();
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        setNextQuestion();
    });

    submitBtn.addEventListener("click", checkAnswer);

    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            checkAnswer();
        }
    });

    restartBtn.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");
    });
});
