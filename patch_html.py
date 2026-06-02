import re

with open('public/index.html', 'r') as f:
    content = f.read()

# 1. Update Start Screen Options
new_options = """
            <div class="options-container">
                <div class="option-group">
                    <label>Mode:</label>
                    <select id="mode-select" class="chalk-select">
                        <option value="survival">Survival (3 Lives)</option>
                    </select>
                </div>
            </div>
"""

content = re.sub(r'<div class="options-container">.*?</div>\s*</div>\s*<div class="start-actions">', new_options + '            <div class="start-actions">', content, flags=re.DOTALL)

# 2. Add Grade Display to Stats Bar
stats_bar = """
            <div id="stats-bar">
                <span id="score-display">Score: 0 <span id="combo-display" class="hidden"></span></span>
                <span id="grade-display">Grade: 4</span>
                <span id="lives-display">Lives: ❤️❤️❤️</span>
            </div>
"""
content = re.sub(r'<div id="stats-bar">.*?</div>', stats_bar, content, flags=re.DOTALL)


# 3. Add decimal point to Numpad
numpad_row = """
                    <div class="numpad-row">
                        <button class="numpad-btn chalk-button">-</button>
                        <button class="numpad-btn chalk-button">0</button>
                        <button class="numpad-btn chalk-button">/</button>
                        <button class="numpad-btn chalk-button">.</button>
                    </div>
"""
content = re.sub(r'<div class="numpad-row">\s*<button class="numpad-btn chalk-button">-</button>\s*<button class="numpad-btn chalk-button">0</button>\s*<button class="numpad-btn chalk-button">/</button>\s*</div>', numpad_row, content, flags=re.DOTALL)

# Update Title
content = content.replace("<title>Math Game for 5th Grade</title>", "<title>Endless Math Game</title>")
content = content.replace("<p>Welcome, 5th Grader!</p>", "<p>Welcome!</p>")


with open('public/index.html', 'w') as f:
    f.write(content)
