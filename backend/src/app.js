require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./models");
const developerRoutes = require("./routes/developer.routes");
const resumeRoutes = require("./routes/resume.routes");
const skillRoutes = require("./routes/skill.routes");
const projectRoutes = require("./routes/project.routes");
const codeRoutes = require("./routes/code.routes");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.7:3000'],
  credentials: true
}));

// 미들웨어 설정
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// 라우트 설정
app.get("/", (req, res) => {
  res.json({
    message: "개발자 관리 시스템 API",
    version: "1.0.0",
    endpoints: {
      developers: "/api/developers",
    },
  });
});

app.use("/api/developers", developerRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/common-codes", codeRoutes);


// 데이터베이스 연결 및 서버 시작
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    console.error("데이터베이스 연결 실패:", err);
  });

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "서버 에러가 발생했습니다.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
