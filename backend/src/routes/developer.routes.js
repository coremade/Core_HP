const express = require("express");
const router = express.Router();
const developerController = require("../controllers/developer.controller");

// 개발자 목록 조회
router.get("/", developerController.getAllDevelopers);

// 개발자 등록 폼 템플릿
router.get("/new", (req, res) => {
  res.status(200).json({
    template: {
      name: "",
      email: "",
      position: "",
      skills: [],
      experience_years: 0,
      education: "",
      github_url: "",
      blog_url: "",
      portfolio_url: "",
      project_count: 0,
    },
  });
});

// 개발자 생성
router.post("/", developerController.createDeveloper);

// 개발자 상세 정보 조회
router.get("/:id", developerController.getDeveloperById);

// 개발자 정보 수정
router.put("/:id", developerController.updateDeveloper);

// 개발자 삭제 (단일 또는 다중)
router.delete("/", developerController.deleteDevelopers);

module.exports = router;
