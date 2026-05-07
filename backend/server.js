require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoute");
const sessionRoutes = require("./routes/sessionRoute");
const questionRoutes = require("./routes/questionRoute");

const { protect } = require("./middlewares/authMiddleware");

const {
  generateInterviewQuestions,
  generateConceptExplanation,
} = require("./controllers/aiControllers");

const app = express();

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://inter-prep-lmpz.vercel.app/",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options(/.*/, cors());

/* -------------------- Middleware -------------------- */
app.use(express.json());

/* -------------------- Database -------------------- */
connectDB();

/* -------------------- Routes -------------------- */
app.use("/api/auth", authRoutes);

app.use("/api/sessions", protect, sessionRoutes);

app.use("/api/questions", protect, questionRoutes);

app.post(
  "/api/ai/generate-questions",
  protect,
  generateInterviewQuestions
);

app.post(
  "/api/ai/generate-explanation",
  protect,
  generateConceptExplanation
);

/* -------------------- Static Uploads -------------------- */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* -------------------- Start Server -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});