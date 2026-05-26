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
let currentMode = null; // 'mcq' or 'numpad'
let score = 0;
let highScore = localStorage.getItem('mathGameHighScore') || 0;
let lives = 3;

// --- DOM Elements ---
document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const gameOverScreen = document.getElementById("game-over-screen");

    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");

    const questionEl = document.getElementById("question");
    const scoreDisplay = document.getElementById("score-display");
    const highScoreDisplay = document.getElementById("high-score-display");
    const livesDisplay = document.getElementById("lives-display");
    const feedbackMsg = document.getElementById("feedback-message");
    
    const finalScoreEl = document.getElementById("final-score");
    const newHighScoreMsg = document.getElementById("new-high-score-msg");

    // New Mixed Input Elements
    const mcqContainer = document.getElementById("mcq-container");
    const mcqBtns = document.querySelectorAll(".mcq-btn");
    
    const numpadContainer = document.getElementById("numpad-container");
    const numpadDisplayContainer = document.getElementById("numpad-display-container");
    const numpadDisplay = document.getElementById("numpad-display");
    const numpadBtns = document.querySelectorAll(".numpad-btn:not(.action-btn)");
    const numpadBackspace = document.getElementById("numpad-backspace");
    const numpadSubmit = document.getElementById("numpad-submit");

    // Initialize High Score display
    highScoreDisplay.textContent = `High Score: ${highScore}`;

    function updateStats() {
        scoreDisplay.textContent = `Score: ${score}`;
        let hearts = "";
        for(let i=0; i<lives; i++) hearts += "❤️";
        livesDisplay.textContent = `Lives: ${hearts}`;
    }

    function generateDistractors(correctAnswer) {
        const distractors = new Set();
        let isFraction = correctAnswer.includes('/');
        
        while(distractors.size < 3) {
            if (isFraction) {
                // Generate fake fraction
                let parts = correctAnswer.split('/');
                let num = parseInt(parts[0]);
                let den = parseInt(parts[1]);
                
                // mutate slightly
                let r = Math.random();
                let fakeNum = num;
                let fakeDen = den;
                
                if (r < 0.3) fakeNum += getRandomInt(1, 3);
                else if (r < 0.6) fakeDen += getRandomInt(1, 3);
                else {
                    fakeNum -= getRandomInt(1, 2);
                    fakeDen += getRandomInt(1, 2);
                }
                
                if (fakeDen <= 0) fakeDen = 2; // safety
                let fakeAns = formatFraction(fakeNum, fakeDen);
                if (fakeAns !== correctAnswer && fakeAns !== "undefined") {
                    distractors.add(fakeAns);
                }
            } else {
                // Generate fake integer
                let ansInt = parseInt(correctAnswer);
                let offset = getRandomInt(-5, 5);
                if (offset === 0) offset = 1;
                
                // sometimes multiply by 10 for common mistakes, or add 10
                if (Math.random() < 0.2) offset *= 10;
                
                let fakeAns = (ansInt + offset).toString();
                if (fakeAns !== correctAnswer) {
                    distractors.add(fakeAns);
                }
            }
        }
        return Array.from(distractors);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function setNextQuestion() {
        currentQuestion = generateQuestion();
        questionEl.textContent = currentQuestion.question + " = ?";
        
        // Randomly pick mode
        currentMode = Math.random() < 0.5 ? 'mcq' : 'numpad';
        
        if (currentMode === 'mcq') {
            numpadContainer.classList.add('hidden');
            numpadDisplayContainer.classList.add('hidden');
            mcqContainer.classList.remove('hidden');
            
            // Setup MCQ buttons
            const options = generateDistractors(currentQuestion.answer);
            options.push(currentQuestion.answer);
            const shuffled = shuffleArray(options);
            
            mcqBtns.forEach((btn, index) => {
                btn.textContent = shuffled[index];
                btn.onclick = () => handleAnswer(btn.textContent);
                btn.disabled = false;
            });
            
        } else {
            mcqContainer.classList.add('hidden');
            numpadContainer.classList.remove('hidden');
            numpadDisplayContainer.classList.remove('hidden');
            numpadDisplay.textContent = "";
        }
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

    function handleAnswer(userAnswer) {
        // Disable buttons temporarily to prevent double clicks
        if(currentMode === 'mcq') {
             mcqBtns.forEach(btn => btn.disabled = true);
        }

        const cleanUserAnswer = userAnswer.trim().toLowerCase().replace(/\s/g, '');

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

    restartBtn.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");
    });
    
    // Numpad events
    numpadBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            numpadDisplay.textContent += btn.textContent;
        });
    });
    
    numpadBackspace.addEventListener("click", () => {
        numpadDisplay.textContent = numpadDisplay.textContent.slice(0, -1);
    });
    
    numpadSubmit.addEventListener("click", () => {
        if (numpadDisplay.textContent.length > 0) {
            handleAnswer(numpadDisplay.textContent);
        }
    });

    // Keyboard support for desktop testing
    document.addEventListener("keydown", (e) => {
        if (gameScreen.classList.contains("hidden") || currentMode !== 'numpad') return;
        
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','-','/'];
        if (validKeys.includes(e.key)) {
            numpadDisplay.textContent += e.key;
        } else if (e.key === "Backspace") {
            numpadDisplay.textContent = numpadDisplay.textContent.slice(0, -1);
        } else if (e.key === "Enter") {
            if (numpadDisplay.textContent.length > 0) {
                handleAnswer(numpadDisplay.textContent);
            }
        }
    });
});
