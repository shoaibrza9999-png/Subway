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
"""

if 'id="auth-screen"' not in content:
    content = content.replace('<!-- Menu Screen -->', auth_ui + '\n        <!-- Menu Screen -->')
    content = content.replace('<div id="menu-screen" class="screen">', '<div id="menu-screen" class="screen hidden">')

if '<script src="auth.js"></script>' not in content:
    content = content.replace('<script src="game.js"></script>', '<script src="auth.js"></script>\n    <script src="game.js"></script>')

with open("index.html", "w") as f:
    f.write(content)
