import re

with open('public/game.js', 'r') as f:
    content = f.read()

keydown = r"""
    document.addEventListener("keydown", (e) => {
        if (gameScreen.classList.contains("hidden") || currentMode !== 'numpad') return;
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','-','/','.','*','^'];
"""
content = re.sub(r'    document\.addEventListener\("keydown", \(e\) => \{\n        if \(gameScreen\.classList\.contains\("hidden"\) \|\| currentMode !== \'numpad\'\) return;\n        const validKeys = \[\'0\',\'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\',\'9\',\'-\',\'/\',\'.\'\];', keydown, content)

with open('public/game.js', 'w') as f:
    f.write(content)

