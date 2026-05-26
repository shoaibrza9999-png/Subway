with open("auth.js", "r") as f:
    content = f.read()

content = content.replace('const API_URL = "https://math-game-api.jules-sandbox.workers.dev"; // This will need to be updated after deploy', 'const API_URL = "https://math-game-api.shoaibrza9999.workers.dev";')

with open("auth.js", "w") as f:
    f.write(content)
