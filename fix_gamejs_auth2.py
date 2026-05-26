import re

with open("game.js", "r") as f:
    content = f.read()

content = content.replace('const menuScreen = document.getElementById("menu-screen");', 'const menuScreen = document.getElementById("start-screen");')

with open("game.js", "w") as f:
    f.write(content)
