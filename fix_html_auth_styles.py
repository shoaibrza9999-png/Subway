with open("public/styles.css", "r") as f:
    content = f.read()

# Make input boxes more visible
content = content.replace(
"""/* Auth Input Styles */
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
}""",
"""/* Auth Input Styles */
.chalk-input {
    width: 80%;
    max-width: 300px;
    padding: 10px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #fff;
    border-radius: 8px;
    color: #fff;
    font-family: 'Patrick Hand', cursive;
    font-size: 1.2rem;
    outline: none;
}
.chalk-input::placeholder {
    color: rgba(255, 255, 255, 0.9);
}"""
)

with open("public/styles.css", "w") as f:
    f.write(content)
