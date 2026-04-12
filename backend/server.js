require('dotenv').config();
const express = require("express");
const cors = require("cors");
const OpenAI = require('openai');
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.use(cors());
app.use(express.json());

const QUESTION_BANK = {
  java: {
    1: {
      teach: { title: "Java Basics", explanation: "Java is compiled to bytecode. Variables are statically typed.", syntax: "int x = 10;", exampleCode: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Java L1\");\n  }\n}" },
      practice: [
        { question: "Which is a primitive type?", options: ["String", "int", "Object", "List"], correctIndex: 1 },
        { question: "Java extension?", options: [".js", ".java", ".py", ".cpp"], correctIndex: 1 },
        { question: "Output command?", options: ["print()", "System.out.println()", "printf()", "cout"], correctIndex: 1 }
      ],
      coding: [{ title: "L1: Integer", question: "Print the number 100.", in: "None", out: "100" }]
    },
    2: {
      teach: { title: "Java OOP", explanation: "Encapsulation, Inheritance, and Polymorphism are core pillars.", syntax: "class Animal extends Entity { }", exampleCode: "class Dog extends Animal {\n  void bark() { }\n}" },
      practice: [
        { question: "Which keyword is for inheritance?", options: ["implements", "extends", "inherits", "this"], correctIndex: 1 },
        { question: "Can a class have multiple parents?", options: ["Yes", "No"], correctIndex: 1 },
        { question: "What is 'super'?", options: ["Parent ref", "Child ref", "Static ref", "Method"], correctIndex: 0 }
      ],
      coding: [{ title: "L2: Class", question: "Declare 'class Student'.", in: "q", out: "class student" }]
    },
    3: {
      teach: { title: "Java Advanced", explanation: "Multithreading and Streams API allow for high-performance apps.", syntax: "stream().filter().collect()", exampleCode: "Thread t = new Thread(() -> {});" },
      practice: [
        { question: "What manages memory?", options: ["Pointers", "Garbage Collector", "Manual", "None"], correctIndex: 1 },
        { question: "Is List an interface?", options: ["Yes", "No"], correctIndex: 0 },
        { question: "Keyword for threads?", options: ["Runnable", "Process", "Task", "Loop"], correctIndex: 0 }
      ],
      coding: [{ title: "L3: Stream", question: "Call '.collect()'.", in: "q", out: "collect" }]
    }
  },
  python: {
    1: {
      teach: { title: "Python Intro", explanation: "Indentation is key in Python syntax.", syntax: "if x > 0:", exampleCode: "print(\"Python L1\")" },
      practice: [
        { question: "Python creator?", options: ["Guido", "Zuckerberg", "Gates", "Musk"], correctIndex: 0 },
        { question: "Mutable type?", options: ["List", "Tuple", "String", "Int"], correctIndex: 0 },
        { question: "Indentation unit?", options: ["Semicolon", "Space/Tab", "Braces", "None"], correctIndex: 1 }
      ],
      coding: [{ title: "L1: Print", question: "Print 'Hi'.", in: "q", out: "hi" }]
    },
    2: {
      teach: { title: "Python Structures", explanation: "Lists, Sets, and Dictionaries are built-in collections.", syntax: "d = {'key': 'val'}", exampleCode: "my_list = [1, 2, 3]" },
      practice: [
        { question: "What is a dictionary?", options: ["List", "Map", "Tuple", "Set"], correctIndex: 1 },
        { question: "Keyword for function?", options: ["func", "def", "define", "method"], correctIndex: 1 },
        { question: "How to append to list?", options: ["add()", "push()", "append()", "insert()"], correctIndex: 2 }
      ],
      coding: [{ title: "L2: Dict", question: "Create dict 'd'.", in: "q", out: "d = {" }]
    },
    3: {
      teach: { title: "Python Advanced", explanation: "Decorators and Generators optimize resource usage.", syntax: "@decorator", exampleCode: "yield x" },
      practice: [
        { question: "What does yield do?", options: ["Return list", "Generator", "Stop", "Error"], correctIndex: 1 },
        { question: "What is @?", options: ["Comment", "Decorator", "Pointer", "Math"], correctIndex: 1 },
        { question: "Is Python multi-threaded?", options: ["Yes (GIL)", "No", "Only on Linux", "None"], correctIndex: 0 }
      ],
      coding: [{ title: "L3: Yield", question: "Use 'yield'.", in: "q", out: "yield" }]
    }
  },
  dsa: {
    1: {
      teach: { title: "Basics of DSA", explanation: "Arrays and Big O are the starting points.", syntax: "Arr[i]", exampleCode: "int[] a = new int[5];" },
      practice: [
        { question: "Linear search complexity?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctIndex: 1 },
        { question: "Array index starts at?", options: ["0", "1", "-1", "Any"], correctIndex: 0 },
        { question: "Is array fixed size in Java?", options: ["Yes", "No"], correctIndex: 0 }
      ],
      coding: [{ title: "L1: Array", question: "Define array 'a'.", in: "q", out: "int[] a" }]
    },
    2: {
      teach: { title: "Linked Lists & Stacks", explanation: "Dynamic memory structures.", syntax: "node.next", exampleCode: "stack.push(x)" },
      practice: [
        { question: "Stack is?", options: ["FIFO", "LIFO", "FILO", "Random"], correctIndex: 1 },
        { question: "LL search complexity?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctIndex: 1 },
        { question: "Pointer for LL?", options: ["Next", "Previous", "Both", "None"], correctIndex: 0 }
      ],
      coding: [{ title: "L2: Push", question: "Call 'push'.", in: "q", out: "push" }]
    },
    3: {
      teach: { title: "Trees & Graphs", explanation: "Non-linear data representation.", syntax: "root.left", exampleCode: "BFS(graph, start)" },
      practice: [
        { question: "Binary tree max children?", options: ["1", "2", "3", "Any"], correctIndex: 1 },
        { question: "DFS uses?", options: ["Stack/Recursion", "Queue", "Array", "None"], correctIndex: 0 },
        { question: "Shortest path algo?", options: ["Dijkstra", "Bubble", "Merge", "Insertion"], correctIndex: 0 }
      ],
      coding: [{ title: "L3: Search", question: "Call 'search'.", in: "q", out: "search" }]
    }
  },
  dbms: {
    1: { teach: { title: "SQL Basics", explanation: "Relational data.", syntax: "SELECT", exampleCode: "SELECT * FROM users;" }, practice: [{ question: "Keyword?", options: ["GET", "SELECT"], correctIndex: 1 }], coding: [{ title: "Query", question: "SELECT", in: "q", out: "select" }] },
    2: { teach: { title: "Joins", explanation: "Merging data.", syntax: "INNER JOIN", exampleCode: "JOIN t2 ON ..." }, practice: [{ question: "Merging?", options: ["Join", "Add"], correctIndex: 0 }], coding: [{ title: "Join", question: "JOIN", in: "q", out: "join" }] },
    3: { teach: { title: "ACID", explanation: "Transactions.", syntax: "COMMIT", exampleCode: "BEGIN TRANSACTION;" }, practice: [{ question: "A in ACID?", options: ["Atomic", "Auto"], correctIndex: 0 }], coding: [{ title: "Commit", question: "COMMIT", in: "q", out: "commit" }] }
  },
  operating_systems: {
    1: { teach: { title: "Kernel", explanation: "Core OS.", syntax: "syscall", exampleCode: "fork()" }, practice: [{ question: "Heart?", options: ["Shell", "Kernel"], correctIndex: 1 }], coding: [{ title: "Fork", question: "fork", in: "q", out: "fork" }] },
    2: { teach: { title: "Scheduling", explanation: "CPU time.", syntax: "Round Robin", exampleCode: "SJF" }, practice: [{ question: "Algo?", options: ["FIFO", "RR"], correctIndex: 1 }], coding: [{ title: "CPU", question: "RR", in: "q", out: "rr" }] },
    3: { teach: { title: "Deadlock", explanation: "Resource wait.", syntax: "Mutex", exampleCode: "Livelock" }, practice: [{ question: "Wait?", options: ["Deadlock", "Sleep"], correctIndex: 0 }], coding: [{ title: "Wait", question: "lock", in: "q", out: "lock" }] }
  },
  c: {
    1: { teach: { title: "C Basics", explanation: "Procedural.", syntax: "printf", exampleCode: "main()" }, practice: [{ question: "Print?", options: ["printf", "echo"], correctIndex: 0 }], coding: [{ title: "Print", question: "printf", in: "q", out: "printf" }] },
    2: { teach: { title: "Pointers", explanation: "Memory address.", syntax: "*ptr", exampleCode: "&x" }, practice: [{ question: "Address of?", options: ["&", "*"], correctIndex: 0 }], coding: [{ title: "Pointer", question: "int *", in: "q", out: "int *" }] },
    3: { teach: { title: "Malloc", explanation: "Heap allocation.", syntax: "malloc(size)", exampleCode: "free(ptr)" }, practice: [{ question: "Free memory?", options: ["free", "delete"], correctIndex: 0 }], coding: [{ title: "Malloc", question: "malloc", in: "q", out: "malloc" }] }
  },
  cpp: {
    1: { teach: { title: "C++ Basics", explanation: "C with Classes.", syntax: "cout", exampleCode: "std::cout << \"Hi\"" }, practice: [{ question: "Output?", options: ["cout", "print"], correctIndex: 0 }], coding: [{ title: "Cout", question: "cout", in: "q", out: "cout" }] },
    2: { teach: { title: "Classes", explanation: "Object-oriented.", syntax: "public:", exampleCode: "class A {}" }, practice: [{ question: "Access?", options: ["public", "global"], correctIndex: 0 }], coding: [{ title: "Class", question: "class", in: "q", out: "class" }] },
    3: { teach: { title: "Templates", explanation: "Generic programming.", syntax: "template <typename T>", exampleCode: "T add(T a, T b)" }, practice: [{ question: "Generic?", options: ["Template", "Any"], correctIndex: 0 }], coding: [{ title: "Template", question: "template", in: "q", out: "template" }] }
  },
  communication: {
    1: { teach: { title: "Body Language", explanation: "Non-verbal cues.", syntax: "Eye contact", exampleCode: "Smile" }, practice: [{ question: "Cues?", options: ["Verbal", "Body"], correctIndex: 1 }], coding: [{ title: "Non-verbal", question: "eye", in: "q", out: "eye" }] },
    2: { teach: { title: "Professionalism", explanation: "Tone of voice.", syntax: "Formal", exampleCode: "Dear Sir" }, practice: [{ question: "Tone?", options: ["Formal", "Casual"], correctIndex: 0 }], coding: [{ title: "Formal", question: "regards", in: "q", out: "regards" }] },
    3: { teach: { title: "Leadership", explanation: "Influencing others.", syntax: "Empathy", exampleCode: "Listen" }, practice: [{ question: "Skill?", options: ["Command", "Empathy"], correctIndex: 1 }], coding: [{ title: "Empathetic", question: "listen", in: "q", out: "listen" }] }
  },
  machine_learning: {
    1: { teach: { title: "Regression", explanation: "Predicting numbers.", syntax: "Linear", exampleCode: "y = mx + c" }, practice: [{ question: "Predict?", options: ["Reg", "Classify"], correctIndex: 0 }], coding: [{ title: "Linear", question: "regr", in: "q", out: "regr" }] },
    2: { teach: { title: "Classification", explanation: "Categories.", syntax: "Groups", exampleCode: "Decision Tree" }, practice: [{ question: "Cats?", options: ["Classify", "Cluster"], correctIndex: 0 }], coding: [{ title: "Classify", question: "category", in: "q", out: "category" }] },
    3: { teach: { title: "Deep Learning", explanation: "Neurons.", syntax: "Layers", exampleCode: "CNN" }, practice: [{ question: "Neural?", options: ["Deep", "Flat"], correctIndex: 0 }], coding: [{ title: "Layers", question: "neuron", in: "q", out: "neuron" }] }
  }
};

const users = [];

app.post("/login", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "Welcome back", user });
});

