import re

with open('public/game.js', 'r') as f:
    content = f.read()

# Resolve all conflicts by keeping the code from b75e287
content = re.sub(r'<<<<<<< HEAD\n.*?\n=======\n(.*?)\n>>>>>>> b75e287 \(feat: add scientific notation numpad inputs and expand procedual questions\)', r'\1', content, flags=re.DOTALL)

with open('public/game.js', 'w') as f:
    f.write(content)

