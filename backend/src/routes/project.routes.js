const express = require("express");
const router = express.Router();
const projectController = require('../controllers/project.controller');

// 모든 요청에 대한 로깅 미들웨어
router.use((req, res, next) => {
  console.log('Project Routes - 요청 발생:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// 프로젝트 목록 조회
router.get("/", projectController.getProjects);

// 개발자 검색 (구체적인 경로를 먼저 배치)
router.get("/developers", projectController.searchDevelopers);

// 프로젝트 상세 조회
router.get("/:id", projectController.getProjectById);

// 프로젝트 생성
router.post("/", projectController.createProject);

// 프로젝트 수정
router.put("/:id", projectController.updateProject);

// 프로젝트 삭제
router.delete("/:id", projectController.deleteProject);

// 프로젝트 개발자 배정
router.post("/:id/assignments", projectController.assignDeveloper);

// 프로젝트 개발자 목록 조회
router.get("/:id/developers", projectController.getProjectDevelopers);

module.exports = router;
