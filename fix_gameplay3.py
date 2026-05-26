with open("game.js", "r") as f:
    content = f.read()

# Add nextQuestionBtn element if not already added
if "const nextQuestionBtn" not in content:
    content = content.replace(
        'const feedbackMsg = document.getElementById("feedback-message");',
        'const feedbackMsg = document.getElementById("feedback-message");\n    const nextQuestionBtn = document.getElementById("next-question-btn");'
    )

# Reset feedback on game start if not already done
if "nextQuestionBtn.classList.add(\"hidden\");" not in content.split('startBtn.addEventListener("click"')[1]:
    content = content.replace(
        'score = 0; streak = 0;',
        'score = 0; streak = 0;\n        feedbackMsg.textContent = "";\n        feedbackMsg.className = "";\n        nextQuestionBtn.classList.add("hidden");'
    )

# Hide next button on setNextQuestion if not already done
if "nextQuestionBtn.classList.add(\"hidden\");" not in content.split('function setNextQuestion() {')[1]:
    content = content.replace(
        'function setNextQuestion() {',
        'function setNextQuestion() {\n        nextQuestionBtn.classList.add("hidden");\n        feedbackMsg.textContent = "";\n        feedbackMsg.className = "";'
    )

with open("game.js", "w") as f:
    f.write(content)
