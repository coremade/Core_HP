const express = require("express");
const router = express.Router();

// 기술 스택 목록 조회
router.get("/", (req, res) => {
  res.status(200).json([
    { id: 1, name: "JavaScript", category: "language" },
    { id: 2, name: "React", category: "framework" },
    { id: 3, name: "Node.js", category: "platform" },
  ]);
});

// 기술 스택 검색
router.get("/search", (req, res) => {
  const { query } = req.query;
  res.status(200).json([{ id: 1, name: "JavaScript", category: "language" }]);
});

// 기술 스택 추가
router.post("/", (req, res) => {
  res.status(201).json({ message: "기술 스택 추가 성공" });
});

module.exports = router;
