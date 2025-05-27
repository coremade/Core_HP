const express = require("express");
const router = express.Router();

// 프로젝트 목록 조회
router.get("/", (req, res) => {
  res.status(200).json([
    {
      id: 1,
      name: "프로젝트 A",
      status: "진행중",
      startDate: "2024-03-01",
      endDate: "2024-06-30",
    },
  ]);
});

// 프로젝트 상세 조회
router.get("/:id", (req, res) => {
  res.status(200).json({
    id: 1,
    name: "프로젝트 A",
    status: "진행중",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    description: "프로젝트 상세 설명",
  });
});

// 프로젝트 생성
router.post("/", (req, res) => {
  res.status(201).json({ message: "프로젝트 생성 성공" });
});

// 프로젝트 수정
router.put("/:id", (req, res) => {
  res.status(200).json({ message: "프로젝트 수정 성공" });
});

// 프로젝트 삭제
router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "프로젝트 삭제 성공" });
});

// 프로젝트 개발자 배정
router.post("/:id/assignments", (req, res) => {
  res.status(200).json({ message: "개발자 배정 성공" });
});

// 프로젝트 개발자 목록 조회
router.get("/:id/developers", (req, res) => {
  res.status(200).json([{ id: 1, name: "홍길동", role: "백엔드 개발자" }]);
});

module.exports = router;
