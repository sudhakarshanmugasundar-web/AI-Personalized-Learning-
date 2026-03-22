import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@SuppressWarnings("unchecked")
public class Server {
    private static final int PORT = 8080;
    private static final String HOST = "localhost";
    private static final List<Map<String,Object>> SCORE_HISTORY = new ArrayList<>();
    private static final Map<String,Map<Integer,List<Map<String,Object>>>> COURSES = new LinkedHashMap<>();
    // courseIndex removed — module data generated fresh per request

    // ─── PRACTICE QUESTIONS: 5 unique per topic ───────────────────────────────

    // JAVA Level 1: Input/Output
    static Map<String,Object>[] JAVA_L1_PRACTICE = new Map[]{
        q("What is the correct syntax to print 'Hello World' in Java?",
          new String[]{"System.out.print('Hello World')","System.out.println(\"Hello World\");","console.log(\"Hello World\");","printf(\"Hello World\");"},
          1, "System.out.println() is Java's standard method to print with a newline."),
        q("Which class is used to read user input from the keyboard in Java?",
          new String[]{"BufferedReader only","Scanner","InputReader","System.in.read"},
          1, "Scanner (from java.util) is the standard class used to read various types of input."),
        q("What does 'System.out' refer to in Java?",
          new String[]{"A class","The standard output stream","A method","A variable"},
          1, "System is a class, 'out' is a static PrintStream field that represents the standard output."),
        q("Which of these would cause a COMPILE ERROR when printing?",
          new String[]{"System.out.println(42);","System.out.println(true);","System.out.println;","System.out.println(\"hi\");"},
          2, "println without parentheses and arguments is a compile error — it's a method call, not a field."),
        q("To read an integer from the user, which Scanner method is used?",
          new String[]{"scanner.readInt()","scanner.nextInteger()","scanner.nextInt()","scanner.getInt()"},
          2, "nextInt() is the correct Scanner method to read integer values from console input.")
    };

    // JAVA Level 2: Variables
    static Map<String,Object>[] JAVA_L2_PRACTICE = new Map[]{
        q("Which statement correctly declares an integer variable in Java?",
          new String[]{"integer x = 5;","int x = 5;","Int x = 5;","var int x = 5;"},
          1, "Java uses lowercase 'int' as the primitive integer type keyword."),
        q("What is the default value of an uninitialized int field in Java?",
          new String[]{"null","undefined","0","-1"},
          2, "Primitive int fields default to 0 if not initialized explicitly."),
        q("Which of the following is NOT a valid variable name in Java?",
          new String[]{"myVar","_count","2ndName","firstName"},
          2, "Variable names cannot start with a digit — '2ndName' is invalid."),
        q("What will: double d = 5 / 2; print?",
          new String[]{"2.5","2.0","2","Error"},
          1, "5/2 performs integer division (=2) then assigns to double, giving 2.0 not 2.5."),
        q("Which keyword makes a variable constant in Java?",
          new String[]{"static","const","final","immutable"},
          2, "'final' makes a variable a constant — its value cannot be changed after assignment.")
    };

    // JAVA Level 3: Data Types
    static Map<String,Object>[] JAVA_L3_PRACTICE = new Map[]{
        q("How many bits does a Java 'long' data type use?",
          new String[]{"16","32","64","128"},
          2, "Java 'long' is a 64-bit signed integer, range: -9,223,372,036,854,775,808 to max."),
        q("Which data type should you use to store a single character?",
          new String[]{"String","char","letter","text"},
          1, "'char' stores a single 16-bit Unicode character, e.g. char c = 'A';"),
        q("What is the result of: int x = (int) 9.99;",
          new String[]{"10","9","9.99","Error"},
          1, "Casting double to int truncates the decimal — 9.99 becomes 9, not 10."),
        q("Which primitive type stores true/false values?",
          new String[]{"bit","flag","boolean","bool"},
          2, "Java uses 'boolean' for true/false values, unlike C/C++ which can use int."),
        q("What is the size of a 'float' in Java?",
          new String[]{"8 bytes","4 bytes","2 bytes","16 bytes"},
          1, "A Java float is 32 bits (4 bytes); double is 64 bits (8 bytes).")
    };

    // JAVA Level 4: Strings
    static Map<String,Object>[] JAVA_L4_PRACTICE = new Map[]{
        q("What does 'hello'.length() return?",
          new String[]{"4","5","6","Error"},
          1, "length() returns number of characters. 'hello' has 5 characters."),
        q("Which method checks if two strings have same content?",
          new String[]{"==","compareTo()","equals()","matches()"},
          2, "equals() compares string content; == compares object references."),
        q("What does 'Java'.toUpperCase() return?",
          new String[]{"java","JAVA","Java","JaVa"},
          1, "toUpperCase() converts all characters to uppercase."),
        q("What does \"Hello World\".substring(6) return?",
          new String[]{"Hello","World","Hello World","orld"},
          1, "substring(6) returns from index 6 to end: 'World'."),
        q("Which method replaces characters in a String?",
          new String[]{"swap()","change()","replace()","set()"},
          2, "replace(oldChar, newChar) or replace(oldStr, newStr) returns a new String with replacements.")
    };

    // JAVA Level 5: Loops
    static Map<String,Object>[] JAVA_L5_PRACTICE = new Map[]{
        q("What is the output of: for(int i=1;i<=3;i++) System.out.print(i);",
          new String[]{"0 1 2","1 2 3","123","1 2 3 "},
          2, "The loop starts at 1 and prints 1,2,3 without spaces using print (not println)."),
        q("Which loop guarantees at least one execution?",
          new String[]{"for loop","while loop","do-while loop","enhanced for loop"},
          2, "do-while checks the condition AFTER the body runs, ensuring at least one execution."),
        q("What does 'break' do inside a loop?",
          new String[]{"Skips current iteration","Exits the loop entirely","Restarts the loop","Throws an error"},
          1, "break immediately exits the loop, jumping to the code after the loop block."),
        q("How many times does this print: for(int i=0;i<5;i+=2) System.out.println(i);",
          new String[]{"5","4","3","2"},
          2, "i goes 0,2,4 — three iterations before i becomes 6 which is not <5."),
        q("Which keyword skips the current iteration and goes to the next?",
          new String[]{"break","return","skip","continue"},
          3, "continue skips the rest of the loop body for the current iteration and continues with next.")
    };

