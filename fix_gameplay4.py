with open("game.js", "r") as f:
    content = f.read()

content = content.replace(
    'function setNextQuestion() {',
    'function setNextQuestion() {\n        nextQuestionBtn.classList.add("hidden");\n        feedbackMsg.textContent = "";\n        feedbackMsg.className = "";'
)

with open("game.js", "w") as f:
    f.write(content)
