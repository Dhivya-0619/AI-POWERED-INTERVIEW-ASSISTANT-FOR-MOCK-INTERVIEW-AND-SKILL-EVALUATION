// Mock Data Store for AI Interview Assistant Prototype

export const MOCK_USER = {
  id: "usr_101",
  name: "Kavya Sharma",
  email: "kavya.sharma@example.com",
  role: "Full Stack Developer",
  education: "B.Tech in Computer Science (2024)",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  targetRole: "Full Stack Developer",
  skills: ["Java", "React.js", "Python", "Node.js", "SQL", "Data Structures"],
  notificationsEnabled: true
};

export const MOCK_STATS = {
  totalInterviews: 14,
  avgScore: 84,
  currentSkillLevel: "Intermediate Plus",
  practiceHours: 18.5,
  improvementRate: "+12% this month"
};

export const MOCK_PERFORMANCE_HISTORY = [
  { date: "May 1", score: 65, technical: 60, communication: 70, problemSolving: 65 },
  { date: "May 8", score: 72, technical: 70, communication: 75, problemSolving: 70 },
  { date: "May 15", score: 78, technical: 75, communication: 80, problemSolving: 78 },
  { date: "May 22", score: 81, technical: 82, communication: 84, problemSolving: 79 },
  { date: "Jun 1", score: 85, technical: 88, communication: 86, problemSolving: 82 },
  { date: "Jun 10", score: 88, technical: 90, communication: 89, problemSolving: 85 }
];

export const MOCK_SKILL_SUMMARY = [
  { skill: "Technical Knowledge", score: 88, level: "Advanced", icon: "Code" },
  { skill: "Communication & Delivery", score: 84, level: "Proficient", icon: "MessageSquare" },
  { skill: "Problem Solving", score: 82, level: "Proficient", icon: "Brain" },
  { skill: "Confidence & Clarity", score: 86, level: "High", icon: "Zap" }
];

export const MOCK_INTERVIEW_SESSIONS = [
  {
    id: "int_01",
    title: "Java Full Stack Mock Interview",
    type: "Technical",
    role: "Full Stack Developer",
    date: "2026-06-10",
    questionsCount: 5,
    score: 88,
    duration: "18 mins",
    status: "Completed"
  },
  {
    id: "int_02",
    title: "HR & Behavioral Assessment",
    type: "HR",
    role: "Software Engineer",
    date: "2026-06-05",
    questionsCount: 5,
    score: 84,
    duration: "15 mins",
    status: "Completed"
  },
  {
    id: "int_03",
    title: "System Design & Problem Solving",
    type: "Behavioral",
    role: "Backend Engineer",
    date: "2026-05-28",
    questionsCount: 10,
    score: 79,
    duration: "30 mins",
    status: "Completed"
  },
  {
    id: "int_04",
    title: "Frontend Core React & JS",
    type: "Technical",
    role: "Frontend Developer",
    date: "2026-05-20",
    questionsCount: 5,
    score: 82,
    duration: "20 mins",
    status: "Completed"
  }
];

export const MOCK_RESUME_PARSED_DATA = {
  fileName: "Kavya_Sharma_Resume_2026.pdf",
  fileSize: "1.4 MB",
  uploadedAt: "Just now",
  detectedSkills: [
    "Java", "Spring Boot", "React.js", "JavaScript (ES6+)",
    "RESTful APIs", "PostgreSQL", "Git", "Docker", "Data Structures & Algorithms"
  ],
  education: [
    { degree: "B.Tech Computer Science & Engineering", institution: "Apex Institute of Technology", year: "2022 - 2026", gpa: "8.8/10" }
  ],
  experience: [
    { role: "Software Developer Intern", company: "TechNova Solutions", duration: "6 Months", details: "Built REST APIs in Spring Boot and React user interface components." }
  ],
  projects: [
    { name: "AI Interview Assistant", tech: "React, Python, NLP", description: "Mock interview platform with automated skill feedback." },
    { name: "E-Commerce Cloud Engine", tech: "Java Spring, Microservices, SQL", description: "Scalable backend order processing pipeline." }
  ],
  suggestedImprovements: [
    "Highlight quantifiable achievements (e.g. % performance increase) in project descriptions.",
    "Add certification credentials for Cloud Services (AWS / Azure) if applicable.",
    "Elaborate on unit testing frameworks used (JUnit, Jest)."
  ]
};

