const express = require("express");
const router = express.Router();

// 공통 코드 목록 조회
router.get("/", (req, res) => {
  res.status(200).json([
    {
      id: 1,
      category: "language",
      name: "Java",
      description: "Java 프로그래밍 언어",
    },
    { id: 2, category: "system", name: "Linux", description: "Linux 운영체제" },
    { id: 3, category: "company", name: "회사A", description: "협력 업체" },
  ]);
});

// 공통 코드 카테고리별 조회
router.get("/:category", (req, res) => {
  res
    .status(200)
    .json([{ id: 1, name: "Java", description: "Java 프로그래밍 언어" }]);
});

// 공통 코드 추가
router.post("/", (req, res) => {
  res.status(201).json({ message: "공통 코드 추가 성공" });
});

// 공통 코드 수정
router.put("/:id", (req, res) => {
  res.status(200).json({ message: "공통 코드 수정 성공" });
});

// 공통 코드 삭제
router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "공통 코드 삭제 성공" });
});

module.exports = router;
