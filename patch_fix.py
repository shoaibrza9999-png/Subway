import re

with open('public/game.js', 'r') as f:
    content = f.read()

# Since we removed high-score-display from HTML when we changed stats-bar, let's remove references to it or put it back.
content = re.sub(r'const highScoreDisplay = document\.getElementById\("high-score-display"\);\n', '', content)
content = re.sub(r'\s*highScoreDisplay\.textContent = `High Score: \$\{stats\.highScore\}`;', '', content)

with open('public/game.js', 'w') as f:
    f.write(content)

