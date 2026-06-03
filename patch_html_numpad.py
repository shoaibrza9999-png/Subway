import re

with open('public/index.html', 'r') as f:
    content = f.read()

# Add * and ^ to the numpad
numpad_row = """
                    <div class="numpad-row">
                        <button class="numpad-btn chalk-button">-</button>
                        <button class="numpad-btn chalk-button">0</button>
                        <button class="numpad-btn chalk-button">/</button>
                        <button class="numpad-btn chalk-button">.</button>
                    </div>
                    <div class="numpad-row" style="margin-top: 5px;">
                        <button class="numpad-btn chalk-button">*</button>
                        <button class="numpad-btn chalk-button">^</button>
                        <button class="numpad-btn chalk-button" style="visibility: hidden;">_</button>
                    </div>
"""
content = re.sub(r'<div class="numpad-row">\s*<button class="numpad-btn chalk-button">-</button>\s*<button class="numpad-btn chalk-button">0</button>\s*<button class="numpad-btn chalk-button">/</button>\s*<button class="numpad-btn chalk-button">.</button>\s*</div>', numpad_row, content, flags=re.DOTALL)

with open('public/index.html', 'w') as f:
    f.write(content)

