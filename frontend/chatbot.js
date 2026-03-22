// ============================================================
// AI Tutor Chatbot — Context-Aware Engine
// ============================================================
(function () {

  /* ── STYLES ── */
  const styles = `
    .ai-chatbot-btn {
      position: fixed; bottom: 30px; right: 30px;
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #38bdf8);
      color: white; font-size: 28px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 28px rgba(108,99,255,0.5);
      cursor: pointer; z-index: 9999;
      transition: transform 0.25s, box-shadow 0.25s;
      border: none; animation: pulse-ring 2.5s ease-in-out infinite;
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(108,99,255,0.45); }
      70%  { box-shadow: 0 0 0 12px rgba(108,99,255,0); }
      100% { box-shadow: 0 0 0 0  rgba(108,99,255,0); }
    }
    .ai-chatbot-btn:hover { transform: scale(1.1) translateY(-3px); }

    .ai-chatbot-window {
      position: fixed; bottom: 108px; right: 30px;
      width: 370px; height: 520px;
      background: rgba(14,14,28,0.97);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(108,99,255,0.28);
      border-radius: 22px;
      display: none; flex-direction: column;
      z-index: 9999; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      overflow: hidden; font-family: 'Inter', sans-serif;
      transform-origin: bottom right;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    .ai-chatbot-window.open { display: flex; }

    .ai-chatbot-header {
      padding: 16px 18px;
      background: linear-gradient(90deg, rgba(108,99,255,0.22), rgba(56,189,248,0.12));
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .chat-header-left { display: flex; align-items: center; gap: 10px; }
    .chat-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #38bdf8);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .chat-info h4 { color: #fff; font-size: 0.9rem; font-weight: 700; margin: 0; }
    .chat-info span { color: #4ade80; font-size: 0.72rem; }
    .ai-chatbot-close {
      background: rgba(255,255,255,0.08); border: none; color: white;
      cursor: pointer; font-size: 16px; width: 30px; height: 30px;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .ai-chatbot-close:hover { background: rgba(255,255,255,0.16); }

    .chat-topics {
      display: flex; gap: 6px; padding: 10px 14px;
      overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,0.06);
      scrollbar-width: none;
    }
    .chat-topics::-webkit-scrollbar { display: none; }
    .topic-chip {
      padding: 4px 10px; background: rgba(108,99,255,0.15);
      border: 1px solid rgba(108,99,255,0.25); border-radius: 100px;
      font-size: 0.72rem; color: #a5b4fc; white-space: nowrap;
      cursor: pointer; transition: background 0.2s;
    }
    .topic-chip:hover { background: rgba(108,99,255,0.3); color: #fff; }

    .ai-chatbot-messages {
      flex: 1; padding: 14px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: rgba(108,99,255,0.3) transparent;
    }
    .ai-chatbot-messages::-webkit-scrollbar { width: 4px; }
    .ai-chatbot-messages::-webkit-scrollbar-thumb {
      background: rgba(108,99,255,0.4); border-radius: 4px;
    }

    .ai-msg {
      max-width: 85%; padding: 10px 14px;
      border-radius: 16px; font-size: 0.875rem; line-height: 1.5;
      animation: msgIn 0.2s ease-out;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ai-msg.bot {
      background: rgba(108,99,255,0.18); color: #e0e0ff;
      align-self: flex-start; border-bottom-left-radius: 4px;
    }
    .ai-msg.bot code {
      display: block; background: rgba(0,0,0,0.4);
      padding: 8px 10px; border-radius: 8px;
      font-family: 'Courier New', monospace; margin-top: 6px;
      color: #7dd3fc; font-size: 0.82rem; overflow-x: auto;
    }
    .ai-msg.user {
      background: linear-gradient(135deg, #6c63ff, #5a52e0);
      color: #fff; align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .ai-msg.typing { background: rgba(108,99,255,0.12); color: var(--text-muted); }

    .ai-chatbot-input-area {
      padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.07);
      display: flex; gap: 8px; align-items: center;
    }
    .ai-chatbot-input {
      flex: 1; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      padding: 10px 16px; color: white; outline: none; font-size: 0.875rem;
      transition: border-color 0.2s;
    }
    .ai-chatbot-input::placeholder { color: rgba(255,255,255,0.35); }
    .ai-chatbot-input:focus { border-color: rgba(108,99,255,0.6); }
    .ai-chatbot-send {
      background: linear-gradient(135deg, #6c63ff, #5a52e0);
      border: none; border-radius: 50%;
      width: 38px; height: 38px; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; transition: transform 0.2s;
    }
    .ai-chatbot-send:hover { transform: scale(1.1); }
  `;

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  /* ── TEMPLATE ── */
  const tpl = `
    <button class="ai-chatbot-btn" id="aiChatBtn" aria-label="Open Tutor Chat">💬</button>
    <div class="ai-chatbot-window" id="aiChatWin" role="dialog" aria-label="AI Tutor Chatbot">
      <div class="ai-chatbot-header">
        <div class="chat-header-left">
          <div class="chat-avatar">🤖</div>
          <div class="chat-info">
            <h4>AI Tutor</h4>
            <span>● Online — Always ready</span>
          </div>
        </div>
        <button class="ai-chatbot-close" id="aiChatClose" aria-label="Close chat">✕</button>
      </div>
      <div class="chat-topics" id="chatTopics">
        <span class="topic-chip" data-q="what is for loop">For Loop</span>
        <span class="topic-chip" data-q="what is factorial">Factorial</span>
        <span class="topic-chip" data-q="what is array">Arrays</span>
        <span class="topic-chip" data-q="what is oop">OOP</span>
        <span class="topic-chip" data-q="python basics">Python Basics</span>
        <span class="topic-chip" data-q="fibonacci series">Fibonacci</span>
        <span class="topic-chip" data-q="what is recursion">Recursion</span>
        <span class="topic-chip" data-q="palindrome check">Palindrome</span>
      </div>
      <div class="ai-chatbot-messages" id="aiChatMsgs">
        <div class="ai-msg bot">👋 Hi! I'm your AI Tutor. Ask me anything about <strong>Java</strong>, <strong>Python</strong>, or <strong>English</strong>. You can also click a topic chip above to get started!</div>
      </div>
      <div class="ai-chatbot-input-area">
        <input type="text" class="ai-chatbot-input" id="aiChatInput" placeholder="Ask a question…" autocomplete="off">
        <button class="ai-chatbot-send" id="aiChatSend" aria-label="Send">➤</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', tpl);

  /* ── KNOWLEDGE BASE ── */
  const KB = [
    // ── JAVA ──
    { keys: ['for loop','for loop java','java for loop'], topic: 'java',
      reply: `A <strong>for loop</strong> repeats a block a fixed number of times.<code>for(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}
// Output: 0 1 2 3 4</code>` },

    { keys: ['while loop','while loop java'], topic: 'java',
      reply: `A <strong>while loop</strong> runs as long as the condition is true.<code>int i = 0;\nwhile(i < 3) {\n    System.out.println(i);\n    i++;\n}
// Output: 0 1 2</code>` },

    { keys: ['do while','do-while'], topic: 'java',
      reply: `<strong>do-while</strong> executes the body at least once, then checks the condition.<code>int i = 0;\ndo {\n    System.out.println(i);\n    i++;\n} while(i < 3);
// Output: 0 1 2</code>` },

    { keys: ['factorial','factorial program'], topic: 'java',
      reply: `<strong>Factorial</strong> of n = n × (n-1) × … × 1
Example: 5! = 120<code>int n = 5, fact = 1;\nfor(int i = 1; i <= n; i++) {\n    fact *= i;\n}\nSystem.out.println(fact); // 120</code>` },

    { keys: ['fibonacci','fibonacci series'], topic: 'java',
      reply: `<strong>Fibonacci</strong>: each number = sum of previous two.<code>int a = 0, b = 1;\nfor(int i = 0; i < 8; i++) {\n    System.out.print(a + " ");\n    int t = a + b; a = b; b = t;\n}
// Output: 0 1 1 2 3 5 8 13</code>` },

    { keys: ['palindrome','palindrome check','is palindrome'], topic: 'java',
      reply: `A <strong>palindrome</strong> reads the same forwards and backwards.<code>String s = "madam";\nString r = new StringBuilder(s).reverse().toString();\nSystem.out.println(s.equals(r)); // true</code>` },

    { keys: ['prime','prime number','is prime','check prime'], topic: 'java',
      reply: `Check if a number is <strong>prime</strong>:<code>int n = 17;\nboolean prime = n > 1;\nfor(int i = 2; i * i <= n; i++) {\n    if(n % i == 0) { prime = false; break; }\n}\nSystem.out.println(prime); // true</code>` },

    { keys: ['reverse number','reverse digits'], topic: 'java',
      reply: `<strong>Reverse</strong> digits of a number:<code>int n = 1234, rev = 0;\nwhile(n != 0) {\n    rev = rev * 10 + n % 10;\n    n /= 10;\n}\nSystem.out.println(rev); // 4321</code>` },

    { keys: ['array','arrays','java array'], topic: 'java',
      reply: `An <strong>array</strong> stores multiple values of the same type.<code>int[] nums = {10, 20, 30, 40};\nfor(int x : nums) {\n    System.out.println(x);\n}
// Sum: use a running total variable</code>` },

    { keys: ['string','java string','string methods'], topic: 'java',
      reply: `Common <strong>String</strong> methods in Java:<code>String s = "Hello World";\nSystem.out.println(s.length());    // 11\nSystem.out.println(s.toUpperCase());\nSystem.out.println(s.contains("World")); // true\nSystem.out.println(s.substring(0,5)); // Hello</code>` },

    { keys: ['oop','oops','object oriented','class object','java class'], topic: 'java',
      reply: `<strong>OOP</strong> pillars: Encapsulation, Inheritance, Polymorphism, Abstraction.<code>class Animal {\n    String name;\n    Animal(String n) { this.name = n; }\n    void speak() { System.out.println(name + " speaks"); }\n}\nAnimal a = new Animal("Dog");\na.speak(); // Dog speaks</code>` },

    { keys: ['inheritance','extends java'], topic: 'java',
      reply: `<strong>Inheritance</strong> allows a child class to use parent class methods.<code>class Vehicle {\n    void move() { System.out.println("Moving"); }\n}\nclass Car extends Vehicle {\n    void horn() { System.out.println("Beep!"); }\n}\nCar c = new Car();\nc.move(); // Moving</code>` },

    { keys: ['exception','try catch','try catch java','error handling'], topic: 'java',
      reply: `<strong>Exception Handling</strong> with try-catch-finally:<code>try {\n    int x = 10 / 0;\n} catch(ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n} finally {\n    System.out.println("Always runs");\n}</code>` },

    { keys: ['recursion','recursive'], topic: 'java',
      reply: `<strong>Recursion</strong>: a method calls itself with a smaller problem.<code>static int factorial(int n) {\n    if(n == 0) return 1;       // base case\n    return n * factorial(n-1); // recursive call\n}\nSystem.out.println(factorial(5)); // 120</code>` },

    { keys: ['pattern printing','star pattern'], topic: 'java',
      reply: `<strong>Pattern Printing</strong> with nested loops:<code>// Right triangle:\nfor(int i = 1; i <= 5; i++) {\n    for(int j = 1; j <= i; j++) {\n        System.out.print("* ");\n    }\n    System.out.println();\n}
/*\n*\n* *\n* * *\n...
*/</code>` },

    // ── PYTHON ──
    { keys: ['python basics','python intro','print python'], topic: 'python',
      reply: `<strong>Python Basics</strong> — simple and readable:<code>print("Hello, World!")
name = "Alice"
age  = 20
print(f"Name: {name}, Age: {age}")</code>` },

    { keys: ['python for loop','for loop python'], topic: 'python',
      reply: `Python <strong>for loop</strong> iterates over sequences:<code>for i in range(5):\n    print(i)
# Output: 0 1 2 3 4

fruits = ["apple", "mango", "banana"]\nfor fruit in fruits:\n    print(fruit)</code>` },

    { keys: ['python while loop','while python'], topic: 'python',
      reply: `Python <strong>while loop</strong>:<code>i = 0\nwhile i < 5:\n    print(i)\n    i += 1
# Output: 0 1 2 3 4</code>` },

    { keys: ['python factorial','factorial python'], topic: 'python',
      reply: `Factorial in <strong>Python</strong>:<code>n = int(input("Enter n: "))\nresult = 1\nfor i in range(1, n+1):\n    result *= i\nprint(f"{n}! = {result}")
# or using math:\nimport math\nprint(math.factorial(5)) # 120</code>` },

    { keys: ['python list','list python','lists python'], topic: 'python',
      reply: `Python <strong>List</strong> — ordered, mutable:<code>nums = [3, 1, 4, 1, 5, 9]\nnums.append(2)\nnums.sort()\nprint(nums)         # sorted list\nprint(max(nums))    # largest element\nprint(sum(nums))    # sum of all</code>` },

    { keys: ['python function','def python','python def'], topic: 'python',
      reply: `<strong>Functions</strong> in Python:<code>def greet(name):\n    return f"Hello, {name}!"

def add(a, b=10):  # default argument\n    return a + b

print(greet("Rohan"))  # Hello, Rohan!
print(add(5))          # 15</code>` },

    { keys: ['python oop','python class','class python'], topic: 'python',
      reply: `<strong>OOP in Python</strong>:<code>class Student:\n    def __init__(self, name, grade):\n        self.name  = name\n        self.grade = grade\n\n    def info(self):\n        print(f"{self.name} – Grade: {self.grade}")

s = Student("Riya", "A")\ns.info()  # Riya – Grade: A</code>` },

    { keys: ['python fibonacci','fibonacci python'], topic: 'python',
      reply: `<strong>Fibonacci</strong> in Python:<code>a, b = 0, 1\nfor _ in range(8):\n    print(a, end=" ")\n    a, b = b, a + b
# Output: 0 1 1 2 3 5 8 13</code>` },

    { keys: ['python palindrome','palindrome python'], topic: 'python',
      reply: `<strong>Palindrome check</strong> in Python:<code>s = input("Enter word: ")\nif s == s[::-1]:\n    print("Palindrome ✅")\nelse:\n    print("Not a palindrome ❌")</code>` },

    { keys: ['python prime','prime python'], topic: 'python',
      reply: `<strong>Prime Check</strong> in Python:<code>def is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0:\n            return False\n    return True

print(is_prime(17)) # True
print(is_prime(10)) # False</code>` },

    // ── ENGLISH / COMMUNICATION ──
    { keys: ['grammar','tense','tenses'], topic: 'english',
      reply: `<strong>English Tenses</strong> (core three):<br><br>
• <em>Present</em>: "I <strong>eat</strong> breakfast."<br>
• <em>Past</em>: "I <strong>ate</strong> breakfast."<br>
• <em>Future</em>: "I <strong>will eat</strong> breakfast."<br><br>
Simple present = habits/facts. Simple past = completed actions. Future = plans.` },

    { keys: ['pronunciation','pronounce','speaking tips'], topic: 'english',
      reply: `💡 <strong>Tips to improve pronunciation</strong>:<br><br>
1. Listen carefully to native speakers (podcasts/videos)<br>
2. Record yourself and compare<br>
3. Practice <em>shadowing</em> — repeat after hearing<br>
4. Focus on stress patterns: <em>PHO-to-graph</em><br>
5. Read aloud 10 minutes daily` },

    { keys: ['vocabulary','word','build vocabulary'], topic: 'english',
      reply: `📖 <strong>Build vocabulary fast</strong>:<br><br>
• Learn 5 new words daily with sentences<br>
• Use flashcards (e.g., Anki)<br>
• Read news articles and novels<br>
• Context matters more than definitions!` },

    { keys: ['fill blank','fill in the blank'], topic: 'english',
      reply: `🔤 <strong>Fill-in-the-blank strategy</strong>:<br><br>
1. Read the full sentence first.<br>
2. Identify the <em>part of speech</em> needed.<br>
3. Use context clues.<br><br>
Example: "Tiger is the _____ animal of India."<br>Answer: <strong>National</strong>` },

    { keys: ['reading practice','read aloud'], topic: 'english',
      reply: `📢 <strong>Reading practice tips</strong>:<br><br>
• Read at a natural, steady pace<br>
• Pause at commas, drop tone at periods<br>
• Stress important words<br><br>
Practice sentence: <em>"The sun rises in the east. It gives us light and energy."</em>` },

    // ── GENERAL ──
    { keys: ['what is oop','what is object oriented'], topic: 'general',
      reply: `<strong>OOP (Object-Oriented Programming)</strong> has 4 pillars:<br><br>
1. <strong>Encapsulation</strong> — hiding data with access modifiers<br>
2. <strong>Inheritance</strong> — child class reuses parent class<br>
3. <strong>Polymorphism</strong> — same name, different behaviour<br>
4. <strong>Abstraction</strong> — hide implementation, show interface` },

    { keys: ['hello','hi','hey'], topic: 'general',
      reply: `👋 Hello! Great to see you here. What topic do you want to master today? Java, Python, or English communication?` },

    { keys: ['progress','score','rank','level'], topic: 'general',
      reply: `📊 Visit your <strong>Profile Dashboard</strong> (top-right corner) to check your score, streak, and completed topics across all courses.` },

    { keys: ['course','courses'], topic: 'general',
      reply: `🎓 We offer three complete learning paths:<br>
• ☕ <strong>Java Programming</strong> — 7 levels with teach, practice & coding<br>
• 🐍 <strong>Python Programming</strong> — 6 levels, Python syntax only<br>
• 🗣️ <strong>Spoken English</strong> — voice-based reading & speaking exercises` },

    { keys: ['even odd','even or odd'], topic: 'general',
      reply: `<strong>Even/Odd check</strong>:<code>// Java\nint n = 7;\nSystem.out.println(n % 2 == 0 ? "Even" : "Odd");

// Python\nn = int(input())\nprint("Even" if n % 2 == 0 else "Odd")</code>` },

    { keys: ['sum of numbers','sum numbers','sum array'], topic: 'general',
      reply: `<strong>Sum of N numbers</strong>:<code>// Java\nint n = 5, sum = 0;\nfor(int i = 1; i <= n; i++) sum += i;\nSystem.out.println(sum); // 15

// Python\nn = 5\nprint(sum(range(1, n+1))) # 15</code>` },

    { keys: ['max element','maximum array','largest number'], topic: 'general',
      reply: `<strong>Find Maximum Element</strong>:<code>// Java\nint[] arr = {3, 7, 1, 9, 4};\nint max = arr[0];\nfor(int x : arr) if(x > max) max = x;\nSystem.out.println(max); // 9

// Python\narr = [3, 7, 1, 9, 4]\nprint(max(arr)) # 9</code>` },
  ];

  /* ── SMART RESPONSE ENGINE ── */
  function getBotResponse(q) {
    const lq = q.toLowerCase().trim();

    // Exact keyword scan
    for (const entry of KB) {
      for (const key of entry.keys) {
        if (lq.includes(key)) return { html: true, text: entry.reply };
      }
    }

    // Partial word scan (broad fallback)
    const tokens = lq.split(/\s+/);
    for (const entry of KB) {
      for (const key of entry.keys) {
        const keyTokens = key.split(/\s+/);
        if (keyTokens.some(kt => tokens.some(t => t === kt && kt.length > 3))) {
          return { html: true, text: entry.reply };
        }
      }
    }

    // Contextual fallback
    if (lq.includes('java'))   return { html: false, text: "For Java questions, try asking about: loops, arrays, OOP, recursion, factorial, fibonacci, exceptions." };
    if (lq.includes('python')) return { html: false, text: "For Python questions, try: for loop, list, function, class, factorial, fibonacci, palindrome." };
    if (lq.includes('english') || lq.includes('speak')) return { html: false, text: "For English help, ask about: grammar, pronunciation tips, reading practice, fill in the blanks." };

    return { html: false, text: "I'm not sure about that yet! Try rephrasing or pick a topic chip above. I cover Java, Python, and English communication concepts. 🎓" };
  }

  /* ── DOM REFERENCES ── */
  const btn      = document.getElementById('aiChatBtn');
  const win      = document.getElementById('aiChatWin');
  const closeBtn = document.getElementById('aiChatClose');
  const msgs     = document.getElementById('aiChatMsgs');
  const input    = document.getElementById('aiChatInput');
  const sendBtn  = document.getElementById('aiChatSend');
  const chips    = document.querySelectorAll('.topic-chip');

  /* ── TOGGLE ── */
  btn.addEventListener('click', () => win.classList.toggle('open'));
  closeBtn.addEventListener('click', () => win.classList.remove('open'));

  /* ── MESSAGES ── */
  function addMsg(text, type, isHtml = false) {
    const d = document.createElement('div');
    d.className = 'ai-msg ' + type;
    if (isHtml) d.innerHTML = text;
    else        d.innerText = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function showTyping() {
    return addMsg('● ● ●', 'bot typing');
  }

  function handleSend() {
    const txt = input.value.trim();
    if (!txt) return;
    addMsg(txt, 'user');
    input.value = '';

    const typingEl = showTyping();
    const delay = 500 + Math.random() * 400;

    setTimeout(() => {
      typingEl.remove();
      const resp = getBotResponse(txt);
      addMsg(resp.text, 'bot', resp.html);
    }, delay);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

  /* ── TOPIC CHIP QUICK QUERIES ── */
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.q;
      win.classList.add('open');
      handleSend();
    });
  });

})();
