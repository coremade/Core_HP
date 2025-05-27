const express = require("express");
const router = express.Router();

// 이력서 업로드
router.post("/upload", (req, res) => {
  res.status(200).json({ message: "이력서 업로드 성공" });
});

// 이력서 파싱 상태 조회
router.get("/status/:id", (req, res) => {
  res.status(200).json({ status: "processing", progress: 50 });
});

// 이력서 공유 링크 생성
router.post("/share/:id", (req, res) => {
  res
    .status(200)
    .json({ shareLink: `http://localhost:4000/resume/share/${req.params.id}` });
});

// 이력서 파일 조회
router.get("/file/:id", (req, res) => {
  res.status(200).json({
    fileUrl: `http://localhost:4000/resume/download/${req.params.id}`,
  });
});

module.exports = router;
