const questions = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    correct: 0
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correct: 1
  },
  {
    question: "Inside which HTML element do we put JavaScript?",
    options: ["<js>", "<javascript>", "<script>"],
    correct: 2
  },
  {
    question: "Which is not a JavaScript data type?",
    options: ["String", "Number", "Float"],
    correct: 2
  },
  {
    question: "How do you write 'Hello World' in an alert box?",
    options: ["msg('Hello World')", "alert('Hello World')", "msgBox('Hello World')"],
    correct: 1
  }
];

let current = 0;
let score = 0;

const questionBox = document.getElementById("question");
const optionsBox = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");
const scoreText = document.getElementById("score-text");
const currentNum = document.getElementById("current");
const totalNum = document.getElementById("total");

totalNum.textContent = questions.length;

function loadQuestion() {
  const q = questions[current];
  currentNum.textContent = current + 1;
  questionBox.textContent = q.question;
  optionsBox.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.textContent = opt;
    div.onclick = () => selectOption(div, idx);
    optionsBox.appendChild(div);
  });
}

function selectOption(element, index) {
  const allOptions = document.querySelectorAll(".option");
  allOptions.forEach(opt => opt.classList.remove("selected"));
  element.classList.add("selected");
  if (index === questions[current].correct) {
    score++;
  }
}

nextBtn.onclick = () => {
  if (current < questions.length - 1) {
    current++;
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  document.querySelector(".progress").style.display = "none";
  document.getElementById("question").style.display = "none";
  optionsBox.style.display = "none";
  nextBtn.style.display = "none";
  resultBox.classList.remove("hidden");
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;
}

loadQuestion();