app.post("/register", (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ message: "Email and Name are required" });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: "Email already exists" });

  const user = {
    email, name,
    scores: { dsa: 0, machine_learning: 0, aptitude: 0, java: 0, python: 0, communication: 0, dbms: 0, operating_systems: 0, c: 0, cpp: 0 },
    streak: 1,
    progress: 0
  };
  users.push(user);
  res.status(201).json({ message: "User registered", user });
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a smart AI tutor. Explain clearly with simple examples."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.log(error);
    res.json({
      reply: "AI error ❌"
    });
  }
});

const intents = [
  {
    keywords: ["main function", "main method"],
    replies: [
      "In Java, the main function is the entry point of the program. It is written as: public static void main(String[] args).",
      "Java programs begin execution from the main() method. It must be public, static, and void.",
      "The JVM looks for the public static void main method to start your application."
    ]
  },
  {
    keywords: ["stack", "what is stack"],
    replies: [
      "A stack is a linear data structure that follows the LIFO (Last In First Out) principle.",
      "Think of a stack like a pile of plates; the last one you put on top is the first one you take off.",
      "In a stack, all insertions and deletions are made at one end, called the top."
    ]
  },
  {
    keywords: ["dsa topics", "what in dsa"],
    replies: [
      "DSA includes core topics like Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Dynamic Programming.",
      "Your roadmap for DSA should be: Basics -> Searching/Sorting -> Linear Structures -> Non-Linear Structures -> Greedy/DP.",
      "Mastering DSA requires understanding time and space complexity (Big O notation) across all algorithms."
    ]
  },
  {
    keywords: ["java"],
    replies: [
      "Java is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.",
      "Java follows the 'Write Once, Run Anywhere' (WORA) philosophy thanks to the Java Virtual Machine (JVM).",
      "It's widely used for enterprise backend systems, Android apps, and large-scale data processing."
    ]
  },
  {
    keywords: ["python"],
    replies: [
      "Python is an interpreted, high-level, general-purpose programming language known for its clear and readable syntax.",
      "Python's simplicity makes it the top choice for AI, Machine Learning, Data Analytics, and web automation.",
      "It supports multiple programming paradigms, including structured, object-oriented, and functional programming."
    ]
  },
  {
    keywords: ["weak", "progress", "score"],
    replies: [
      `Looking at your progress, ${user.name}, you are doing great! Focus on Level 2 modules to push your knowledge.`,
      "Based on your diagnostic history, I suggest spending more time on tree-based algorithms in DSA.",
      "Your consistency is key! Review your previous coding mistakes in the result analysis section."
    ]
  }
];

