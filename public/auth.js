const API_URL = "https://math-game-api.shoaibrza9999.workers.dev"; 

let currentUser = null;

async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            localStorage.setItem('mathGameUser', JSON.stringify(currentUser));
            return { success: true, user: currentUser, stats: data.stats };
        } else {
            return { success: false, error: data.error };
        }
    } catch (err) {
        console.error("Login failed:", err);
        return { success: false, error: "Network error. Will try offline login if previously logged in." };
    }
}

async function registerUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = data.user;
            localStorage.setItem('mathGameUser', JSON.stringify(currentUser));
            return { success: true, user: currentUser };
        } else {
            return { success: false, error: data.error };
        }
    } catch (err) {
        console.error("Registration failed:", err);
        return { success: false, error: "Network error during registration." };
    }
}

function checkStoredAuth() {
    const stored = localStorage.getItem('mathGameUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
    }
    return null;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('mathGameUser');
    window.location.reload();
}

// --- Sync Logic ---
let offlineQueue = JSON.parse(localStorage.getItem('mathGameOfflineQueue') || '[]');

function saveSyncQueue() {
    localStorage.setItem('mathGameOfflineQueue', JSON.stringify(offlineQueue));
}

function queueAnswer(question, userAnswer, correctAnswer, isCorrect) {
    if (!currentUser) return;
    
    offlineQueue.push({
        question,
        userAnswer,
        correctAnswer,
        isCorrect,
        timestamp: new Date().toISOString()
    });
    saveSyncQueue();
    attemptSync();
}

async function attemptSync() {
    if (!currentUser || offlineQueue.length === 0) return;
    if (!navigator.onLine) return; // Wait until online

    try {
        const response = await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                answers: offlineQueue
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            console.log(`Successfully synced ${data.synced} answers.`);
            offlineQueue = [];
            saveSyncQueue();
        }
    } catch (err) {
        console.error("Sync failed, will retry later.", err);
    }
}

// Try syncing when coming back online
window.addEventListener('online', attemptSync);
