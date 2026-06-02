import re

with open('public/game.js', 'r') as f:
    content = f.read()

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

# Replace the specific line in patch_js.py
with open('patch_js.py', 'r') as p:
    p_content = p.read()

p_content = p_content.replace(r"const cleanAns = userAnswer.trim().toLowerCase().replace(/\s/g, '');", r"const cleanAns = userAnswer.trim().toLowerCase().replace(/\\s/g, '');")
p_content = p_content.replace('handle_ans = r"""', 'handle_ans = """')

with open('patch_js.py', 'w') as p:
    p.write(p_content)

