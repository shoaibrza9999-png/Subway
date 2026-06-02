import re

with open('patch_js.py', 'r') as p:
    p_content = p.read()

p_content = p_content.replace(r"const cleanAns = userAnswer.trim().toLowerCase().replace(/\\s/g, '');", r"const cleanAns = userAnswer.trim().toLowerCase().replace(/\\\\s/g, '');")

with open('patch_js.py', 'w') as p:
    p.write(p_content)

