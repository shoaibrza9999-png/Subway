// --- Utility Functions ---
function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { let t = b; b = a % b; a = t; }
    return a;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatFraction(num, den) {
    if (den === 0) return "undefined";
    let common = gcd(num, den);
    num = num / common; den = den / common;
    if (den < 0) { num = -num; den = -den; }
    if (den === 1) return `${num}`;
    if (num === 0) return "0";
    return `${num}/${den}`;
}

// --- Global State ---
let currentQuestion = null;
let currentMode = null; // input mode: 'mcq' or 'numpad'
let gameConfig = { mode: 'survival', diff: 'medium', cat: 'mixed' };

// Game Session
let score = 0;
let lives = 3;
let timeLeft = 60;
let timerInterval = null;
let streak = 0;

// Persistent Stats
let stats = JSON.parse(localStorage.getItem('mathGameStats')) || {
    highScore: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    highestStreak: 0
};

// --- Audio System (Procedural) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'incorrect') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// --- Generators ---
function getDiffMultipliers() {
    if (gameConfig.diff === 'easy') return { maxAdd: 10, maxMul: 5 };
    if (gameConfig.diff === 'hard') return { maxAdd: 50, maxMul: 15 };
    return { maxAdd: 20, maxMul: 9 }; // medium
}

function generateBodmas() {
    const { maxAdd, maxMul } = getDiffMultipliers();
    const templates = [
        () => { // a + b * c
            const a = getRandomInt(1, maxAdd);
            const b = getRandomInt(2, maxMul);
            const c = getRandomInt(2, maxMul);
            return { question: `${a} + ${b} × ${c}`, answer: `${a + b * c}` };
        },
        () => { // (a + b) * c
            const a = getRandomInt(1, maxAdd/2);
            const b = getRandomInt(1, maxAdd/2);
            const c = getRandomInt(2, maxMul);
            return { question: `(${a} + ${b}) × ${c}`, answer: `${(a + b) * c}` };
        },
        () => { // a * b - c
            const a = getRandomInt(2, maxMul);
            const b = getRandomInt(2, maxMul);
            const c = getRandomInt(1, maxAdd);
            return { question: `${a} × ${b} - ${c}`, answer: `${a * b - c}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateFraction() {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const maxNum = gameConfig.diff === 'easy' ? 4 : (gameConfig.diff === 'hard' ? 9 : 6);
    
    let num1 = getRandomInt(1, maxNum-1); let den1 = getRandomInt(2, maxNum);
    let num2 = getRandomInt(1, maxNum-1); let den2 = getRandomInt(2, maxNum);
    
    // Easy mode keeps common denominators for add/sub
    if (gameConfig.diff === 'easy' && (op === '+' || op === '-')) {
        den2 = den1;
    }

    let aNum, aDen;
    if (op === '+') { aNum = num1*den2 + num2*den1; aDen = den1*den2; }
    else if (op === '-') { aNum = num1*den2 - num2*den1; aDen = den1*den2; }
    else if (op === '×') { aNum = num1*num2; aDen = den1*den2; }
    else { aNum = num1*den2; aDen = den1*num2; } // ÷

    return { question: `${num1}/${den1} ${op} ${num2}/${den2}`, answer: formatFraction(aNum, aDen) };
}

function generateQuestion() {
    let type = gameConfig.cat;
    if (type === 'mixed') type = Math.random() < 0.5 ? 'bodmas' : 'fractions';
    return type === 'bodmas' ? generateBodmas() : generateFraction();
}

// --- Logic Helpers ---
function generateDistractors(correctAnswer) {
    const distractors = new Set();
    let isFraction = correctAnswer.includes('/');
    while(distractors.size < 3) {
        if (isFraction) {
            let parts = correctAnswer.split('/');
            let num = parseInt(parts[0]); let den = parseInt(parts[1]);
            let r = Math.random();
            let fakeNum = num, fakeDen = den;
            if (r < 0.3) fakeNum += getRandomInt(1, 3);
            else if (r < 0.6) fakeDen += getRandomInt(1, 3);
            else { fakeNum -= getRandomInt(1, 2); fakeDen += getRandomInt(1, 2); }
            if (fakeDen <= 0) fakeDen = 2;
            let fakeAns = formatFraction(fakeNum, fakeDen);
            if (fakeAns !== correctAnswer && fakeAns !== "undefined") distractors.add(fakeAns);
        } else {
            let ansInt = parseInt(correctAnswer);
            let offset = getRandomInt(-5, 5) || 1;
            if (Math.random() < 0.2) offset *= 10;
            let fakeAns = (ansInt + offset).toString();
            if (fakeAns !== correctAnswer) distractors.add(fakeAns);
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

function saveStats() {
    localStorage.setItem('mathGameStats', JSON.stringify(stats));
}

// --- DOM Binding ---
document.addEventListener("DOMContentLoaded", () => {
    // Screens
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const gameOverScreen = document.getElementById("game-over-screen");
    const statsScreen = document.getElementById("stats-screen");

    // Buttons
    const startBtn = document.getElementById("start-btn");
    const statsBtn = document.getElementById("stats-btn");
    const restartBtn = document.getElementById("restart-btn");
    const backToMenuBtn = document.getElementById("back-to-menu-btn");

    // Config Inputs
    const modeSelect = document.getElementById("mode-select");
    const diffSelect = document.getElementById("diff-select");
    const catSelect = document.getElementById("cat-select");

    // Game UI
    const questionEl = document.getElementById("question");
    const scoreDisplay = document.getElementById("score-display");
    const comboDisplay = document.getElementById("combo-display");
    const highScoreDisplay = document.getElementById("high-score-display");
    const livesDisplay = document.getElementById("lives-display");
    const feedbackMsg = document.getElementById("feedback-message");
    const nextQuestionBtn = document.getElementById("next-question-btn");
    const mascot = document.getElementById("mascot");
    
    // Inputs
    const mcqContainer = document.getElementById("mcq-container");
    const mcqBtns = document.querySelectorAll(".mcq-btn");
    const numpadContainer = document.getElementById("numpad-container");
    const numpadDisplayContainer = document.getElementById("numpad-display-container");
    const numpadDisplay = document.getElementById("numpad-display");
    const numpadBtns = document.querySelectorAll(".numpad-btn:not(.action-btn)");
    const numpadBackspace = document.getElementById("numpad-backspace");
    const numpadSubmit = document.getElementById("numpad-submit");

    highScoreDisplay.textContent = `High Score: ${stats.highScore}`;

    function updateStatsUI() {
        scoreDisplay.innerHTML = `Score: ${score} <span id="combo-display" class="${streak >= 3 ? '' : 'hidden'}">🔥 x${Math.floor(streak/3)+1}</span>`;
        if (gameConfig.mode === 'survival') {
            let hearts = ""; for(let i=0; i<lives; i++) hearts += "❤️";
            livesDisplay.textContent = `Lives: ${hearts}`;
        } else {
            livesDisplay.textContent = `Time: ${timeLeft}s`;
        }
    }

    function changeMascot(state) {
        // state: 'idle', 'correct', 'incorrect'
        // Since we only have one mascot.png currently, we can use CSS filters or rotation
        // In a real app we'd change src="mascot-happy.png"
        if(mascot) {
             if (state === 'correct') {
                 mascot.style.transform = "scale(1.1) rotate(-5deg)";
                 mascot.style.filter = "brightness(1.2)";
             } else if (state === 'incorrect') {
                 mascot.style.transform = "scale(0.9) rotate(5deg)";
                 mascot.style.filter = "grayscale(0.5)";
             } else {
                 mascot.style.transform = "scale(1) rotate(0deg)";
                 mascot.style.filter = "none";
             }
        }
    }

    function setNextQuestion() {
        nextQuestionBtn.classList.add("hidden");
        feedbackMsg.textContent = "";
        feedbackMsg.className = "";
        currentQuestion = generateQuestion();
        questionEl.textContent = currentQuestion.question + " = ?";
        currentMode = Math.random() < 0.5 ? 'mcq' : 'numpad';
        
        if (currentMode === 'mcq') {
            numpadContainer.classList.add('hidden');
            numpadDisplayContainer.classList.add('hidden');
            mcqContainer.classList.remove('hidden');
            
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
        changeMascot('idle');
    }

    function endGame() {
        clearInterval(timerInterval);
        gameScreen.classList.add("hidden");
        gameOverScreen.classList.remove("hidden");
        document.getElementById("final-score").textContent = `Your Score: ${score}`;

        if (score > stats.highScore) {
            stats.highScore = score;
            document.getElementById("new-high-score-msg").classList.remove("hidden");
            highScoreDisplay.textContent = `High Score: ${stats.highScore}`;
        } else {
            document.getElementById("new-high-score-msg").classList.add("hidden");
        }
        saveStats();
    }

    function handleAnswer(userAnswer) {
        if(currentMode === 'mcq') mcqBtns.forEach(btn => btn.disabled = true);
        
        stats.totalAnswered++;
        const cleanAns = userAnswer.trim().toLowerCase().replace(/\s/g, '');
        queueAnswer(currentQuestion.question, cleanAns, currentQuestion.answer, cleanAns === currentQuestion.answer);

        if (cleanAns === currentQuestion.answer) {
            stats.totalCorrect++;
            streak++;
            if (streak > stats.highestStreak) stats.highestStreak = streak;
            
            let multiplier = Math.floor(streak / 3) + 1; // Combo multiplier
            score += 10 * multiplier;
            
            feedbackMsg.textContent = "Correct! 🎉";
            feedbackMsg.className = "correct";
            playSound('correct');
            changeMascot('correct');
        } else {
            streak = 0;
            if (gameConfig.mode === 'survival') lives -= 1;
            else timeLeft -= 5; // penalty in time mode
            
            feedbackMsg.textContent = `Oops! Answer was ${currentQuestion.answer}`;
            feedbackMsg.className = "incorrect";
            playSound('incorrect');
            changeMascot('incorrect');
        }
        
        updateStatsUI();
        saveStats();

        if (gameConfig.mode === 'survival' && lives <= 0) {
            setTimeout(endGame, 1500);
            return;
        }

        if (cleanAns !== currentQuestion.answer && gameConfig.mode === 'survival') {
            nextQuestionBtn.classList.remove("hidden");
        } else {
            let delay = (cleanAns === currentQuestion.answer) ? 800 : 1500;
            setTimeout(() => {
                if(gameConfig.mode === 'time' && timeLeft <= 0) endGame();
                else setNextQuestion();
            }, delay);
        }
    }

    nextQuestionBtn.addEventListener("click", () => {
        setNextQuestion();
    });

    // --- Events ---
    startBtn.addEventListener("click", () => {
        initAudio();
        gameConfig.mode = modeSelect.value;
        gameConfig.diff = diffSelect.value;
        gameConfig.cat = catSelect.value;
        
        score = 0; streak = 0;
        feedbackMsg.textContent = "";
        feedbackMsg.className = "";
        nextQuestionBtn.classList.add("hidden");
        lives = 3; timeLeft = 60;
        
        if (gameConfig.mode === 'time') {
            timerInterval = setInterval(() => {
                timeLeft--;
                updateStatsUI();
                if(timeLeft <= 0) endGame();
            }, 1000);
        }

        updateStatsUI();
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        setNextQuestion();
    });

    restartBtn.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");
        // Update visual mascot if modified
        if(mascot) changeMascot('idle');
    });

    statsBtn.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        statsScreen.classList.remove("hidden");
        document.getElementById("stat-total").textContent = stats.totalAnswered;
        document.getElementById("stat-correct").textContent = stats.totalCorrect;
        let acc = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;
        document.getElementById("stat-accuracy").textContent = `${acc}%`;
        document.getElementById("stat-streak").textContent = stats.highestStreak;
    });

    backToMenuBtn.addEventListener("click", () => {
        statsScreen.classList.add("hidden");
        startScreen.classList.remove("hidden");
    });

    numpadBtns.forEach(btn => {
        btn.addEventListener("click", () => numpadDisplay.textContent += btn.textContent);
    });
    numpadBackspace.addEventListener("click", () => {
        numpadDisplay.textContent = numpadDisplay.textContent.slice(0, -1);
    });
    numpadSubmit.addEventListener("click", () => {
        if (numpadDisplay.textContent.length > 0) handleAnswer(numpadDisplay.textContent);
    });

    document.addEventListener("keydown", (e) => {
        if (gameScreen.classList.contains("hidden") || currentMode !== 'numpad') return;
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','-','/'];
        if (validKeys.includes(e.key)) numpadDisplay.textContent += e.key;
        else if (e.key === "Backspace") numpadDisplay.textContent = numpadDisplay.textContent.slice(0, -1);
        else if (e.key === "Enter" && numpadDisplay.textContent.length > 0) handleAnswer(numpadDisplay.textContent);
    });
});
