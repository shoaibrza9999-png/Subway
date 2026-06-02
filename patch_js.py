import re

with open('public/game.js', 'r') as f:
    content = f.read()

# 1. Update Distractors for Decimals
distractor_logic = """
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
"""
content = re.sub(r'function generateDistractors\(correctAnswer\) \{.*?\n\}', distractor_logic, content, flags=re.DOTALL)


# 2. Add New Generators
generators_code = """
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
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade5() {
    const templates = [
        () => { // Decimal Addition
            const x = getRandomInt(10, 99) / 10;
            const y = getRandomInt(100, 999) / 100;
            const ans = (x + y).toFixed(2);
            return { question: `${x.toFixed(1)} + ${y.toFixed(2)}`, answer: `${parseFloat(ans)}` }; // Avoid trailing zeros
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
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade6() {
    const templates = [
        () => { // Ratios
            const common = getRandomInt(2, 5);
            const a = getRandomInt(1, 6) * common;
            const b = getRandomInt(1, 6) * common;
            const factor = gcd(a, b);
            return { question: `Ratio ${a}:${b} in simplest form`, answer: `${a/factor}/${b/factor}` };
        },
        () => { // Percentages
            const p = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
            const x = getRandomInt(2, 15) * 10;
            return { question: `${p}% of ${x}`, answer: `${(p * x) / 100}` };
        },
        () => { // Negative Integers
            const x = getRandomInt(1, 20);
            const y = getRandomInt(1, 20);
            return { question: `-${x} - (-${y})`, answer: `${-x + y}` };
        },
        () => { // One-Step Equations
            const a = getRandomInt(1, 50);
            const ans = getRandomInt(1, 50);
            const b = ans + a;
            return { question: `Solve for x: x + ${a} = ${b}`, answer: `${ans}` };
        },
        () => { // Median
            let arr = [];
            for(let i=0; i<5; i++) arr.push(getRandomInt(1, 20));
            arr.sort((a,b) => a-b);
            return { question: `Median of ${arr.join(', ')}`, answer: `${arr[2]}` };
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
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade8() {
    const templates = [
        () => { // Roots
            const roots = [16, 25, 36, 49, 64, 81, 100, 121, 144];
            const x = roots[Math.floor(Math.random() * roots.length)];
            return { question: `√${x}`, answer: `${Math.sqrt(x)}` };
        },
        () => { // Exponents
            const y = getRandomInt(2, 6);
            return { question: `${y}³`, answer: `${y * y * y}` };
        },
        () => { // Scientific Notation
            const base = getRandomInt(1, 9);
            const zeros = getRandomInt(3, 6);
            const val = base * Math.pow(10, zeros);
            return { question: `${val} in scientific notation (e.g. 5*10^4)`, answer: `${base}*10^${zeros}` };
        },
        () => { // Slope
            const x1 = getRandomInt(1, 5);
            const y1 = getRandomInt(1, 10);
            const slope = getRandomInt(1, 5);
            const x2 = x1 + getRandomInt(1, 3);
            const y2 = y1 + slope * (x2 - x1);
            return { question: `Slope through (${x1},${y1}) and (${x2},${y2})`, answer: `${slope}` };
        },
        () => { // Pythagorean
            const triples = [[3,4,5], [5,12,13], [8,15,17]];
            const t = triples[Math.floor(Math.random() * triples.length)];
            const m = getRandomInt(1, 3);
            return { question: `Right triangle legs ${t[0]*m} and ${t[1]*m}. Hypotenuse?`, answer: `${t[2]*m}` };
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
"""
content = re.sub(r'// --- Generators ---.*?function generateQuestion\(\) \{.*?\n\}', generators_code, content, flags=re.DOTALL)


# 3. Add state vars
state_vars = """
// Game Session
let score = 0;
let lives = 3;
let timeLeft = 60;
let timerInterval = null;
let streak = 0;
let gradeLevel = 4.0;
let consecutiveCorrect = 0;
let consecutiveWrong = 0;
"""
content = re.sub(r'// Game Session\nlet score = 0;\nlet lives = 3;\nlet timeLeft = 60;\nlet timerInterval = null;\nlet streak = 0;', state_vars, content)


# 4. Update UI logic
update_ui = r"""
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
"""
content = re.sub(r'    function updateStatsUI\(\) \{.*?\n    \}', update_ui, content, flags=re.DOTALL)


# 5. Update handleAnswer logic
handle_ans = """
    function handleAnswer(userAnswer) {
        if(currentMode === 'mcq') mcqBtns.forEach(btn => btn.disabled = true);
        
        stats.totalAnswered++;
        const cleanAns = userAnswer.trim().toLowerCase().replace(/\\\\s/g, '');
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
"""
content = re.sub(r'    function handleAnswer\(userAnswer\) \{.*?\n    \}', handle_ans, content, flags=re.DOTALL)


# 6. Update Start Event Listener
start_btn = r"""
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
"""
content = re.sub(r'    startBtn\.addEventListener\("click", \(\) => \{.*?lives = 3; timeLeft = 60;', start_btn, content, flags=re.DOTALL)


# 7. Update Numpad Event Listener
keydown = r"""
    document.addEventListener("keydown", (e) => {
        if (gameScreen.classList.contains("hidden") || currentMode !== 'numpad') return;
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','-','/','.'];
"""
content = re.sub(r'    document\.addEventListener\("keydown", \(e\) => \{\n        if \(gameScreen\.classList\.contains\("hidden"\) \|\| currentMode !== \'numpad\'\) return;\n        const validKeys = \[\'0\',\'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\',\'9\',\'-\',\'/\'\];', keydown, content)


# 8. Clean up unused selectors
content = re.sub(r'const diffSelect = document\.getElementById\("diff-select"\);\n', '', content)
content = re.sub(r'const catSelect = document\.getElementById\("cat-select"\);\n', '', content)
content = re.sub(r'const comboDisplay = document\.getElementById\("combo-display"\);\n', '', content)


with open('public/game.js', 'w') as f:
    f.write(content)