export const MOCK_QUESTION_BANK = {
  Technical: [
    {
      id: "q1",
      question: "Explain the Virtual DOM in React and how the reconciliation process works.",
      category: "Technical",
      expectedKeywords: ["Virtual DOM", "Reconciliation", "Diffing Algorithm", "State changes", "Real DOM batch updates"],
      idealAnswer: "The Virtual DOM is a lightweight JavaScript representation of the real DOM. When state changes occur in a component, React creates a new Virtual DOM tree and compares it with the previous tree using a heuristic diffing algorithm (reconciliation). It calculates the minimal set of changes needed and updates the actual DOM in a single batch, improving rendering performance."
    },
    {
      id: "q2",
      question: "What is the difference between process and thread in operating systems?",
      category: "Technical",
      expectedKeywords: ["Memory space", "Execution unit", "Context switching", "Overhead", "Shared resources"],
      idealAnswer: "A process is an independent program in execution with its own dedicated memory space, whereas a thread is the smallest segment of execution within a process that shares memory and resources with sibling threads. Context switching between threads is faster than between processes because memory maps do not need updating."
    },
    {
      id: "q3",
      question: "How does HashMap work internally in Java? How are collisions handled?",
      category: "Technical",
      expectedKeywords: ["Hashing", "Key-Value", "Bucket index", "LinkedList", "TreeNode / Red-Black Tree", "hashCode() & equals()"],
      idealAnswer: "Java HashMap uses an array of buckets. When a key is inserted, its hashCode() is computed to determine the bucket index. If multiple keys hash to the same bucket index (collision), Java historically chained elements using a LinkedList. In Java 8+, if bucket size exceeds 8 elements, the LinkedList converts to a balanced Red-Black Tree to optimize lookup complexity from O(n) to O(log n)."
    },
    {
      id: "q4",
      question: "Explain RESTful API design principles and common HTTP status codes.",
      category: "Technical",
      expectedKeywords: ["Stateless", "Client-Server", "HTTP Methods (GET, POST, PUT, DELETE)", "200 OK", "404 Not Found", "500 Internal Error"],
      idealAnswer: "REST (Representational State Transfer) relies on stateless client-server communication using standard HTTP verbs. GET retrieves resource data, POST creates resources, PUT updates completely, and DELETE removes resources. Common status codes include 200 (Success), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), and 500 (Server Error)."
    },
    {
      id: "q5",
      question: "What are SQL joins, and how does an INNER JOIN differ from a LEFT OUTER JOIN?",
      category: "Technical",
      expectedKeywords: ["Relational data", "INNER JOIN", "LEFT JOIN", "Matching records", "NULL values"],
      idealAnswer: "SQL joins combine columns from two or more tables based on a related attribute. INNER JOIN returns only records where matching keys exist in both tables. LEFT OUTER JOIN returns all records from the left table alongside matching records from the right table; if no match exists, NULL values fill the right columns."
    }
  ],
  HR: [
    {
      id: "hr1",
      question: "Tell me about yourself and why you are interested in this position.",
      category: "HR",
      expectedKeywords: ["Background", "Key skills", "Project experience", "Company alignment", "Career aspirations"],
      idealAnswer: "I am a Computer Science graduate with hands-on project experience in full-stack Java and React development. During my internship at TechNova Solutions, I delivered REST microservices and responsive web pages. I am eager to join your team because your company's emphasis on scalable cloud architectures aligns directly with my technical background and passion for problem solving."
    },
    {
      id: "hr2",
      question: "What are your greatest strengths and one area you are actively working to improve?",
      category: "HR",
      expectedKeywords: ["Self-awareness", "Problem-solving", "Collaboration", "Constructive growth", "Actionable steps"],
      idealAnswer: "My key strengths are systematic problem solving and adaptability when learning new tech stacks quickly. An area I am actively refining is delegation and time management when multitasking across complex deadlines. I now use structured task tracking tools to break down milestones effectively."
    },
    {
      id: "hr3",
      question: "Where do you see yourself professionally in the next three to five years?",
      category: "HR",
      expectedKeywords: ["Skill mastery", "Technical leadership", "Mentorship", "Continuous learning", "Impact"],
      idealAnswer: "Over the next three to five years, I aim to master core system architecture principles and progress into a Senior Full Stack Engineer role. I want to take ownership of end-to-end technical modules while mentoring junior developers and driving best development practices."
    }
  ],
  Behavioral: [
    {
      id: "b1",
      question: "Describe a situation where you faced a major technical challenge during a project. How did you resolve it?",
      category: "Behavioral",
      expectedKeywords: ["STAR method", "Situation", "Task", "Action", "Result", "Technical resolution"],
      idealAnswer: "During my final year project, our React app experienced severe lag when processing large data tables. As lead frontend developer (Situation/Task), I profiled memory usage, identified unneeded re-renders, implemented React.memo and pagination (Action). This reduced initial render latency by 65% and created a smooth user experience (Result)."
    },
    {
      id: "b2",
      question: "How do you handle feedback or criticism on code reviews from senior team members?",
      category: "Behavioral",
      expectedKeywords: ["Growth mindset", "Constructive feedback", "Code quality", "Collaboration", "Learning opportunity"],
      idealAnswer: "I treat code reviews as valuable learning opportunities to enhance software quality. I evaluate suggestions objectively, ask clarifying questions when needed, implement the recommended fixes, and document learnings for future sprint cycles."
    }
  ]
};

