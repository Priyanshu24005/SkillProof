const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/assessment", require("./routes/assessment.routes"));
app.use("/api/challenge", require("./routes/challenge.routes"));
app.use("/api/github", require("./routes/github.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/passport", require("./routes/passport.routes"));
app.use("/api/recruiter", require("./routes/recruiter.routes"));
app.use("/api/leaderboard", require("./routes/leaderboard.routes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