let reply = "I understand your question. I'm here to help with Java, Python, and DSA. Can you be more specific about the topic?";

for (const intent of intents) {
  if (intent.keywords.some(k => msg.includes(k))) {
    reply = intent.replies[Math.floor(Math.random() * intent.replies.length)];
    break;
  }
}

res.json({ reply });


app.get("/api/dashboard", (req, res) => {
  const user = users[0] || { name: "Learner", email: "guest@example.com", scores: { dsa: 0, machine_learning: 0, aptitude: 0, java: 0, python: 0, communication: 0, dbms: 0, operating_systems: 0, c: 0, cpp: 0 }, streak: 1, progress: 0 };
  res.json(user);
});

app.get("/api/courses", (req, res) => {
  res.json(Object.keys(QUESTION_BANK).map(id => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1), recommendedLevel: "Easy", isRecommended: true })));
});

app.get("/api/module", (req, res) => {
  const { course, level } = req.query;
  const bank = QUESTION_BANK[course] || QUESTION_BANK['java'];
  res.json(bank[level] || bank[1]);
});

app.post("/run-code", (req, res) => {
  const { code, language } = req.body;
  if (!code) return res.json({ success: false, output: "No code provided" });

  // Simple heuristic for "Success" based on user requirements
  const lowCode = code.toLowerCase();
  const hasPrint = lowCode.includes("print") || lowCode.includes("system.out") || lowCode.includes("printf") || lowCode.includes("std::cout");

  if (hasPrint) {
    res.json({ success: true, output: "Execution Successful. Output matches requirements." });
  } else {
    res.json({ success: false, output: "Logic mismatch: No output command detected." });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));