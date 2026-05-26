import { AutoRouter, cors } from 'itty-router';

const { preflight, corsify } = cors({ origin: '*' });

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

router.get('/', () => new Response('Math Game API is running!'));

// --- Authentication ---
router.post('/auth', async (request, env) => {
    try {
        const { username, password } = await request.json();
        const lowerUsername = username.toLowerCase().trim();

        if (!lowerUsername || !password) {
            return new Response(JSON.stringify({ error: "Username and password required" }), { status: 400 });
        }

        // Check if user exists
        let user = await env.DB.prepare("SELECT * FROM users WHERE username = ?")
            .bind(lowerUsername)
            .first();

        if (!user) {
            // Create user if they don't exist
            const result = await env.DB.prepare("INSERT INTO users (username, password) VALUES (?, ?) RETURNING *")
                .bind(lowerUsername, password)
                .first();
            user = result;
        } else {
            // Check password if they do exist
            if (user.password !== password) {
                return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
            }
        }

        return new Response(JSON.stringify({ success: true, user: { id: user.id, username: user.username, role: user.role } }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});

// --- Sync Answers ---
router.post('/sync', async (request, env) => {
    try {
        const { userId, answers } = await request.json();

        if (!userId || !answers || !Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
        }

        if (answers.length === 0) {
             return new Response(JSON.stringify({ success: true, message: "Nothing to sync" }), { status: 200 });
        }

        const stmt = env.DB.prepare(`
            INSERT INTO answers_log (user_id, question_text, user_answer, correct_answer, is_correct, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const batch = answers.map(ans => 
            stmt.bind(userId, ans.question, ans.userAnswer, ans.correctAnswer, ans.isCorrect ? 1 : 0, ans.timestamp)
        );

        await env.DB.batch(batch);

        return new Response(JSON.stringify({ success: true, synced: answers.length }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});

// --- Student Stats ---
router.get('/stats/:userId', async (request, env) => {
    try {
        const userId = request.params.userId;
        const result = await env.DB.prepare(`
            SELECT 
                COUNT(*) as total_answered,
                SUM(is_correct) as total_correct
            FROM answers_log
            WHERE user_id = ?
        `).bind(userId).first();

        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0); // Need to adjust for IST logic in frontend or here if strictly needed

        const todayResult = await env.DB.prepare(`
            SELECT COUNT(*) as today_total
            FROM answers_log
            WHERE user_id = ? AND timestamp >= ?
        `).bind(userId, todayStart.toISOString()).first();

        return new Response(JSON.stringify({ 
            success: true, 
            totalAnswered: result.total_answered || 0,
            totalCorrect: result.total_correct || 0,
            todayAnswered: todayResult.today_total || 0
        }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});

// --- Admin Dashboard ---
router.get('/admin/stats', async (request, env) => {
    try {
        // Find IST boundaries for 'today' (up to 9 PM)
        const now = new Date();
        // Calculate current IST time
        const istOffset = 5.5 * 60 * 60 * 1000;
        const nowIst = new Date(now.getTime() + istOffset);
        
        // Start of today IST
        const startOfTodayIst = new Date(nowIst);
        startOfTodayIst.setUTCHours(0,0,0,0);
        
        const startOfTodayUtc = new Date(startOfTodayIst.getTime() - istOffset).toISOString();

        const usersQuery = `
            SELECT u.id, u.username, 
                COUNT(a.id) as total_answers,
                SUM(CASE WHEN a.timestamp >= ? THEN 1 ELSE 0 END) as today_answers
            FROM users u
            LEFT JOIN answers_log a ON u.id = a.user_id
            WHERE u.role = 'student'
            GROUP BY u.id
        `;

        const { results } = await env.DB.prepare(usersQuery).bind(startOfTodayUtc).all();

        return new Response(JSON.stringify({ success: true, students: results }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});


export default {
  fetch: (request, env, ctx) => router.fetch(request, env, ctx)
};