export const MOCK_EVALUATION_SAMPLE = {
  sessionId: "session_2026_demo",
  overallScore: 86,
  role: "Full Stack Developer",
  interviewType: "Technical & Behavioral",
  date: "Just now",
  breakdown: {
    technicalKnowledge: 88,
    communication: 85,
    problemSolving: 84,
    answerRelevance: 89,
    confidence: 84
  },
  strengths: [
    "Strong conceptual foundation in React reconciliation and Virtual DOM principles.",
    "Clear structure in responses with effective technical vocabulary.",
    "Accurate articulation of database joins and REST API status codes."
  ],
  improvements: [
    "Incorporate concrete quantitative metrics when explaining past project impact.",
    "Elaborate further on concurrency and multi-threading nuances in system design questions."
  ],
  questionFeedback: [
    {
      questionNumber: 1,
      question: "Explain the Virtual DOM in React and how the reconciliation process works.",
      userAnswer: "The Virtual DOM is a lightweight copy of the actual DOM stored in memory. When state updates occur, React compares the old virtual DOM with the new one using diffing and updates only changed elements in the real DOM.",
      score: 90,
      feedback: "Excellent answer covering key points. Mentioning 'heuristic diffing algorithm' explicitly adds extra polish.",
      idealAnswer: "The Virtual DOM is an in-memory representation of real DOM elements. React uses reconciliation with a diffing algorithm to compute minimal DOM updates, optimizing performance."
    },
    {
      questionNumber: 2,
      question: "What is the difference between process and thread in operating systems?",
      userAnswer: "A process is a program running with its own memory space. A thread is part of a process that shares memory with other threads in the same process.",
      score: 84,
      feedback: "Good concise explanation. You could mention context switching overhead differences between processes vs threads for higher impact.",
      idealAnswer: "Processes are isolated memory environments; threads exist within a process sharing memory. Thread context switching is significantly lighter and faster."
    }
  ],
  recommendations: [
    "Practice system design mock scenarios focusing on microservice scaling.",
    "Review Java 8+ Stream API and Multithreading concurrency utilities.",
    "Schedule an HR mock interview to refine non-technical behavioral stories."
  ]
};
