const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Developer } = require("../models");
const developerController = require("../controllers/developer.controller");
const { SchoolInfo, CertificationInfo, WorkInfo, SkillInfo, DeveloperSkillInfo } = require("../models");

// 프로필 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 절대 경로로 업로드 디렉토리 설정
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 파일 확장자 추출
    const ext = path.extname(file.originalname);
    // 파일명에 타임스탬프 추가
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('잘못된 파일 형식입니다. (JPEG, PNG, GIF만 허용)');
      error.code = 'INCORRECT_FILETYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

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

// 프로필 이미지 업로드
router.post("/:id/profile-image", upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "이미지 파일이 필요합니다." });
    }

    const developerId = req.params.id;
    // 상대 경로로 이미지 URL 설정
    const imageUrl = `/uploads/profiles/${path.basename(req.file.path)}`;

    const [updatedCount] = await Developer.update(
      { developer_profile_image: imageUrl },
      { where: { developer_id: developerId } }
    );

    if (updatedCount === 0) {
      // 파일 삭제
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    res.json({ 
      message: "프로필 이미지가 업로드되었습니다.",
      imageUrl: imageUrl
    });
  } catch (error) {
    // 에러 발생 시 업로드된 파일 삭제
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('프로필 이미지 업로드 중 오류:', error);
    res.status(500).json({ message: "프로필 이미지 업로드 중 오류가 발생했습니다." });
  }
});

// 개발자 학력 정보 조회
router.get("/:id/schools", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: schools } = await SchoolInfo.findAndCountAll({
      where: { developer_id: req.params.id },
      order: [['school_graduation_ym', 'DESC']],
      limit,
      offset
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      schools
    });
  } catch (error) {
    console.error('개발자 학력 정보 조회 중 오류:', error);
    res.status(500).json({ message: "개발자 학력 정보 조회 중 오류가 발생했습니다." });
  }
});

// 개발자 학력 정보 등록
router.post("/:id/schools", async (req, res) => {
  try {
    const { school_graduation_ym, school_name, school_major } = req.body;
    
    // 필수 필드 검증
    if (!school_graduation_ym || !school_name) {
      return res.status(400).json({ message: "졸업년월과 학교명은 필수입니다." });
    }

    // 기존 학력 정보가 있는지 확인
    const existingSchool = await SchoolInfo.findOne({
      where: { 
        developer_id: req.params.id,
        school_graduation_ym: school_graduation_ym
      }
    });

    if (existingSchool) {
      return res.status(400).json({ message: "해당 졸업년월의 학력 정보가 이미 존재합니다." });
    }

    // 새 학력 정보 생성
    const school = await SchoolInfo.create({
      developer_id: req.params.id,
      school_graduation_ym,
      school_name,
      school_major
    });

    res.status(201).json(school);
  } catch (error) {
    console.error('개발자 학력 정보 등록 중 오류:', error);
    res.status(500).json({ message: "개발자 학력 정보 등록 중 오류가 발생했습니다." });
  }
});

// 개발자 학력 정보 수정
router.put("/:id/schools/:graduation_ym", async (req, res) => {
  try {
    const { school_name, school_major } = req.body;
    
    // 필수 필드 검증
    if (!school_name) {
      return res.status(400).json({ message: "학교명은 필수입니다." });
    }

    // 기존 학력 정보 찾기
    const existingSchool = await SchoolInfo.findOne({
      where: { 
        developer_id: req.params.id,
        school_graduation_ym: req.params.graduation_ym
      }
    });

    if (!existingSchool) {
      return res.status(404).json({ message: "학력 정보를 찾을 수 없습니다." });
    }

    // 학력 정보 업데이트
    const [updated] = await SchoolInfo.update({
      school_name,
      school_major
    }, {
      where: {
        developer_id: req.params.id,
        school_graduation_ym: req.params.graduation_ym
      }
    });

    if (updated) {
      const updatedSchool = await SchoolInfo.findOne({
        where: { 
          developer_id: req.params.id,
          school_graduation_ym: req.params.graduation_ym
        }
      });
      res.json(updatedSchool);
    } else {
      res.status(404).json({ message: "학력 정보를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('개발자 학력 정보 수정 중 오류:', error);
    res.status(500).json({ message: "개발자 학력 정보 수정 중 오류가 발생했습니다." });
  }
});

// 개발자 학력 정보 삭제
router.delete("/:id/schools", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 학력을 지정해주세요." });
    }

    const result = await SchoolInfo.destroy({
      where: {
        developer_id: req.params.id,
        school_graduation_ym: ids
      }
    });

    if (result > 0) {
      res.json({ message: `${result}개의 학력 정보가 삭제되었습니다.` });
    } else {
      res.status(404).json({ message: "삭제할 학력 정보를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('개발자 학력 정보 삭제 중 오류:', error);
    res.status(500).json({ message: "개발자 학력 정보 삭제 중 오류가 발생했습니다." });
  }
});

// 개발자 자격증 정보 조회
router.get("/:id/certifications", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: certifications } = await CertificationInfo.findAndCountAll({
      where: { developer_id: req.params.id },
      order: [['certification_date', 'DESC']],
      limit,
      offset
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      certifications
    });
  } catch (error) {
    console.error('개발자 자격증 정보 조회 중 오류:', error);
    res.status(500).json({ message: "개발자 자격증 정보 조회 중 오류가 발생했습니다." });
  }
});

