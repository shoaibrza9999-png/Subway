with open("index.html", "r") as f:
    content = f.read()

auth_ui = """
        <!-- Login/Auth Screen -->
        <div id="auth-screen" class="screen">
            <h1>Login to Play</h1>
            <p style="margin-bottom:20px; font-size:1.2rem;">Create an account or login below.</p>
            <div class="settings-group">
                <input type="text" id="username-input" class="chalk-input" placeholder="Your Name" />
            </div>
            <div class="settings-group">
                <input type="password" id="password-input" class="chalk-input" placeholder="Password" />
            </div>
            <p id="auth-error" style="color:#ff6b6b; min-height: 24px; margin-bottom: 15px;"></p>
            <button id="login-btn" class="chalk-button">Login / Signup</button>
        </div>

        <!-- Menu Screen (Add 'hidden' initially) -->
"""

content = content.replace('<!-- Menu Screen -->', auth_ui + '<!-- Menu Screen -->\n        ')
content = content.replace('<div id="menu-screen" class="screen">', '<div id="menu-screen" class="screen hidden">')

# Add script tag
content = content.replace('<script src="game.js"></script>', '<script src="auth.js"></script>\n    <script src="game.js"></script>')

with open("index.html", "w") as f:
    f.write(content)

with open("styles.css", "a") as f:
    f.write("""
/* Auth Input Styles */
.chalk-input {
    width: 80%;
    max-width: 300px;
    padding: 10px;
    margin-bottom: 10px;
    background: transparent;
    border: 2px solid #fff;
    border-radius: 8px;
    color: #fff;
    font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
    font-size: 1.2rem;
    outline: none;
}
.chalk-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}
.chalk-input:focus {
    border-color: #ffd700;
}
""")
