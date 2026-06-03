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
let gradeLevel = 4.0;
let consecutiveCorrect = 0;
let consecutiveWrong = 0;


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

function generateGrade4() {
    const templates = [
        () => { // Multiplication
            const x = getRandomInt(10, 99);
            const y = getRandomInt(2, 9);
            return { question: `${x} × ${y}`, answer: `${x * y}` };
        },
        () => { // Long Division
            const y = getRandomInt(2, 9);
            const ans = getRandomInt(11, 111);
            const x = y * ans;
            return { question: `${x} ÷ ${y}`, answer: `${ans}` };
        },
        () => { // Equivalent Fractions
            let num = getRandomInt(1, 5);
            let den = getRandomInt(num + 1, 12);
            let multiplier = getRandomInt(2, 4);
            return { question: `${num}/${den} = ?/${den * multiplier}`, answer: `${num * multiplier}` };
        },
        () => { // Estimation
            const x = getRandomInt(100, 9999);
            const rounded = Math.round(x / 100) * 100;
            return { question: `Round ${x} to nearest 100`, answer: `${rounded}` };
            return { question: `${x.toFixed(1)} + ${y.toFixed(2)}`, answer: `${parseFloat(ans)}` }; 
        },
        () => { // Fraction Addition
            const dens = [2, 3, 4, 5, 6, 8];
            const den1 = dens[Math.floor(Math.random() * dens.length)];
            const den2 = dens[Math.floor(Math.random() * dens.length)];
            const num1 = getRandomInt(1, den1 - 1);
            const num2 = getRandomInt(1, den2 - 1);
            const aNum = num1 * den2 + num2 * den1;
            const aDen = den1 * den2;
            return { question: `${num1}/${den1} + ${num2}/${den2}`, answer: formatFraction(aNum, aDen) };
        },
        () => { // Volume
            const l = getRandomInt(2, 10);
            const w = getRandomInt(2, 10);
            const h = getRandomInt(2, 10);
            return { question: `Volume: ${l}×${w}×${h}`, answer: `${l * w * h}` };
        },
        () => { // Order of Operations
            const a = getRandomInt(2, 10);
            const b = getRandomInt(2, 10);
            const c = getRandomInt(2, 10);
            const d = getRandomInt(1, a * (b + c) - 1);
            return { question: `${a} × (${b} + ${c}) - ${d}`, answer: `${a * (b + c) - d}` };
        },
        () => { // Complementary Angles
            const a = getRandomInt(10, 80);
            return { question: `Complement of ${a}° angle`, answer: `${90 - a}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade7() {
    const templates = [
        () => { // Two-Step Equations
            const a = getRandomInt(2, 10);
            const ans = getRandomInt(1, 15);
            const b = getRandomInt(1, 20);
            const c = a * ans + b;
            return { question: `Solve for x: ${a}x + ${b} = ${c}`, answer: `${ans}` };
        },
        () => { // Percent Discount
            const price = getRandomInt(2, 20) * 10;
            const d = [10, 15, 20, 25, 50][Math.floor(Math.random() * 5)];
            return { question: `$${price} item is ${d}% off. New price?`, answer: `${price - (price * d / 100)}` };
        },
        () => { // Proportions
            const cost3 = getRandomInt(1, 10) * 3;
            const b = getRandomInt(2, 10);
            return { question: `3 cost $${cost3}. How much do ${b} cost?`, answer: `${(cost3 / 3) * b}` };
        },
        () => { // Circle Area
            const r = getRandomInt(1, 10);
            const ans = (3.14 * r * r).toFixed(2);
            return { question: `Area of circle radius ${r} (π=3.14)`, answer: `${parseFloat(ans)}` };
        },
        () => { // Cube Roots
            const cubes = {8:2, 27:3, 64:4, 125:5, 216:6};
            const keys = Object.keys(cubes);
            const val = keys[Math.floor(Math.random() * keys.length)];
            return { question: `Cube root of ${val}`, answer: `${cubes[val]}` };
        },
        () => { // Variables on both sides
            const ans = getRandomInt(1, 10);
            const a = getRandomInt(2, 5);
            const b = getRandomInt(1, 10);
            const c = getRandomInt(1, 3);
            // ax + b = cx + d => d = ax + b - cx
            const d = (a * ans) + b - (c * ans);
            return { question: `Solve for x: ${a}x + ${b} = ${c}x + ${d}`, answer: `${ans}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateQuestion() {
    const level = Math.floor(gradeLevel);
    if (level === 4) return generateGrade4();
    if (level === 5) return generateGrade5();
    if (level === 6) return generateGrade6();
    if (level === 7) return generateGrade7();
    if (level >= 8) return generateGrade8();
    return generateGrade4();
}


// --- Logic Helpers ---

function generateDistractors(correctAnswer) {
    const distractors = new Set();
    let isFraction = correctAnswer.includes('/');
    let isDecimal = correctAnswer.includes('.');
    
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
        } else if (isDecimal) {
            let ansFloat = parseFloat(correctAnswer);
            let offset = getRandomInt(-5, 5) / 10;
            if (offset === 0) offset = 0.5;
            let fakeAns = (ansFloat + offset).toFixed(2);
            fakeAns = parseFloat(fakeAns).toString(); // remove trailing zeros
            if (fakeAns !== correctAnswer) distractors.add(fakeAns);
        } else {
            let ansInt = parseInt(correctAnswer);
            let offset = getRandomInt(-5, 5);
            if (offset === 0) offset = 1;
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

    // --- Auth Logic ---
    const authScreen = document.getElementById("auth-screen");
    const menuScreen = document.getElementById("start-screen");
    const loginBtn = document.getElementById("login-btn");
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const authError = document.getElementById("auth-error");

    const authTitle = document.getElementById("auth-title");
    const authSubtitle = document.getElementById("auth-subtitle");
    const toggleAuthMode = document.getElementById("toggle-auth-mode");

let isLoginMode = true;

    if (toggleAuthMode) {
        toggleAuthMode.addEventListener("click", () => {
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                authTitle.textContent = "Login to Play";
                authSubtitle.textContent = "Welcome back! Enter your details.";
                loginBtn.textContent = "Login / Signup";
                toggleAuthMode.innerHTML = 'Don\'t have an account? <span style="text-decoration: underline;">Register</span>';
            } else {
                authTitle.textContent = "Create Account";
                authSubtitle.textContent = "Join the fun! Pick a name and password.";
                loginBtn.textContent = "Register";
                toggleAuthMode.innerHTML = 'Already have an account? <span style="text-decoration: underline;">Login</span>';
            }
            authError.textContent = "";
        });
    }

    async function handleAuth() {
        console.log("Handle auth clicked, mode:", isLoginMode);
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            authError.textContent = "Please enter name and password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Loading...";
        authError.textContent = "";
        
        let result;
        if (isLoginMode) {
            console.log("Attempting login...");
            result = await loginUser(username, password);
            console.log("Login result:", result);
            
            // If login fails because user not found, automatically register them as a fallback
            // since the user wants a seamless "Login / Signup" button experience where one button does both.
            if (!result.success && result.error && result.error.includes("User not found")) {
                console.log("User not found during login. Attempting registration fallback...");
                result = await registerUser(username, password);
                console.log("Fallback registration result:", result);
            }
        } else {
            console.log("Attempting explicit registration...");
            result = await registerUser(username, password);
        }
        
        if (result.success) {
            authScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");
            
            // Populate stats if fetched during login
            if (result.stats) {
                stats.totalAnswered = result.stats.totalAnswered || 0;
                stats.totalCorrect = result.stats.totalCorrect || 0;
                stats.highestStreak = 0; // Highest streak isn't saved in DB currently, reset it
                saveStats(); // Save to local storage for game usage
            }

            if (result.user.role === 'admin' && document.querySelector('#start-screen .button-group')) {
                const adminBtn = document.createElement('button');
                adminBtn.className = 'chalk-button';
                adminBtn.textContent = 'Admin Dashboard';
                adminBtn.onclick = () => window.location.href = 'admin.html';
                document.querySelector('#start-screen .button-group').appendChild(adminBtn);
            }
        } else {
            // Check if offline and matches previous
            const stored = localStorage.getItem('mathGameUser');
            if (isLoginMode && stored && !navigator.onLine) {
                 const prev = JSON.parse(stored);
                 if (prev.username === username.toLowerCase()) {
                     currentUser = prev;
                     authScreen.classList.add("hidden");
                     menuScreen.classList.remove("hidden");
                 } else {
                     authError.textContent = "Offline. Can only login as previous user.";
                 }
            } else {
                authError.textContent = result.error || "Authentication failed.";
            }
        }
        
        loginBtn.disabled = false;
        loginBtn.textContent = isLoginMode ? "Login / Signup" : "Register";
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", handleAuth);
    }

    // Auto-login
    const autoLogin = async () => {
        const user = checkStoredAuth();
        if (user) {
            if (authScreen) authScreen.classList.add("hidden");
            if (menuScreen) menuScreen.classList.remove("hidden");
        } else {
            if (authScreen) authScreen.classList.remove("hidden");
            if (menuScreen) menuScreen.classList.add("hidden");
        }
        if (user) {
            // Optionally fetch latest stats on auto-login if online
            if (navigator.onLine && user.role !== 'admin') {
               try {
                   const res = await fetch(`${API_URL}/stats/${user.id}`);
                   const data = await res.json();
                   if (data.success) {
                       stats.totalAnswered = data.totalAnswered || 0;
                       stats.totalCorrect = data.totalCorrect || 0;
                       saveStats();
                   }
               } catch(e) { console.log('Failed to fetch latest stats', e); }
            }

            if (user.role === 'admin' && document.querySelector('#start-screen .button-group')) {
                const adminBtn = document.createElement('button');
                adminBtn.className = 'chalk-button';
                adminBtn.textContent = 'Admin Dashboard';
                adminBtn.onclick = () => window.location.href = 'admin.html';
                document.querySelector('#start-screen .button-group').appendChild(adminBtn);
            }
            attemptSync();
        }
    };
    autoLogin();


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
        
    // Game UI
    const questionEl = document.getElementById("question");
    const scoreDisplay = document.getElementById("score-display");
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


    function updateStatsUI() {
        scoreDisplay.innerHTML = `Score: ${score} <span id="combo-display" class="${streak >= 3 ? '' : 'hidden'}">🔥 x${Math.floor(streak/3)+1}</span>`;
        document.getElementById('grade-display').textContent = `Grade: ${Math.floor(gradeLevel)}`;
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
            consecutiveCorrect++;
            consecutiveWrong = 0;
            
            if (consecutiveCorrect >= 5) {
                gradeLevel = Math.min(8.0, gradeLevel + 1.0);
                consecutiveCorrect = 0; // Reset after leveling up
            }

            if (streak > stats.highestStreak) stats.highestStreak = streak;
            
            let multiplier = Math.floor(streak / 3) + 1; // Combo multiplier
            score += 10 * multiplier;
            
            feedbackMsg.textContent = "Correct! 🎉";
            feedbackMsg.className = "correct";
            playSound('correct');
            changeMascot('correct');
        } else {
            streak = 0;
            consecutiveWrong++;
            consecutiveCorrect = 0;

            if (consecutiveWrong >= 2) {
                gradeLevel = Math.max(4.0, gradeLevel - 0.5);
                consecutiveWrong = 0; // Reset after leveling down
            }

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
        
        score = 0; streak = 0;
        gradeLevel = 4.0;
        consecutiveCorrect = 0;
        consecutiveWrong = 0;
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
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','-','/','.'];

        if (validKeys.includes(e.key)) numpadDisplay.textContent += e.key;
        else if (e.key === "Backspace") numpadDisplay.textContent = numpadDisplay.textContent.slice(0, -1);
        else if (e.key === "Enter" && numpadDisplay.textContent.length > 0) handleAnswer(numpadDisplay.textContent);
    });
});
