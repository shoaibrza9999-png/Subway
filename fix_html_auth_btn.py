with open("index.html", "r") as f:
    content = f.read()
if "auth-screen" not in content:
    print("Run auth fix")
