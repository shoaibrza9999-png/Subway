import re

with open("game.js", "r") as f:
    content = f.read()

auth_logic = """
    // --- Auth Logic ---
    const authScreen = document.getElementById("auth-screen");
    const menuScreen = document.getElementById("menu-screen");
    const loginBtn = document.getElementById("login-btn");
    const usernameInput = document.getElementById("username-input");
    const passwordInput = document.getElementById("password-input");
    const authError = document.getElementById("auth-error");

    async function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            authError.textContent = "Please enter name and password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Loading...";
        
        const result = await loginUser(username, password);
        
        if (result.success) {
            authScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");
            if (result.user.role === 'admin') {
                const adminBtn = document.createElement('button');
                adminBtn.className = 'chalk-button';
                adminBtn.textContent = 'Admin Dashboard';
                adminBtn.onclick = () => window.location.href = 'admin.html';
                document.querySelector('#menu-screen .button-group').appendChild(adminBtn);
            }
        } else {
            // Check if offline and matches previous
            const stored = localStorage.getItem('mathGameUser');
            if (stored && !navigator.onLine) {
                 const prev = JSON.parse(stored);
                 if (prev.username === username.toLowerCase()) {
                     currentUser = prev;
                     authScreen.classList.add("hidden");
                     menuScreen.classList.remove("hidden");
                 } else {
                     authError.textContent = "Offline. Can only login as previous user.";
                 }
            } else {
                authError.textContent = result.error || "Login failed.";
            }
        }
        
        loginBtn.disabled = false;
        loginBtn.textContent = "Login / Signup";
    }

    loginBtn.addEventListener("click", handleLogin);

    // Auto-login
    window.addEventListener('DOMContentLoaded', () => {
        const user = checkStoredAuth();
        if (user) {
            authScreen.classList.add("hidden");
            menuScreen.classList.remove("hidden");
            if (user.role === 'admin') {
                const adminBtn = document.createElement('button');
                adminBtn.className = 'chalk-button';
                adminBtn.textContent = 'Admin Dashboard';
                adminBtn.onclick = () => window.location.href = 'admin.html';
                document.querySelector('#menu-screen .button-group').appendChild(adminBtn);
            }
            attemptSync();
        }
    });

"""

content = content.replace('// --- Screen Management ---', auth_logic + '// --- Screen Management ---')

# Replace the saveStats tracking with queueAnswer
handle_answer_regex = re.compile(r'stats\.totalAnswered\+\+;\s*const cleanAns = userAnswer\.trim\(\)\.toLowerCase\(\)\.replace\(/\\s/g, \'\'\);')

replacement = """stats.totalAnswered++;
        const cleanAns = userAnswer.trim().toLowerCase().replace(/\\s/g, '');
        queueAnswer(currentQuestion.question, cleanAns, currentQuestion.answer, cleanAns === currentQuestion.answer);"""

content = handle_answer_regex.sub(replacement.replace('\\', '\\\\'), content)

with open("game.js", "w") as f:
    f.write(content)
