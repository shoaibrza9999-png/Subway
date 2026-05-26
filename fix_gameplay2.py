with open("game.js", "r") as f:
    content = f.read()

start_idx = content.find("function handleAnswer(userAnswer) {")
end_idx = content.find("    // --- Events ---")

new_handle_answer = """function handleAnswer(userAnswer) {
        if(currentMode === 'mcq') mcqBtns.forEach(btn => btn.disabled = true);

        stats.totalAnswered++;
        const cleanAns = userAnswer.trim().toLowerCase().replace(/\\s/g, '');

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

"""

content = content[:start_idx] + new_handle_answer + content[end_idx:]

with open("game.js", "w") as f:
    f.write(content)