// 개발자 자격증 정보 등록
router.post("/:id/certifications", async (req, res) => {
  try {
    const { certification_date, certification_name, certification_agency } = req.body;
    
    // 필수 필드 검증
    if (!certification_date || !certification_name) {
      return res.status(400).json({ message: "취득일자와 자격증명은 필수입니다." });
    }

    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(certification_date)) {
      return res.status(400).json({ message: "취득일자는 YYYY-MM-DD 형식이어야 합니다." });
    }

    // 기존 자격증 정보가 있는지 확인
    const existingCertification = await CertificationInfo.findOne({
      where: { 
        developer_id: req.params.id,
        certification_date
      }
    });

    if (existingCertification) {
      return res.status(400).json({ message: "해당 취득일자의 자격증 정보가 이미 존재합니다." });
    }

    // 새 자격증 정보 생성
    const certification = await CertificationInfo.create({
      developer_id: req.params.id,
      certification_date,
      certification_name,
      certification_agency
    });

    res.status(201).json(certification);
  } catch (error) {
    console.error('자격증 정보 등록 중 오류:', error);
    res.status(500).json({ message: "자격증 정보 등록 중 오류가 발생했습니다." });
  }
});

// 개발자 자격증 정보 수정
router.put("/:id/certifications/:certificationDate", async (req, res) => {
  try {
    const { certification_date, certification_name, certification_agency } = req.body;
    
    // certification_date가 전달된 경우 에러 반환
    if (certification_date) {
      return res.status(400).json({ message: "취득일자는 수정할 수 없습니다." });
    }

    // 필수 필드 검증
    if (!certification_name) {
      return res.status(400).json({ message: "자격증명은 필수입니다." });
    }

    // 자격증 정보 수정
    const [updated] = await CertificationInfo.update(
      {
        certification_name,
        certification_agency
      },
      {
        where: { 
          developer_id: req.params.id,
          certification_date: req.params.certificationDate
        }
      }
    );

    if (updated) {
      const updatedCertification = await CertificationInfo.findOne({
        where: { 
          developer_id: req.params.id,
          certification_date: req.params.certificationDate
        }
      });
      res.json(updatedCertification);
    } else {
      res.status(404).json({ message: "자격증 정보를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('자격증 정보 수정 중 오류:', error);
    res.status(500).json({ message: "자격증 정보 수정 중 오류가 발생했습니다." });
  }
});

// 개발자 자격증 정보 삭제
router.delete("/:id/certifications", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 자격증 정보를 선택해주세요." });
    }

    await CertificationInfo.destroy({
      where: { 
        developer_id: req.params.id,
        certification_date: ids
      }
    });

    res.json({ message: "자격증 정보가 삭제되었습니다." });
  } catch (error) {
    console.error('자격증 정보 삭제 중 오류:', error);
    res.status(500).json({ message: "자격증 정보 삭제 중 오류가 발생했습니다." });
  }
});

// 개발자 근무 이력 조회
router.get("/:id/works", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: works } = await WorkInfo.findAndCountAll({
      where: { developer_id: req.params.id },
      order: [['work_start_ym', 'DESC']],
      limit,
      offset
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      works
    });
  } catch (error) {
    console.error('개발자 근무 이력 조회 중 오류:', error);
    res.status(500).json({ message: "개발자 근무 이력 조회 중 오류가 발생했습니다." });
  }
});