    // JAVA Level 6: Arrays
    static Map<String,Object>[] JAVA_L6_PRACTICE = new Map[]{
        q("How do you get the length of an array 'arr' in Java?",
          new String[]{"arr.length()","arr.size()","arr.length","len(arr)"},
          2, "Arrays use .length (a field, not a method). Collections use .size()."),
        q("What is the index of the FIRST element in a Java array?",
          new String[]{"1","0","-1","Depends on type"},
          1, "Java arrays are 0-indexed — the first element is at index 0."),
        q("What happens if you access arr[arr.length] ?",
          new String[]{"Returns null","Returns 0","ArrayIndexOutOfBoundsException","Returns last element"},
          2, "Valid indices are 0 to length-1. Accessing length throws ArrayIndexOutOfBoundsException."),
        q("Which is correct to declare an int array of size 5?",
          new String[]{"int arr = new int[5];","int[] arr = new int[5];","array int arr[5];","int arr[5] = new int[];"},
          1, "The correct syntax is: int[] arr = new int[5]; — type with brackets, then new."),
        q("Which loop is best for iterating all array elements when index isn't needed?",
          new String[]{"while loop","do-while","enhanced for-each","indexed for loop"},
          2, "The enhanced for-each loop (for(int x : arr)) cleanly iterates without needing an index.")
    };

    // JAVA Level 7: OOP
    static Map<String,Object>[] JAVA_L7_PRACTICE = new Map[]{
        q("Which keyword is used to create an object from a class?",
          new String[]{"create","object","new","instance"},
          2, "'new' allocates memory and calls the constructor to create an object."),
        q("What is a constructor?",
          new String[]{"A method that destroys objects","A special method called when object is created","A static utility method","An inherited method"},
          1, "A constructor has the same name as the class and no return type; it initializes the object."),
        q("Which OOP principle hides internal details and shows only functionality?",
          new String[]{"Inheritance","Polymorphism","Encapsulation","Abstraction"},
          3, "Abstraction hides implementation details; you interact with objects through their interface."),
        q("What does 'super()' call in Java?",
          new String[]{"Current class constructor","Parent class constructor","Static methods","Interface default method"},
          1, "super() calls the parent class constructor from within a child class constructor."),
        q("Which access modifier makes a member visible ONLY within its own class?",
          new String[]{"public","protected","default","private"},
          3, "private restricts access to the declaring class only — it's the strictest modifier.")
    };

    // PYTHON Level 1: Basics
    static Map<String,Object>[] PY_L1_PRACTICE = new Map[]{
        q("Which function prints output in Python?",
          new String[]{"System.out.println()","console.log()","print()","echo()"},
          2, "Python uses print() to display output. No semicolons or braces needed."),
        q("How do you write a single-line comment in Python?",
          new String[]{"// comment","/* comment */","# comment","-- comment"},
          2, "Python uses # for single-line comments, unlike // in Java or C++."),
        q("Which of these is valid Python code?",
          new String[]{"int x = 5;","var x = 5","x = 5","x := 5 (Python 3.7 walrus only)"},
          2, "Python uses dynamic typing — just write x = 5, no type declaration needed."),
        q("Python indentation is used for:",
          new String[]{"Style only","Defining code blocks","Improving speed","Commenting code"},
          1, "Python uses indentation (spaces/tabs) to define blocks, unlike {} in Java/C."),
        q("What does type(42) return in Python?",
          new String[]{"'integer'","int","<class 'int'>","Number"},
          2, "type() returns the class of the value. type(42) returns <class 'int'>.")
    };

    // PYTHON Level 2: Input/Output
    static Map<String,Object>[] PY_L2_PRACTICE = new Map[]{
        q("How do you read user input in Python?",
          new String[]{"Scanner()","readline()","input()","read()"},
          2, "Python's built-in input() reads a line from stdin and returns it as a string."),
        q("What does int(input()) do?",
          new String[]{"Reads a float","Reads and converts input to integer","Creates a variable","Prints a number"},
          1, "input() reads a string; int() converts it to an integer — combined as int(input())."),
        q("Which f-string is correct in Python 3?",
          new String[]{"f'{name}'","f\"{name}\"","Both A and B","Neither"},
          2, "f-strings work with both single and double quotes: f'{x}' and f\"{x}\" are both valid."),
        q("What is the output of: print(3, 4, sep='-')?",
          new String[]{"3 4","34","3-4","3, 4"},
          2, "sep='-' sets the separator, so print(3, 4, sep='-') outputs: 3-4"),
        q("Which print argument adds no newline at the end?",
          new String[]{"end=None","end=''","newline=False","sep=''"},
          1, "print(..., end='') suppresses the default newline at the end of output.")
    };

    // PYTHON Level 3: Loops
    static Map<String,Object>[] PY_L3_PRACTICE = new Map[]{
        q("What does range(1, 6) generate?",
          new String[]{"1 2 3 4 5 6","0 1 2 3 4 5","1 2 3 4 5","1 2 3 4"},
          2, "range(start, stop) generates stop-1 as the last value: 1,2,3,4,5."),
        q("Which Python loop is used to iterate over a list?",
          new String[]{"while only","for...in","do...while","foreach"},
          1, "Python's for loop uses 'for item in iterable:' syntax — very readable."),
        q("What does 'continue' do in Python?",
          new String[]{"Exits the loop","Skips current iteration","Restarts the script","Raises an error"},
          1, "continue skips the rest of the current iteration and moves to the next one."),
        q("What is the output of: for i in range(0,10,3): print(i)?",
          new String[]{"0 3 6 9","0 3 6 9 10","0 3 6","1 4 7"},
          0, "range(0,10,3) gives 0,3,6,9 — step 3, stopping before 10."),
        q("Which statement exits a loop immediately in Python?",
          new String[]{"exit","return","break","stop"},
          2, "'break' immediately terminates the innermost loop in Python.")
    };

