const express = require("express");
const cors = require("cors");

const app = express();

// Robust CORS for local file:// access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

const QUESTION_BANK = {
  java: {
    1: {
      teach: { title: "Java OOP Basics", explanation: "Java is an object-oriented language. Classes and Objects are the foundation.", syntax: "class MyClass { ... }", exampleCode: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Java\");\n  }\n}" },
      practice: [
        { question: "Which keyword defines a class?", options: ["class", "struc", "def", "new"], correctIndex: 0 },
        { question: "Java is a ___ language?", options: ["Compiled", "Interpreted", "Both", "None"], correctIndex: 2 },
        { question: "Default integer value?", options: ["0", "null", "undefined", "garbage"], correctIndex: 0 }
      ],
      coding: [
        { title: "Sum of Two", question: "Print the sum of 10 and 20.", in: "None", out: "30", template: "public class Main {\n  public static void main(String[] args) {\n    // Write code here\n  }\n}" },
        { title: "Palindrome", question: "Check if 'racecar' is a palindrome. Output 'yes' or 'no'.", in: "racecar", out: "yes", template: "// Complete the logic\n" }
      ]
    }
  },
  python: {
    1: {
      teach: { title: "Python Dynamics", explanation: "Python is an interpreted, high-level language with easy readability.", syntax: "def my_func():", exampleCode: "print(\"Hello Python\")" },
      practice: [
        { question: "How to start a comment?", options: ["//", "#", "/*", "--"], correctIndex: 1 },
        { question: "Which is a list?", options: ["()", "{}", "[]", "<>"], correctIndex: 2 },
        { question: "Python used for?", options: ["Web", "ML", "Data", "All"], correctIndex: 3 }
      ],
      coding: [
        { title: "Array Sum", question: "Sum elements of [1,2,3,4].", in: "[1,2,3,4]", out: "10", template: "def solution(arr):\n    # Return sum\n    pass" },
        { title: "Reverse String", question: "Reverse the string 'hello'.", in: "hello", out: "olleh", template: "s = 'hello'\n# Write logic" }
      ]
    }
  },
  dsa: {
    1: {
      teach: { title: "Array Structures", explanation: "Contiguous memory storage for same-type elements.", syntax: "int a[5];", exampleCode: "a[0] = 1;" },
      practice: [
        { question: "Complexity of array access by index?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)" ], correctIndex: 1 },
        { question: "Linear search complexity?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)" ], correctIndex: 1 },
        { question: "Array index starts from?", options: ["0", "1", "-1", "any"], correctIndex: 0 }
      ],
      coding: [
        { title: "Max in Array", question: "Find max in [1, 5, 2].", in: "[1,5,2]", out: "5", template: "int[] arr = {1, 5, 2};\n// Find max\n" },
        { title: "Linear Search", question: "Is 3 in [1,2,3]? (yes/no)", in: "3", out: "yes", template: "" }
      ]
    }
  },
  communication: {
    1: {
      teach: { title: "Professionalism", explanation: "Effective body language and tone.", syntax: "7Cs of Communication", exampleCode: "Be Clear and Concise." },
      practice: [
        { question: "Important for active listening?", options: ["Nodding", "Checking phone", "Speaking", "Walking"], correctIndex: 0 },
        { question: "Email greeting?", options: ["Hi", "Dear sir", "Best regards", "Ok"], correctIndex: 1 },
        { question: "Non-verbal includes?", options: ["Body lang", "Speech", "Writing", "Text"], correctIndex: 0 }
      ],
      coding: [
        { title: "Email Logic", question: "Correct closing for an email? (best/bye)", in: "q", out: "best", template: "" },
        { title: "Greeting", question: "Type 'Hello' professionally.", in: "q", out: "hello", template: "" }
      ]
    }
  },
  dbms: {
    1: {
      teach: { title: "SQL Basics", explanation: "Relational database management systems use SQL.", syntax: "SELECT * FROM d;", exampleCode: "INSERT INTO users ..." },
      practice: [
        { question: "Retrieving data keyword?", options: ["GET", "SELECT", "SHOW", "LIST"], correctIndex: 1 },
        { question: "Primary Key must be?", options: ["Unique", "Null", "Duplicate", "Random"], correctIndex: 0 },
        { question: "SQL stands for?", options: ["Sequential", "Structured", "Simple", "Standard"], correctIndex: 1 }
      ],
      coding: [
        { title: "Query", question: "Keyword to delete all rows?", in: "q", out: "truncate", template: "" },
        { title: "ID", question: "The 'P' in PK stands for?", in: "q", out: "primary", template: "" }
      ]
    }
  },
  operating_systems: {
    1: {
      teach: { title: "Processes", explanation: "Program in execution.", syntax: "PCB", exampleCode: "fork()" },
      practice: [
        { question: "Kernel is?", options: ["Core", "UI", "Driver", "File"], correctIndex: 0 },
        { question: "Deadlock is?", options: ["Resource wait", "Process end", "Restart", "Normal"], correctIndex: 0 },
        { question: "Virtual memory uses?", options: ["Disk", "RAM", "CPU", "Bus"], correctIndex: 0 }
      ],
      coding: [
        { title: "PID", question: "What does PID stand for? (Process ID)", in: "q", out: "process id", template: "" },
        { title: "RAM", question: "A in RAM?", in: "q", out: "access", template: "" }
      ]
    }
  },
  c: {
    1: {
      teach: { title: "C Basics", explanation: "Procedural language.", syntax: "printf();", exampleCode: "int main() {}" },
      practice: [
        { question: "C is?", options: ["Procedural", "OOP", "Functional", "Logic"], correctIndex: 0 },
        { question: "Header file?", options: ["#include", "import", "using", "require"], correctIndex: 0 },
        { question: "Memory management?", options: ["Manual", "Auto", "None", "GC"], correctIndex: 0 }
      ],
      coding: [
        { title: "Print", question: "Print 'Hi'.", in: "q", out: "Hi", template: "" },
        { title: "Var", question: "Declare int x.", in: "q", out: "int x", template: "" }
      ]
    }
  },
  cpp: {
    1: {
      teach: { title: "C++ OOP", explanation: "C with Classes.", syntax: "class A {};", exampleCode: "std::cout << 'Hi';" },
      practice: [
        { question: "C++ is?", options: ["OOP", "Procedural", "Scripting", "None"], correctIndex: 0 },
        { question: "Namespace?", options: ["std", "base", "root", "main"], correctIndex: 0 },
        { question: "Pointer?", options: ["*", "&", "->", "all"], correctIndex: 3 }
      ],
      coding: [
        { title: "Print", question: "Print 'Hi'.", in: "q", out: "Hi", template: "" },
        { title: "Class", question: "Define class A.", in: "q", out: "class A", template: "" }
      ]
    }
  },
  machine_learning: {
    1: {
      teach: { title: "ML Intro", explanation: "Learning from data.", syntax: "model.fit()", exampleCode: "import sklearn" },
      practice: [
        { question: "Supervised?", options: ["Yes", "No", "Maybe", "None"], correctIndex: 0 },
        { question: "Algorithm?", options: ["Linear Reg", "Print", "Loop", "If"], correctIndex: 0 },
        { question: "Data?", options: ["Labeled", "Random", "Empty", "None"], correctIndex: 0 }
      ],
      coding: [
        { title: "Import", question: "Import sklearn.", in: "q", out: "import sklearn", template: "" },
        { title: "Fit", question: "Call fit.", in: "q", out: "fit", template: "" }
      ]
    }
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

app.get("/", (req, res) => res.send("AI Personalized Learning Backend Running 🚀"));

app.post("/chat", (req, res) => {
  const { message } = req.body;
  const msg = (message || "").toLowerCase();
  
  const user = users[0] || { name: "Explorer", scores: { dsa: 0, java: 0, python: 0, communication: 0 } };
  const avg = Object.values(user.scores).reduce((a, b) => a + b, 0) / (Object.values(user.scores).length || 1);

  let reply = "";

  if (msg.includes("topics in dsa")) {
    reply = "Core DSA topics include: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Dynamic Programming.";
  } else if (msg.includes("java")) {
    reply = "Java is an object-oriented, platform-independent language. It's great for enterprise apps and Android development.";
  } else if (msg.includes("weak")) {
    reply = "Based on your scores, I suggest spending more time on the 'Practice' phase specifically for " + (user.scores.dsa < 50 ? "DSA" : "Python") + " theory.";
  } else if (msg.includes("python")) {
    reply = "Python is known for its simplicity and versatility, especially in AI, Machine Learning, and web automation.";
  } else if (msg.includes("hi") || msg.includes("hello")) {
    reply = `Hello ${user.name}! I'm your AI tutor. Ready to conquer your learning goals today?`;
  } else {
    reply = "I'm here to help. You can ask about specific courses like Java/DSA or for study suggestions based on your performance!";
  }

  res.json({ reply });
});

app.get("/api/dashboard", (req, res) => {
  const user = users[0] || { 
    name: "Learner", 
    email: "guest@example.com", 
    scores: { dsa:0, machine_learning:0, aptitude:0, java:0, python:0, communication:0, dbms:0, operating_systems:0, c:0, cpp:0 }, 
    streak: 1, 
    progress: 0 
  };
  
  const scores = user.scores;
  const weakSubjects = Object.keys(scores).filter(k => scores[k] < 50);
  const strongSubjects = Object.keys(scores).filter(k => scores[k] >= 50);
  
  res.json({
    name: user.name,
    email: user.email,
    streak: user.streak,
    progress: user.progress,
    scores: user.scores,
    weakSubjects,
    strongSubjects
  });
});

app.get("/api/courses", (req, res) => {
  res.json([
    { name: "Java", id: "java", recommendedLevel: "Easy", isRecommended: true },
    { name: "Python", id: "python", recommendedLevel: "Easy", isRecommended: true },
    { name: "DSA", id: "dsa", recommendedLevel: "Easy", isRecommended: true },
    { name: "Communication", id: "communication", recommendedLevel: "Easy", isRecommended: false },
    { name: "DBMS", id: "dbms", recommendedLevel: "Easy", isRecommended: false },
    { name: "Operating Systems", id: "operating_systems", recommendedLevel: "Easy", isRecommended: false },
    { name: "C", id: "c", recommendedLevel: "Easy", isRecommended: false },
    { name: "C++", id: "cpp", recommendedLevel: "Easy", isRecommended: false },
    { name: "Machine Learning", id: "machine_learning", recommendedLevel: "Easy", isRecommended: false }
  ]);
});

app.get("/api/module", (req, res) => {
  const { course, level } = req.query;
  const c = course.toLowerCase();
  const bank = QUESTION_BANK[c] || QUESTION_BANK['java'];
  const moduleData = bank[level] || bank[1];
  res.json(moduleData);
});

const PORT = 5001;
app.listen(PORT, () => console.log(`AI Server running on http://localhost:${PORT}`));



const app = express();

app.use(cors());
app.use(express.json());

// 🚀 NEW API
app.post('/run-code', (req, res) => {
  const { code, language } = req.body;

  console.log("Code received:", code);

  // SIMPLE LOGIC (for now)
  if (code.includes("print") || code.includes("System.out.println")) {
    return res.json({
      success: true,
      output: "Hello"
    });
  }

  return res.json({
    success: false,
    output: "Wrong answer. Try again."
  });
});

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});