// 개발자 근무 이력 등록
router.post("/:id/works", async (req, res) => {
  try {
    const { work_start_ym, work_end_ym, work_name, work_position, work_task } = req.body;
    
    // 필수 필드 검증
    if (!work_start_ym || !work_name || !work_position) {
      return res.status(400).json({ message: "근무 시작일, 회사명, 직책은 필수입니다." });
    }

    // 날짜 형식 검증 (YYYYMM)
    const dateRegex = /^\d{6}$/;
    if (!dateRegex.test(work_start_ym)) {
      return res.status(400).json({ message: "근무 시작일은 YYYYMM 형식이어야 합니다." });
    }
    if (work_end_ym && !dateRegex.test(work_end_ym)) {
      return res.status(400).json({ message: "근무 종료일은 YYYYMM 형식이어야 합니다." });
    }

    // 시작일이 종료일보다 늦은지 검증
    if (work_end_ym && work_start_ym > work_end_ym) {
      return res.status(400).json({ message: "근무 시작일은 종료일보다 늦을 수 없습니다." });
    }

    // 새 근무 이력 생성
    const work = await WorkInfo.create({
      developer_id: req.params.id,
      work_start_ym,
      work_end_ym,
      work_name,
      work_position,
      work_task
    });

    res.status(201).json(work);
  } catch (error) {
    console.error('개발자 근무 이력 등록 중 오류:', error);
    res.status(500).json({ message: "개발자 근무 이력 등록 중 오류가 발생했습니다." });
  }
});

// 개발자 근무 이력 수정
router.put("/:id/works/:start_ym", async (req, res) => {
  try {
    const { work_end_ym, work_name, work_position, work_task } = req.body;
    
    // 필수 필드 검증
    if (!work_name || !work_position) {
      return res.status(400).json({ message: "회사명과 직책은 필수입니다." });
    }

    // 날짜 형식 검증 (YYYYMM)
    if (work_end_ym) {
      const dateRegex = /^\d{6}$/;
      if (!dateRegex.test(work_end_ym)) {
        return res.status(400).json({ message: "근무 종료년월은 YYYYMM 형식이어야 합니다." });
      }
      if (req.params.start_ym > work_end_ym) {
        return res.status(400).json({ message: "근무 시작년월은 종료년월보다 늦을 수 없습니다." });
      }
    }

    // 근무 이력 수정
    const [updated] = await WorkInfo.update(
      {
        work_end_ym,
        work_name,
        work_position,
        work_task
      },
      {
        where: {
          developer_id: req.params.id,
          work_start_ym: req.params.start_ym
        }
      }
    );

    if (updated) {
      const updatedWork = await WorkInfo.findOne({
        where: {
          developer_id: req.params.id,
          work_start_ym: req.params.start_ym
        }
      });
      res.json(updatedWork);
    } else {
      res.status(404).json({ message: "근무 이력을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('개발자 근무 이력 수정 중 오류:', error);
    res.status(500).json({ message: "개발자 근무 이력 수정 중 오류가 발생했습니다." });
  }
});

// 개발자 근무 이력 삭제
router.delete("/:id/works", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 근무 이력을 선택해주세요." });
    }

    await WorkInfo.destroy({
      where: {
        developer_id: req.params.id,
        work_start_ym: ids
      }
    });

    res.json({ message: "근무 이력이 삭제되었습니다." });
  } catch (error) {
    console.error('개발자 근무 이력 삭제 중 오류:', error);
    res.status(500).json({ message: "개발자 근무 이력 삭제 중 오류가 발생했습니다." });
  }
});

// 개발자 기술 이력 조회
router.get("/:id/skills", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const developerId = parseInt(req.params.id);

    if (isNaN(developerId)) {
      return res.status(400).json({ message: "유효하지 않은 개발자 ID입니다." });
    }

    const { count, rows: skills } = await DeveloperSkillInfo.findAndCountAll({
      where: { developer_id: developerId },
      order: [['project_start_ym', 'DESC']],
      limit,
      offset
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      skills
    });
  } catch (error) {
    console.error('개발자 기술 이력 조회 중 오류:', error);
    res.status(500).json({ message: "개발자 기술 이력 조회 중 오류가 발생했습니다." });
  }
});

