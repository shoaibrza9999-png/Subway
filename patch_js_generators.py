import re

with open('public/game.js', 'r') as f:
    content = f.read()

generators_code = """
// --- Generators ---

function generateGrade4() {
    const templates = [
        () => { // Multiplication
            const x = getRandomInt(10, 99);
            const y = getRandomInt(2, 9);
            return { question: `${x} × ${y}`, answer: `${x * y}` };
        },
        () => { // Long Division
            const y = getRandomInt(2, 9);
            const ans = getRandomInt(11, 111);
            const x = y * ans;
            return { question: `${x} ÷ ${y}`, answer: `${ans}` };
        },
        () => { // Equivalent Fractions
            let num = getRandomInt(1, 5);
            let den = getRandomInt(num + 1, 12);
            let multiplier = getRandomInt(2, 4);
            return { question: `${num}/${den} = ?/${den * multiplier}`, answer: `${num * multiplier}` };
        },
        () => { // Estimation
            const x = getRandomInt(100, 9999);
            const rounded = Math.round(x / 100) * 100;
            return { question: `Round ${x} to nearest 100`, answer: `${rounded}` };
        },
        () => { // Perimeter
            const l = getRandomInt(5, 20);
            const w = getRandomInt(5, 20);
            return { question: `Perimeter of ${l}x${w} rectangle`, answer: `${2 * (l + w)}` };
        },
        () => { // Money/Cost
            const cost = getRandomInt(10, 50);
            const qty = getRandomInt(2, 8);
            return { question: `Cost of ${qty} items at $${cost} each`, answer: `${cost * qty}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade5() {
    const templates = [
        () => { // Decimal Addition
            const x = getRandomInt(10, 99) / 10;
            const y = getRandomInt(100, 999) / 100;
            const ans = (x + y).toFixed(2);
            return { question: `${x.toFixed(1)} + ${y.toFixed(2)}`, answer: `${parseFloat(ans)}` }; 
        },
        () => { // Fraction Addition
            const dens = [2, 3, 4, 5, 6, 8];
            const den1 = dens[Math.floor(Math.random() * dens.length)];
            const den2 = dens[Math.floor(Math.random() * dens.length)];
            const num1 = getRandomInt(1, den1 - 1);
            const num2 = getRandomInt(1, den2 - 1);
            const aNum = num1 * den2 + num2 * den1;
            const aDen = den1 * den2;
            return { question: `${num1}/${den1} + ${num2}/${den2}`, answer: formatFraction(aNum, aDen) };
        },
        () => { // Volume
            const l = getRandomInt(2, 10);
            const w = getRandomInt(2, 10);
            const h = getRandomInt(2, 10);
            return { question: `Volume: ${l}×${w}×${h}`, answer: `${l * w * h}` };
        },
        () => { // Order of Operations
            const a = getRandomInt(2, 10);
            const b = getRandomInt(2, 10);
            const c = getRandomInt(2, 10);
            const d = getRandomInt(1, a * (b + c) - 1);
            return { question: `${a} × (${b} + ${c}) - ${d}`, answer: `${a * (b + c) - d}` };
        },
        () => { // LCM
            const a = getRandomInt(2, 6);
            const b = getRandomInt(3, 8);
            const l = Math.abs(a * b) / gcd(a, b);
            return { question: `LCM of ${a} and ${b}`, answer: `${l}` };
        },
        () => { // HCF
            const common = getRandomInt(2, 10);
            const a = getRandomInt(1, 5) * common;
            const b = getRandomInt(1, 5) * common;
            return { question: `HCF of ${a} and ${b}`, answer: `${gcd(a,b)}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade6() {
    const templates = [
        () => { // Ratios
            const common = getRandomInt(2, 5);
            const a = getRandomInt(1, 6) * common;
            const b = getRandomInt(1, 6) * common;
            const factor = gcd(a, b);
            return { question: `Ratio ${a}:${b} in simplest form`, answer: `${a/factor}/${b/factor}` };
        },
        () => { // Percentages
            const p = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
            const x = getRandomInt(2, 15) * 10;
            return { question: `${p}% of ${x}`, answer: `${(p * x) / 100}` };
        },
        () => { // Negative Integers
            const x = getRandomInt(1, 20);
            const y = getRandomInt(1, 20);
            return { question: `-${x} - (-${y})`, answer: `${-x + y}` };
        },
        () => { // One-Step Equations
            const a = getRandomInt(1, 50);
            const ans = getRandomInt(1, 50);
            const b = ans + a;
            return { question: `Solve for x: x + ${a} = ${b}`, answer: `${ans}` };
        },
        () => { // Median
            let arr = [];
            for(let i=0; i<5; i++) arr.push(getRandomInt(1, 20));
            arr.sort((a,b) => a-b);
            return { question: `Median of ${arr.join(', ')}`, answer: `${arr[2]}` };
        },
        () => { // Complementary Angles
            const a = getRandomInt(10, 80);
            return { question: `Complement of ${a}° angle`, answer: `${90 - a}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade7() {
    const templates = [
        () => { // Two-Step Equations
            const a = getRandomInt(2, 10);
            const ans = getRandomInt(1, 15);
            const b = getRandomInt(1, 20);
            const c = a * ans + b;
            return { question: `Solve for x: ${a}x + ${b} = ${c}`, answer: `${ans}` };
        },
        () => { // Percent Discount
            const price = getRandomInt(2, 20) * 10;
            const d = [10, 15, 20, 25, 50][Math.floor(Math.random() * 5)];
            return { question: `$${price} item is ${d}% off. New price?`, answer: `${price - (price * d / 100)}` };
        },
        () => { // Proportions
            const cost3 = getRandomInt(1, 10) * 3;
            const b = getRandomInt(2, 10);
            return { question: `3 cost $${cost3}. How much do ${b} cost?`, answer: `${(cost3 / 3) * b}` };
        },
        () => { // Circle Area
            const r = getRandomInt(1, 10);
            const ans = (3.14 * r * r).toFixed(2);
            return { question: `Area of circle radius ${r} (π=3.14)`, answer: `${parseFloat(ans)}` };
        },
        () => { // Simple Interest
            const p = getRandomInt(1, 10) * 1000;
            const r = getRandomInt(2, 10);
            const t = getRandomInt(1, 5);
            return { question: `SI on $${p} at ${r}% for ${t} years`, answer: `${(p * r * t) / 100}` };
        },
        () => { // Triangle Area
            const b = getRandomInt(2, 20);
            const h = getRandomInt(2, 20);
            const ans = (0.5 * b * h).toFixed(1);
            return { question: `Area of triangle base ${b}, height ${h}`, answer: `${parseFloat(ans)}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

function generateGrade8() {
    const templates = [
        () => { // Roots
            const roots = [16, 25, 36, 49, 64, 81, 100, 121, 144];
            const x = roots[Math.floor(Math.random() * roots.length)];
            return { question: `√${x}`, answer: `${Math.sqrt(x)}` };
        },
        () => { // Exponents
            const y = getRandomInt(2, 6);
            return { question: `${y}³`, answer: `${y * y * y}` };
        },
        () => { // Scientific Notation
            const base = getRandomInt(1, 9);
            const zeros = getRandomInt(3, 6);
            const val = base * Math.pow(10, zeros);
            return { question: `${val} in scientific notation (e.g. 5*10^4)`, answer: `${base}*10^${zeros}` };
        },
        () => { // Slope
            const x1 = getRandomInt(1, 5);
            const y1 = getRandomInt(1, 10);
            const slope = getRandomInt(1, 5);
            const x2 = x1 + getRandomInt(1, 3);
            const y2 = y1 + slope * (x2 - x1);
            return { question: `Slope through (${x1},${y1}) and (${x2},${y2})`, answer: `${slope}` };
        },
        () => { // Pythagorean
            const triples = [[3,4,5], [5,12,13], [8,15,17]];
            const t = triples[Math.floor(Math.random() * triples.length)];
            const m = getRandomInt(1, 3);
            return { question: `Right triangle legs ${t[0]*m} and ${t[1]*m}. Hypotenuse?`, answer: `${t[2]*m}` };
        },
        () => { // Cube Roots
            const cubes = {8:2, 27:3, 64:4, 125:5, 216:6};
            const keys = Object.keys(cubes);
            const val = keys[Math.floor(Math.random() * keys.length)];
            return { question: `Cube root of ${val}`, answer: `${cubes[val]}` };
        },
        () => { // Variables on both sides
            const ans = getRandomInt(1, 10);
            const a = getRandomInt(2, 5);
            const b = getRandomInt(1, 10);
            const c = getRandomInt(1, 3);
            // ax + b = cx + d => d = ax + b - cx
            const d = (a * ans) + b - (c * ans);
            return { question: `Solve for x: ${a}x + ${b} = ${c}x + ${d}`, answer: `${ans}` };
        }
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}
"""
content = re.sub(r'// --- Generators ---.*?function generateQuestion\(\)', generators_code + '\nfunction generateQuestion()', content, flags=re.DOTALL)