    // PYTHON Level 4: Lists
    static Map<String,Object>[] PY_L4_PRACTICE = new Map[]{
        q("How do you add an element to the end of a Python list?",
          new String[]{"list.add(x)","list.push(x)","list.append(x)","list.insert(x)"},
          2, "append(x) adds x to the end. insert(i, x) inserts at a specific index."),
        q("What does my_list[-1] return?",
          new String[]{"First element","Second-to-last","Last element","Error"},
          2, "Negative indexing: -1 is the last element, -2 is second-to-last, etc."),
        q("Which method removes a specific value from a list?",
          new String[]{"delete()","remove()","pop()","discard()"},
          1, "remove(x) removes first occurrence of value x. pop() removes by index."),
        q("What is the result of [1,2] + [3,4] in Python?",
          new String[]{"[1,2,3,4]","[4,6]","Error","[[1,2],[3,4]]"},
          0, "List concatenation with + produces a new list: [1,2,3,4]."),
        q("Which built-in function returns sorted copy of a list?",
          new String[]{"sort()","order()","sorted()","arrange()"},
          2, "sorted(list) returns a new sorted list. list.sort() sorts in-place.")
    };

    // PYTHON Level 5: Functions
    static Map<String,Object>[] PY_L5_PRACTICE = new Map[]{
        q("Which keyword defines a function in Python?",
          new String[]{"func","function","def","define"},
          2, "Python uses 'def' to declare a function: def my_function():"),
        q("What does a function return if it has no return statement?",
          new String[]{"0","False","None","Error"},
          2, "Python functions implicitly return None if no return statement is specified."),
        q("What is a default argument in Python?",
          new String[]{"An argument that must always be provided","An argument with a preset value","A keyword-only argument","A positional argument"},
          1, "Default arguments have a preset value: def greet(name='World'): — name defaults to 'World'."),
        q("Which symbol is used for *args in Python?",
          new String[]{"**","*","&","@"},
          1, "*args allows a function to accept any number of positional arguments as a tuple."),
        q("What is the output of: (lambda x: x*2)(5)?",
          new String[]{"10","5","25","Error"},
          0, "lambda x: x*2 creates an anonymous function; called with 5 it returns 10.")
    };

    // PYTHON Level 6: OOP
    static Map<String,Object>[] PY_L6_PRACTICE = new Map[]{
        q("What does __init__ do in Python?",
          new String[]{"Destroys the object","Initializes attributes when object is created","Imports a module","Defines class methods"},
          1, "__init__ is the constructor — called automatically when a new object is created."),
        q("What does 'self' refer to in a Python class?",
          new String[]{"The class itself","The current object instance","The parent class","A static variable"},
          1, "'self' is a reference to the current instance of the class, similar to 'this' in Java."),
        q("Which method is used for string representation of an object?",
          new String[]{"__print__()","__display__()","__str__()","toString()"},
          2, "__str__() is called by print() and str() to get a human-readable representation."),
        q("How do you inherit from a parent class in Python?",
          new String[]{"class Child extends Parent:","class Child(Parent):","class Child inherits Parent:","class Child: Parent"},
          1, "Python uses class Child(Parent): syntax for inheritance — clean and expressive."),
        q("What is method overriding in OOP?",
          new String[]{"Calling a parent method","Redefining a parent method in child class","Creating two methods with same name","Deleting a method"},
          1, "Overriding redefines a parent class method in the child class with new behavior.")
    };

