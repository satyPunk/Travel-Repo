import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "SATY",
  port: 3000, // Correct PostgreSQL default port
});
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let quiz = [];
let currentQuestion = {};
let totalCorrect = 0;

// Load quiz data from the database
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.log("Error executing query", err.stack);
  } else {
    quiz = res.rows; // Fix: `res.rows` contains the data
  }
});

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion, wasCorrect: null, totalScore: totalCorrect });
});

// POST a new answer
app.post("/submit", async (req, res) => {
  const answer = req.body.answer.trim();
  let isCorrect = false;

  // Check if the answer is correct
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Select the next question
async function nextQuestion() {
  if (quiz.length > 0) {
    const randomIndex = Math.floor(Math.random() * quiz.length);
    currentQuestion = quiz[randomIndex];
  } else {
    currentQuestion = { country: "No data available", capital: "" };
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