// 개발자 기술 이력 등록
router.post("/:id/skills", async (req, res) => {
  try {
    const developerId = parseInt(req.params.id);
    const {
      project_start_ym,
      project_end_ym,
      project_name,
      project_practitioner_id,
      project_client_id,
      task,
      project_skill_model,
      project_skill_os,
      project_skill_language,
      project_skill_dbms,
      project_skill_tool,
      project_skill_protocol,
      project_skill_etc
    } = req.body;

    // 필수 필드 검증
    if (!project_start_ym || !project_name) {
      return res.status(400).json({ message: "프로젝트 시작년월과 프로젝트명은 필수입니다." });
    }

    // 날짜 형식 검증 (YYYYMM)
    const dateRegex = /^\d{6}$/;
    if (!dateRegex.test(project_start_ym)) {
      return res.status(400).json({ message: "프로젝트 시작년월은 YYYYMM 형식이어야 합니다." });
    }
    if (project_end_ym && !dateRegex.test(project_end_ym)) {
      return res.status(400).json({ message: "프로젝트 종료년월은 YYYYMM 형식이어야 합니다." });
    }

    // 시작일이 종료일보다 늦은지 검증
    if (project_end_ym && project_start_ym > project_end_ym) {
      return res.status(400).json({ message: "프로젝트 시작년월은 종료년월보다 늦을 수 없습니다." });
    }

    // 기존 기술 이력이 있는지 확인
    const existingSkill = await DeveloperSkillInfo.findOne({
      where: {
        developer_id: developerId,
        project_start_ym
      }
    });

    if (existingSkill) {
      return res.status(400).json({ message: "해당 시작년월의 기술 이력이 이미 존재합니다." });
    }

    // 새 기술 이력 생성
    const skill = await DeveloperSkillInfo.create({
      developer_id: developerId,
      project_start_ym,
      project_end_ym,
      project_name,
      project_practitioner_id,
      project_client_id,
      task,
      project_skill_model,
      project_skill_os,
      project_skill_language,
      project_skill_dbms,
      project_skill_tool,
      project_skill_protocol,
      project_skill_etc
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error('개발자 기술 이력 등록 중 오류:', error);
    res.status(500).json({ message: "개발자 기술 이력 등록 중 오류가 발생했습니다." });
  }
});

// 개발자 기술 이력 수정
router.put("/:id/skills/:start_ym", async (req, res) => {
  try {
    const developerId = parseInt(req.params.id);
    const projectStartYm = req.params.start_ym;
    const {
      project_end_ym,
      project_name,
      project_practitioner_id,
      project_client_id,
      task,
      project_skill_model,
      project_skill_os,
      project_skill_language,
      project_skill_dbms,
      project_skill_tool,
      project_skill_protocol,
      project_skill_etc
    } = req.body;

    // 필수 필드 검증
    if (!project_name) {
      return res.status(400).json({ message: "프로젝트명은 필수입니다." });
    }

    // 날짜 형식 검증 (YYYYMM)
    if (project_end_ym) {
      const dateRegex = /^\d{6}$/;
      if (!dateRegex.test(project_end_ym)) {
        return res.status(400).json({ message: "프로젝트 종료년월은 YYYYMM 형식이어야 합니다." });
      }
      if (projectStartYm > project_end_ym) {
        return res.status(400).json({ message: "프로젝트 시작년월은 종료년월보다 늦을 수 없습니다." });
      }
    }

    // 기존 기술 이력 찾기
    const existingSkill = await DeveloperSkillInfo.findOne({
      where: {
        developer_id: developerId,
        project_start_ym: projectStartYm
      }
    });

    if (!existingSkill) {
      return res.status(404).json({ message: "기술 이력을 찾을 수 없습니다." });
    }

    // 기술 이력 수정
    const [updated] = await DeveloperSkillInfo.update(
      {
        project_end_ym,
        project_name,
        project_practitioner_id,
        project_client_id,
        task,
        project_skill_model,
        project_skill_os,
        project_skill_language,
        project_skill_dbms,
        project_skill_tool,
        project_skill_protocol,
        project_skill_etc
      },
      {
        where: {
          developer_id: developerId,
          project_start_ym: projectStartYm
        }
      }
    );

    if (updated) {
      const updatedSkill = await DeveloperSkillInfo.findOne({
        where: {
          developer_id: developerId,
          project_start_ym: projectStartYm
        }
      });
      res.json(updatedSkill);
    } else {
      res.status(404).json({ message: "기술 이력을 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error('개발자 기술 이력 수정 중 오류:', error);
    res.status(500).json({ message: "개발자 기술 이력 수정 중 오류가 발생했습니다." });
  }
});

module.exports = router;