    private static Map<String,Object> q(String question, String[] opts, int correct, String explanation) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("question", question);
        m.put("options", opts);
        m.put("correctIndex", correct);
        m.put("explanation", explanation);
        return m;
    }

    // ─── CODING PROBLEMS: 10 unique per course ──────────────────────────────

    static Object[][] JAVA_CODING = {
        // {title, description, inputFormat, outputFormat, constraints, testCaseIn, testCaseOut, difficulty}
        {"Sum of N Numbers","Read N integers and print their sum.","First line: N. Next N lines: one integer each.","A single integer — the sum.","1 <= N <= 1000, -10000 <= each num <= 10000","5\n1 2 3 4 5","15","easy"},
        {"Even or Odd","Given an integer N, print 'Even' if it is even, else print 'Odd'.","A single integer N.","Print 'Even' or 'Odd'.","1 <= N <= 10^9","7","Odd","easy"},
        {"Factorial","Given N, compute and print N! (factorial).","A single integer N.","A single integer — N factorial.","0 <= N <= 12","5","120","easy"},
        {"Reverse a Number","Given an integer N, print its digits in reverse order.","A single integer N.","The reversed integer.","1 <= N <= 10^8","1234","4321","medium"},
        {"Palindrome Check","Given a string, print 'Yes' if it is a palindrome, else 'No'.","A single string (no spaces).","'Yes' or 'No'.","Length 1..100","madam","Yes","medium"},
        {"Fibonacci Series","Print the first N numbers in the Fibonacci sequence (starting 0,1).","A single integer N.","N space-separated Fibonacci numbers.","1 <= N <= 20","8","0 1 1 2 3 5 8 13","medium"},
        {"Prime Check","Given N, print 'Prime' if prime else 'Not Prime'.","A single integer N.","'Prime' or 'Not Prime'.","2 <= N <= 10^6","17","Prime","medium"},
        {"Array Sum & Max","Given an array, print the sum and the maximum element on separate lines.","First line: N. Second line: N space-separated integers.","Line 1: sum. Line 2: max element.","1 <= N <= 100","5\n3 7 1 9 4","24\n9","hard"},
        {"Count Vowels","Count the number of vowels (a,e,i,o,u) in a given string.","A single string.","An integer — count of vowels.","Length 1..200","programming","3","hard"},
        {"Star Pattern","Print a right-angled triangle of stars with N rows.","A single integer N.","N lines, i-th line has i stars.","1 <= N <= 10","4","*\n**\n***\n****","medium"}
    };

    static Object[][] PYTHON_CODING = {
        {"Sum of N Numbers","Read N integers and print their sum using Python.","First line: N. Next N lines: one integer each.","A single integer — the sum.","1 <= N <= 1000","5\n10 20 30 40 50","150","easy"},
        {"Even or Odd","Given an integer N, print 'Even' if even, else 'Odd'.","A single integer N.","'Even' or 'Odd'.","1 <= N <= 10^9","14","Even","easy"},
        {"Factorial using for loop","Calculate factorial of N using a for loop in Python.","A single integer N.","N! as a single integer.","0 <= N <= 12","6","720","easy"},
        {"Reverse a Number","Read an integer and print its digits reversed.","A single integer N.","The reversed number.","1 <= N <= 10^8","9876","6789","medium"},
        {"Palindrome Check","Check if a string is a palindrome using Python slicing.","A single string.","'Yes' or 'No'.","Length 1..100","racecar","Yes","medium"},
        {"Fibonacci using while loop","Print first N Fibonacci numbers using a while loop.","A single integer N.","N space-separated Fibonacci numbers.","1 <= N <= 20","6","0 1 1 2 3 5","medium"},
        {"Prime Number Check","Determine if N is prime using Python.","A single integer N.","'Prime' or 'Composite'.","2 <= N <= 10^6","13","Prime","medium"},
        {"List Maximum & Minimum","Find and print max and min of a list on separate lines.","First line: N. Second line: N space-separated integers.","Line 1: max. Line 2: min.","1 <= N <= 100","5\n4 8 2 6 1","8\n1","hard"},
        {"Count Words","Count the number of words in a given sentence.","A single line of text.","An integer — word count.","Non-empty string, up to 200 chars","Python is great for beginners","5","medium"},
        {"Number Triangle Pattern","Print a right-angle number triangle of N rows.","A single integer N.","N lines where i-th line prints 1 to i.","1 <= N <= 9","4","1\n12\n123\n1234","medium"}
    };

    // ─── ENGLISH SENTENCES FOR COMMUNICATION ────────────────────────────────

    static String[][] ENGLISH_L1_SENTENCES = {
        {"The sun rises in the east. It gives us light and energy.", "the sun rises in the east it gives us light and energy"},
        {"I wake up early every morning to exercise and stay healthy.", "i wake up early every morning to exercise and stay healthy"},
        {"She reads books every evening to improve her knowledge.", "she reads books every evening to improve her knowledge"},
        {"Clean water is essential for the survival of all living beings.", "clean water is essential for the survival of all living beings"},
        {"Hard work and dedication are the keys to success in life.", "hard work and dedication are the keys to success in life"}
    };

    static String[][] ENGLISH_L2_BLANKS = {
        {"Tiger is the ______ animal of India.", "national", "Tiger is the national animal of India."},
        {"The capital of France is ______.", "Paris", "The capital of France is Paris."},
        {"Water boils at ______ degrees Celsius.", "100", "Water boils at 100 degrees Celsius."},
        {"The Earth revolves around the ______.", "Sun", "The Earth revolves around the Sun."},
        {"A group of lions is called a ______.", "pride", "A group of lions is called a pride."}
    };

    // ─── MODULE DATA GENERATOR ─────────────────────────────────────────────

    static String buildModuleJson(String courseId, int level) {
        StringBuilder sb = new StringBuilder("{");

        // ── TEACH ──
        String teachTitle, teachExp, vidUrl, syntax, exampleCode;

        if (courseId.equals("java")) {
            switch (level) {
                case 1: teachTitle="Input / Output"; teachExp="Java uses System.out.println() to print output and the Scanner class to read user input from the keyboard."; vidUrl="https://www.youtube.com/embed/bSrm9RXwEQI"; syntax="Scanner sc = new Scanner(System.in);\nint n = sc.nextInt();\nSystem.out.println(n);"; exampleCode="import java.util.Scanner;\npublic class Hello {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String name = sc.nextLine();\n    System.out.println(\"Hello, \" + name + \"!\");\n  }\n}"; break;
                case 2: teachTitle="Variables & Data Types"; teachExp="Variables store data values. Java is statically typed — you must declare the type. Common types: int, double, boolean, char, String."; vidUrl="https://www.youtube.com/embed/gtQJXzi3Ym8"; syntax="type variableName = value;"; exampleCode="int age = 20;\ndouble price = 99.5;\nboolean isStudent = true;\nchar grade = 'A';\nString name = \"Riya\";"; break;
                case 3: teachTitle="Data Types Deep Dive"; teachExp="Java has 8 primitive types. Choosing the right type saves memory and prevents errors. Casting converts between types."; vidUrl="https://www.youtube.com/embed/gtQJXzi3Ym8"; syntax="int x = (int) doubleValue;  // casting"; exampleCode="byte  b  = 127;\nshort s  = 32000;\nint   i  = 2_000_000;\nlong  l  = 9_000_000_000L;\nfloat f  = 3.14f;\ndouble d = 3.141592;\nchar  c  = 'Z';\nboolean ok = false;"; break;
                case 4: teachTitle="Strings in Java"; teachExp="A String is a sequence of characters. Java Strings are immutable — every modification creates a new String. Key methods: length(), equals(), substring(), toUpperCase(), replace()."; vidUrl="https://www.youtube.com/embed/bSrm9RXwEQI"; syntax="String s = \"text\";\ns.method();"; exampleCode="String s = \"Hello World\";\nSystem.out.println(s.length());       // 11\nSystem.out.println(s.toUpperCase());  // HELLO WORLD\nSystem.out.println(s.substring(0,5)); // Hello\nSystem.out.println(s.replace(\"World\",\"Java\")); // Hello Java"; break;
                case 5: teachTitle="Loops (for, while, do-while)"; teachExp="Loops repeat a block of code. Use 'for' when iterations are known, 'while' when condition-driven, and 'do-while' to guarantee at least one execution."; vidUrl="https://www.youtube.com/embed/14d06GnbW18"; syntax="for(init; condition; update) { }\nwhile(condition) { }\ndo { } while(condition);"; exampleCode="// for loop (1 to 5):\nfor(int i=1; i<=5; i++) {\n  System.out.print(i + \" \");\n}\n// while loop:\nint j = 0;\nwhile(j < 3) { System.out.println(j); j++; }"; break;
                case 6: teachTitle="Arrays"; teachExp="An array stores multiple values of the same type. Arrays are fixed-size, zero-indexed. Use loops to traverse them."; vidUrl="https://www.youtube.com/embed/bSrm9RXwEQI"; syntax="int[] arr = new int[size];\ntype[] arr = {val1, val2};"; exampleCode="int[] scores = {82, 95, 71, 88, 60};\nint sum = 0;\nfor(int s : scores) sum += s;\nSystem.out.println(\"Sum: \" + sum);\nSystem.out.println(\"Avg: \" + (sum/scores.length));"; break;
                default: teachTitle="OOP — Classes & Objects"; teachExp="Object-Oriented Programming models real-world entities as classes. A class is a blueprint; an object is an instance. OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction."; vidUrl="https://www.youtube.com/embed/bSrm9RXwEQI"; syntax="class MyClass {\n  type field;\n  MyClass(params) { } // constructor\n  void method() { }\n}"; exampleCode="class Student {\n  String name; int marks;\n  Student(String n, int m) { name=n; marks=m; }\n  void display() {\n    System.out.println(name+\": \"+marks);\n  }\n}\nStudent s = new Student(\"Rohan\",90);\ns.display();"; break;
            }
        } else if (courseId.equals("python")) {
            switch (level) {
                case 1: teachTitle="Python Basics"; teachExp="Python is clean, readable, and beginner-friendly. No semicolons, no braces — indentation defines blocks. Variables are dynamically typed."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="variable = value\nprint(variable)"; exampleCode="name = \"Alice\"\nage  = 22\ngpa  = 9.1\nprint(f\"Name: {name}, Age: {age}, GPA: {gpa}\")\nprint(type(age))  # <class 'int'>"; break;
                case 2: teachTitle="Input & Output in Python"; teachExp="Python reads input with input() (always returns a string). Convert with int() or float(). Use f-strings for clean formatted output."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="name = input(\"Prompt: \")\nn = int(input())\nprint(f\"Value: {n}\")"; exampleCode="name = input(\"Enter your name: \")\nage  = int(input(\"Enter age: \"))\nprint(f\"Hello {name}, you are {age} years old!\")\nprint(\"In 5 years:\", age + 5)"; break;
                case 3: teachTitle="Loops in Python"; teachExp="Python for loops iterate over any sequence. range() generates numbers. while loops run while condition is True. Use break and continue for flow control."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="for i in range(start, stop, step):\n    # body\nwhile condition:\n    # body"; exampleCode="# For loop:\nfor i in range(1, 6):\n    print(i, end=\" \")  # 1 2 3 4 5\n\n# While loop:\nn, total = 5, 0\nwhile n > 0:\n    total += n\n    n -= 1\nprint(total)  # 15"; break;
                case 4: teachTitle="Python Lists"; teachExp="Lists are ordered, mutable sequences. Unlike Java arrays, lists grow dynamically. Key methods: append, remove, sort, len, max, min, sum."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="lst = [val1, val2]\nlst.append(new_val)\nfor item in lst:\n    print(item)"; exampleCode="marks = [82, 95, 71, 88, 60]\nmarks.append(99)\nmarks.sort()\nprint(marks)          # sorted list\nprint(max(marks))     # highest mark\nprint(sum(marks)//len(marks))  # average"; break;
                case 5: teachTitle="Functions in Python"; teachExp="Functions use 'def'. They support default arguments, *args for variable arguments, and can return multiple values as tuples. Lambda creates inline functions."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="def func_name(params, default=val):\n    return result"; exampleCode="def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\ndef sum_all(*nums):\n    return sum(nums)\n\nprint(greet(\"Rohan\"))        # Hello, Rohan!\nprint(greet(\"Priya\",\"Hi\")) # Hi, Priya!\nprint(sum_all(1,2,3,4,5))  # 15"; break;
                default: teachTitle="OOP in Python"; teachExp="Python classes use __init__ as constructor. 'self' refers to the instance. Inheritance is done with class Child(Parent). Python supports multiple inheritance."; vidUrl="https://www.youtube.com/embed/kqtD5dpn9C8"; syntax="class MyClass:\n    def __init__(self, params):\n        self.attr = params\n    def method(self):\n        pass"; exampleCode="class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f\"{self.name} speaks\"\n\nclass Dog(Animal):\n    def speak(self):\n        return f\"{self.name} says Woof!\"\n\nd = Dog(\"Bruno\")\nprint(d.speak())  # Bruno says Woof!"; break;
            }
        } else { // english
            switch (level) {
                case 1: teachTitle="Reading Practice"; teachExp="Reading aloud trains pronunciation, fluency, and confidence. Focus on clear articulation, correct word stress, and natural pause at punctuation."; vidUrl="https://www.youtube.com/embed/e1X6YIf0-e4"; syntax="Subject + Verb + Object"; exampleCode="The sun rises in the east.\nIt gives us light and energy."; break;
                case 2: teachTitle="Fill in the Blanks"; teachExp="Identify the missing word from context clues. Read the full sentence, determine the part of speech needed, and pick the word that fits semantically."; vidUrl="https://www.youtube.com/embed/e1X6YIf0-e4"; syntax="Read → Identify gap → Use context clues"; exampleCode="Example: Tiger is the ______ animal of India.\nAnswer: National\nSpeak the full sentence clearly."; break;
                case 3: teachTitle="Listening & Repeating"; teachExp="Shadowing technique: listen to native audio then repeat immediately. This trains your brain to match pronunciation, rhythm, and intonation simultaneously."; vidUrl="https://www.youtube.com/embed/e1X6YIf0-e4"; syntax="Listen → Pause → Repeat accurately"; exampleCode="Practice: 'Pronunciation improves with daily practice.'\nFocus on: word stress, intonation, rhythm."; break;
                case 4: teachTitle="Topic Speaking"; teachExp="Organise your thoughts using Introduction-Body-Conclusion structure. Speak clearly, stay on topic, use connecting words (however, therefore, firstly)."; vidUrl="https://www.youtube.com/embed/e1X6YIf0-e4"; syntax="Intro (10s) → Body (25s) → Conclusion (10s)"; exampleCode="Topic: My favourite hobby\nIntro: 'My favourite hobby is reading...'\nBody: 'I read every evening because...'\nConclusion: 'This hobby has helped me...'"; break;
                default: teachTitle="Interview Practice"; teachExp="Use the STAR method: Situation, Task, Action, Result. Speak confidently, maintain eye contact, avoid filler words like 'umm' and 'like'."; vidUrl="https://www.youtube.com/embed/e1X6YIf0-e4"; syntax="Situation → Task → Action → Result"; exampleCode="Q: Tell me about yourself.\nA: 'I am [name], a [degree] student from [college]. I am passionate about [field] and have [achievement]...'"; break;
            }
        }

        sb.append("\"teach\":{");
        sb.append("\"title\":\"").append(esc(teachTitle)).append("\",");
        sb.append("\"explanation\":\"").append(esc(teachExp)).append("\",");
        sb.append("\"syntax\":\"").append(esc(syntax)).append("\",");
        sb.append("\"exampleCode\":\"").append(esc(exampleCode)).append("\",");
        sb.append("\"videoUrl\":\"").append(esc(vidUrl)).append("\"");
        sb.append("},");

        // ── PRACTICE ──
        Map<String,Object>[] pqs;
        if (courseId.equals("java")) {
            Map<String,Object>[][] all = new Map[][]{JAVA_L1_PRACTICE,JAVA_L2_PRACTICE,JAVA_L3_PRACTICE,JAVA_L4_PRACTICE,JAVA_L5_PRACTICE,JAVA_L6_PRACTICE,JAVA_L7_PRACTICE};
            pqs = all[Math.min(level-1, all.length-1)];
        } else if (courseId.equals("python")) {
            Map<String,Object>[][] all = new Map[][]{PY_L1_PRACTICE,PY_L2_PRACTICE,PY_L3_PRACTICE,PY_L4_PRACTICE,PY_L5_PRACTICE,PY_L6_PRACTICE};
            pqs = all[Math.min(level-1, all.length-1)];
        } else {
            // English practice as vocab/grammar MCQ
            pqs = buildEnglishPractice(level);
        }

        sb.append("\"practice\":[");
        for (int i = 0; i < pqs.length; i++) {
            Map<String,Object> pq = pqs[i];
            String[] opts = (String[]) pq.get("options");
            sb.append("{");
            sb.append("\"type\":\"multiple-choice\",");
            sb.append("\"question\":\"").append(esc((String)pq.get("question"))).append("\",");
            sb.append("\"options\":[");
            for (int j = 0; j < opts.length; j++) {
                sb.append("\"").append(esc(opts[j])).append("\"");
                if (j < opts.length-1) sb.append(",");
            }
            sb.append("],");
            sb.append("\"correctIndex\":").append(pq.get("correctIndex")).append(",");
            sb.append("\"explanation\":\"").append(esc((String)pq.get("explanation"))).append("\"");
            sb.append("}");
            if (i < pqs.length-1) sb.append(",");
        }
        sb.append("],");

        // ── CODING ──
        // For English, we skip coding (use communicaton exercises instead - handled by frontend)
        Object[][] coding = courseId.equals("python") ? PYTHON_CODING : JAVA_CODING;

        sb.append("\"coding\":[");
        for (int i = 0; i < coding.length; i++) {
            Object[] c = coding[i];
            sb.append("{");
            sb.append("\"type\":\"coding\",");
            sb.append("\"title\":\"").append(esc((String)c[0])).append("\",");
            sb.append("\"question\":\"").append(esc((String)c[1])).append("\",");
            sb.append("\"inputFormat\":\"").append(esc((String)c[2])).append("\",");
            sb.append("\"outputFormat\":\"").append(esc((String)c[3])).append("\",");
            sb.append("\"constraints\":\"").append(esc((String)c[4])).append("\",");
            sb.append("\"testCaseIn\":\"").append(esc((String)c[5])).append("\",");
            sb.append("\"testCaseOut\":\"").append(esc((String)c[6])).append("\",");
            sb.append("\"difficulty\":\"").append(esc((String)c[7])).append("\"");
            sb.append("}");
            if (i < coding.length-1) sb.append(",");
        }
        sb.append("],");

        // ── ENGLISH COMMUNICATION DATA ──
        if (courseId.equals("english")) {
            appendEnglishData(sb, level);
        } else {
            sb.append("\"englishData\":null");
        }

        sb.append("}");
        return sb.toString();
    }

    static Map<String,Object>[] buildEnglishPractice(int level) {
        if (level == 1) return new Map[]{
            q("Which punctuation ends a statement?", new String[]{"Comma","Period (.)","Exclamation","Question mark"}, 1, "A period ends a declarative statement."),
            q("'He go to school' is grammatically:", new String[]{"Correct","Wrong — should be 'goes'","Wrong — should be 'going'","Correct in informal"}, 1, "Third-person singular present: 'He goes to school.'"),
            q("Which sentence is in simple past tense?", new String[]{"She eats rice","She will eat rice","She ate rice","She is eating rice"}, 2, "'Ate' is the past tense of 'eat'. Simple past describes completed actions."),
            q("'I am go to market' — what is wrong?", new String[]{"'am' is wrong","'go' should be 'going'","'market' is wrong","Nothing is wrong"}, 1, "After 'am/is/are', use the -ing form: 'I am going to market.'"),
            q("The opposite of 'present' tense is:", new String[]{"Future","Past","Progressive","Perfect"}, 1, "The two main tenses are present and past. Future is another category.")
        };
        if (level == 2) return new Map[]{
            q("'Tiger is the ____ animal of India' — fill blank:", new String[]{"Royal","National","Famous","State"}, 1, "Tiger is the National Animal of India. This is a general knowledge fill-blank."),
            q("'Water is essential for ____' — fill blank:", new String[]{"cooking only","plants only","life","sports"}, 2, "Water is essential for life — all living organisms need it."),
            q("'The moon revolves around the ____' — fill blank:", new String[]{"Sun","Earth","Stars","Galaxy"}, 1, "The Moon revolves around the Earth, not the Sun."),
            q("'A group of fish is called a ____' — fill blank:", new String[]{"herd","flock","school","pack"}, 2, "A school of fish — collective nouns vary by animal group."),
            q("'I ____ a student at this college' — fill blank:", new String[]{"is","are","am","be"}, 2, "First person singular: 'I am a student.' Subject-verb agreement rule.")
        };
        // Generic grammar for L3+
        return new Map[]{
            q("What part of speech is 'quickly'?", new String[]{"Noun","Adjective","Adverb","Verb"}, 2, "Adverbs modify verbs/adjectives. 'He runs quickly.'"),
            q("Which is an abstract noun?", new String[]{"Table","Dog","Freedom","Teacher"}, 2, "Abstract nouns name ideas/feelings: freedom, love, justice."),
            q("'Neither the boys nor the teacher ____ present.' — correct verb:", new String[]{"were","are","was","is"}, 2, "With neither...nor, verb agrees with the subject closer to it: 'teacher' (singular) → 'was'."),
            q("Which is a compound sentence?", new String[]{"She sings.","She sings and he dances.","She sings beautifully.","Because she sings."}, 1, "A compound sentence joins two independent clauses with a conjunction."),
            q("Identify the conjunction: 'I was tired but I finished.'", new String[]{"I","tired","but","finished"}, 2, "'but' is a coordinating conjunction linking two clauses.")
        };
    }

    static void appendEnglishData(StringBuilder sb, int level) {
        if (level == 1) {
            sb.append("\"englishData\":{\"type\":\"reading\",\"sentences\":[");
            for (int i = 0; i < ENGLISH_L1_SENTENCES.length; i++) {
                sb.append("{\"text\":\"").append(esc(ENGLISH_L1_SENTENCES[i][0])).append("\",");
                sb.append("\"expected\":\"").append(esc(ENGLISH_L1_SENTENCES[i][1])).append("\"}");
                if (i < ENGLISH_L1_SENTENCES.length-1) sb.append(",");
            }
            sb.append("]}");
        } else if (level == 2) {
            sb.append("\"englishData\":{\"type\":\"fillblank\",\"blanks\":[");
            for (int i = 0; i < ENGLISH_L2_BLANKS.length; i++) {
                sb.append("{\"sentence\":\"").append(esc(ENGLISH_L2_BLANKS[i][0])).append("\",");
                sb.append("\"answer\":\"").append(esc(ENGLISH_L2_BLANKS[i][1])).append("\",");
                sb.append("\"full\":\"").append(esc(ENGLISH_L2_BLANKS[i][2])).append("\"}");
                if (i < ENGLISH_L2_BLANKS.length-1) sb.append(",");
            }
            sb.append("]}");
        } else {
            sb.append("\"englishData\":{\"type\":\"speaking\",\"topics\":[\"My favourite hobby\",\"My daily routine\",\"My dream job\",\"Why education is important\",\"Describe your hometown\"]}");
        }
    }

    private static void initCourses() {
        COURSES.put("english", new LinkedHashMap<>());
        COURSES.put("java", new LinkedHashMap<>());
        COURSES.put("python", new LinkedHashMap<>());
        for (int i = 1; i <= 7; i++) {
            COURSES.get("java").put(i, new ArrayList<>());
        }
        for (int i = 1; i <= 5; i++) {
            COURSES.get("english").put(i, new ArrayList<>());
            COURSES.get("python").put(i, new ArrayList<>());
        }
        COURSES.get("python").put(6, new ArrayList<>());
    }

    public static void main(String[] args) throws IOException {
        initCourses();
        Database.registerUser("Student", "student@demo.com", "1234");
        Database.registerUser("Admin", "admin@demo.com", "admin123");

        HttpServer server = HttpServer.create(new InetSocketAddress(HOST, PORT), 0);
        server.createContext("/api/login",    Server::handleLogin);
        server.createContext("/api/register", Server::handleRegister);
        server.createContext("/api/progress", Server::handleProgress);
        server.createContext("/api/module",   Server::handleModule);
        server.createContext("/api/profile",  Server::handleProfile);
        server.createContext("/api/submit",   Server::handleSubmit);
        server.createContext("/api/scores",   Server::handleScores);
        server.createContext("/api/health",   Server::handleHealth);
        server.setExecutor(null);
        server.start();
        printBanner();
    }

    static void handleLogin(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return; requireMethod(ex, "POST");
        String body = body(ex);
        String email = field(body, "email"), password = field(body, "password");
        String name = Database.authenticate(email, password);
        log("LOGIN", "user=" + email + " success=" + (name != null));
        if (name != null) send(ex, 200, "{\"success\":true,\"message\":\"Login successful\",\"user\":\"" + esc(name) + "\"}");
        else send(ex, 401, "{\"success\":false,\"message\":\"Invalid email or password\"}");
    }

    static void handleRegister(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return; requireMethod(ex, "POST");
        String body = body(ex);
        String name = field(body, "name"), email = field(body, "email"), password = field(body, "password");
        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) { send(ex, 400, "{\"success\":false,\"message\":\"All fields are required.\"}"); return; }
        boolean ok = Database.registerUser(name, email, password);
        log("REGISTER", "user=" + email + " success=" + ok);
        if (ok) send(ex, 201, "{\"success\":true,\"message\":\"Registration successful! You may now login.\"}");
        else send(ex, 409, "{\"success\":false,\"message\":\"This email is already registered.\"}");
    }

    static void handleProgress(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return;
        String query = ex.getRequestURI().getQuery();
        String user = "student", course = "java";
        if (query != null) { for (String p : query.split("&")) { if (p.startsWith("user=")) user=p.substring(5); if (p.startsWith("course=")) course=p.substring(7); } }
        int lvl = StudentProgress.getUnlockedLevel(user, course);
        send(ex, 200, "{\"unlockedLevel\":" + lvl + "}");
    }

    static void handleModule(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return;
        String query = ex.getRequestURI().getQuery();
        String courseId = "java"; int level = 1;
        if (query != null) { for (String p : query.split("&")) { if (p.startsWith("course=")) courseId=p.substring(7); if (p.startsWith("level=")) level=parseInt(p.substring(6),1); } }
        if (!courseId.equals("java") && !courseId.equals("python") && !courseId.equals("english")) courseId="java";
        if (level < 1) level = 1;
        send(ex, 200, buildModuleJson(courseId, level));
    }

    static void handleProfile(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return;
        String query = ex.getRequestURI().getQuery();
        String user = "Student";
        if (query != null) for (String p : query.split("&")) if (p.startsWith("user=")) user = p.substring(5);
        Map<String,Object> profile = StudentProgress.getProfileView(user);
        StringBuilder json = new StringBuilder("{");
        json.append("\"name\":\"").append(esc((String)profile.get("name"))).append("\",");
        json.append("\"enrolled\":").append(profile.get("enrolled")).append(",");
        json.append("\"completedCourses\":").append(profile.get("completedCourses")).append(",");
        json.append("\"activeCourse\":\"").append(esc((String)profile.get("activeCourse"))).append("\",");
        json.append("\"activeLevel\":").append(profile.get("activeLevel")).append(",");
        json.append("\"topicsCompleted\":").append(profile.get("topicsCompleted")).append(",");
        json.append("\"remainingTopics\":").append(profile.get("remainingTopics")).append(",");
        json.append("\"progressPercent\":").append(profile.get("progressPercent")).append(",");
        json.append("\"accuracy\":").append(profile.get("accuracy")).append(",");
        json.append("\"score\":").append(profile.get("score")).append(",");
        json.append("\"streak\":").append(profile.get("streak"));
        json.append("}");
        send(ex, 200, json.toString());
    }

    static void handleSubmit(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return; requireMethod(ex, "POST");
        String body = body(ex);
        String user = field(body, "user"), course = field(body, "course");
        int level = parseInt(field(body, "level"), 1);
        String type = field(body, "type");
        int score = 0; boolean isCorrect = false;

        if ("module-complete".equals(type)) {
            score = parseInt(field(body,"score"), 0);
            isCorrect = score >= 70;
        } else if ("multiple-choice".equals(type)) {
            int answer = parseInt(field(body,"answer"),-1), correctIndex = parseInt(field(body,"correctIndex"),-1);
            isCorrect = (answer == correctIndex); score = isCorrect ? 100 : 0;
        } else {
            String answer = field(body,"answer").toLowerCase().trim();
            String expected = field(body,"expectedAnswer").toLowerCase().trim();
            if ("speaking".equals(type)||"interview".equals(type)) {
                isCorrect = answer.contains(expected) && answer.length() > 20;
                score = isCorrect ? 90 : (answer.length() > 10 ? 60 : 20);
            } else {
                answer = answer.replaceAll("[.,!?]",""); expected = expected.replaceAll("[.,!?]","");
                isCorrect = answer.equals(expected);
                score = isCorrect ? 100 : (answer.contains(expected) ? 50 : 0);
            }
        }

        String recommendation = RecommendationEngine.recommend(course, level, score);
        if (score >= 70) StudentProgress.completeLevel(user, course, level);
        StudentProgress.saveScore(user, course, level, score, isCorrect);

        Map<String,Object> entry = new LinkedHashMap<>();
        entry.put("user", user.isEmpty()?"anonymous":user); entry.put("course",course); entry.put("level",level);
        entry.put("score",score); entry.put("recommendation",recommendation);
        entry.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        SCORE_HISTORY.add(entry);
        log("SUBMIT","user="+user+" course="+course+" L"+level+" score="+score);

        send(ex,200,"{\"score\":"+score+",\"recommendation\":\""+esc(recommendation)+"\",\"correct\":"+isCorrect+"}");
    }

    static void handleScores(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < SCORE_HISTORY.size(); i++) {
            Map<String,Object> e = SCORE_HISTORY.get(i);
            if (i > 0) sb.append(",");
            sb.append("{\"user\":\"").append(esc((String)e.get("user"))).append("\",");
            sb.append("\"course\":\"").append(esc((String)e.get("course"))).append("\",");
            sb.append("\"level\":").append(e.get("level")).append(",");
            sb.append("\"score\":").append(e.get("score")).append(",");
            sb.append("\"recommendation\":\"").append(esc((String)e.get("recommendation"))).append("\",");
            sb.append("\"timestamp\":\"").append(esc((String)e.get("timestamp"))).append("\"}");
        }
        sb.append("]");
        send(ex, 200, sb.toString());
    }

    static void handleHealth(HttpExchange ex) throws IOException {
        cors(ex); if (preflight(ex)) return;
        send(ex, 200, "{\"status\":\"ok\"}");
    }

    // ── UTILITIES ──
    static void cors(HttpExchange ex) {
        Headers h = ex.getResponseHeaders();
        h.add("Access-Control-Allow-Origin","*");
        h.add("Access-Control-Allow-Methods","GET, POST, OPTIONS");
        h.add("Access-Control-Allow-Headers","Content-Type, Authorization");
        h.add("Content-Type","application/json; charset=utf-8");
    }
    static boolean preflight(HttpExchange ex) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) { ex.sendResponseHeaders(204,-1); return true; } return false;
    }
    static void requireMethod(HttpExchange ex, String method) throws IOException {
        if (!method.equalsIgnoreCase(ex.getRequestMethod())) send(ex,405,"{\"error\":\"Method Not Allowed\"}");
    }
    static void send(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
    }
    static String body(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }
    static String field(String json, String key) {
        String k = "\"" + key + "\""; int ki = json.indexOf(k); if (ki < 0) return "";
        int ci = json.indexOf(":", ki+k.length()); if (ci < 0) return "";
        int vs = ci+1; while (vs < json.length() && Character.isWhitespace(json.charAt(vs))) vs++;
        if (vs >= json.length()) return "";
        if (json.charAt(vs) == '"') { int ve = json.indexOf('"', vs+1); return ve < 0 ? "" : json.substring(vs+1, ve); }
        else { int ve = vs; while (ve < json.length() && json.charAt(ve) != ',' && json.charAt(ve) != '}') ve++; return json.substring(vs, ve).trim(); }
    }
    static int parseInt(String s, int fallback) { try { return Integer.parseInt(s.trim()); } catch (Exception e) { return fallback; } }
    static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");
    }
    static void log(String tag, String msg) {
        System.out.printf("[%s] %-8s %s%n", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")), tag, msg);
    }
    static void printBanner() {
        System.out.println("\n  ╔══════════════════════════════════════════════════╗");
        System.out.println("  ║     AI Personalized Learning — Backend v4.0     ║");
        System.out.println("  ╠══════════════════════════════════════════════════╣");
        System.out.printf ("  ║  🌐  http://%s:%d%n", HOST, PORT);
        System.out.println("  ╚══════════════════════════════════════════════════╝\n");
    }
}