# Add handling for * and ^ in generateDistractors
distractor_patch = r"""
        } else if (isDecimal) {
            let ansFloat = parseFloat(correctAnswer);
            let offset = getRandomInt(-5, 5) / 10;
            if (offset === 0) offset = 0.5;
            let fakeAns = (ansFloat + offset).toFixed(2);
            fakeAns = parseFloat(fakeAns).toString(); // remove trailing zeros
            if (fakeAns !== correctAnswer) distractors.add(fakeAns);
        } else if (correctAnswer.includes('*')) {
            // e.g. 5*10^4
            let parts = correctAnswer.split('*');
            if(parts.length === 2 && parts[1].includes('^')) {
                let base = parseInt(parts[0]);
                let expParts = parts[1].split('^');
                let exp = parseInt(expParts[1]);
                let r = Math.random();
                let fakeBase = base;
                let fakeExp = exp;
                if(r < 0.5) fakeBase += getRandomInt(1, 3);
                else fakeExp += getRandomInt(-1, 2);
                if (fakeExp === exp && fakeBase === base) fakeBase += 1;
                let fakeAns = `${fakeBase}*10^${fakeExp}`;
                if (fakeAns !== correctAnswer) distractors.add(fakeAns);
            } else {
                 distractors.add(correctAnswer + "1");
                 distractors.add("1" + correctAnswer);
                 distractors.add(correctAnswer + "0");
            }
        } else {
"""
content = re.sub(r'        \} else if \(isDecimal\) \{.*?        \} else \{', distractor_patch, content, flags=re.DOTALL)

with open('public/game.js', 'w') as f:
    f.write(content)
