// Developer routes file

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const { Developer } = require("../models");
const { SchoolInfo, CertificationInfo, WorkInfo, SkillInfo, DeveloperSkillInfo } = require("../models");
const { sequelize } = require("../models");

// 프로필 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
router.get("/", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * limit;
      
      // 검색 조건
      const { name, phone, genders, grades, skills, excludeSkills, skillsCondition, excludeSkillsCondition } = req.query;
      
      console.log('라우터에서 받은 검색 조건:', { name, phone, genders, grades, skills, excludeSkills, skillsCondition, excludeSkillsCondition });
      
      // 기본 검색 조건
      const whereCondition = {};
      if (name) {
        whereCondition.developer_name = { [Op.like]: `%${name}%` };
      }
      if (phone) {
        whereCondition.developer_phone = { [Op.like]: `%${phone}%` };
      }
      
      // 성별 검색 조건 (배열 형태, OR 조건)
      if (genders) {
        const genderArray = genders.split(',').filter(g => g.trim());
        if (genderArray.length > 0) {
          // 전체 성별 배열 정의
          const allGenders = ['M', 'F'];
          // 선택된 성별이 전체가 아닐 때만 조건 적용
          if (genderArray.length < allGenders.length) {
            whereCondition.developer_sex = { [Op.in]: genderArray };
            console.log('성별 검색 조건:', genderArray);
          }
        }
      }
      

      
      // 등급 검색 조건 (배열 형태, OR 조건)
      if (grades) {
        const gradeArray = grades.split(',').filter(g => g.trim());
        if (gradeArray.length > 0) {
          // 전체 등급 배열 정의
          const allGrades = ['초급', '중급', '고급', '특급'];
          // 선택된 등급이 전체가 아닐 때만 조건 적용
          if (gradeArray.length < allGrades.length) {
            whereCondition.developer_grade = { [Op.in]: gradeArray };
            console.log('등급 검색 조건:', gradeArray);
          }
        }
      }

      // 제외 기술 검색 조건 - 해당 기술을 가지지 않은 개발자 찾기
      if (excludeSkills) {
        // 콤마로 구분된 제외 기술들을 배열로 분리 (공백 완전 제거)
        const excludeSkillsArray = excludeSkills
          .split(',')
          .map(skill => skill.trim().replace(/\s+/g, ' ')) // 연속된 공백을 하나로 변환
          .filter(skill => skill && skill.length > 0);
        
        console.log('제외 기술 배열:', excludeSkillsArray);
        
        if (excludeSkillsArray.length > 0) {
          // 각 기술에 대한 OR 조건 생성
          const excludeSkillConditions = excludeSkillsArray.map(skill => ({
            [Op.or]: [
              { project_name: { [Op.like]: `%${skill}%` } },
              { task: { [Op.like]: `%${skill}%` } },
              { project_skill_model: { [Op.like]: `%${skill}%` } },
              { project_skill_os: { [Op.like]: `%${skill}%` } },
              { project_skill_language: { [Op.like]: `%${skill}%` } },
              { project_skill_dbms: { [Op.like]: `%${skill}%` } },
              { project_skill_tool: { [Op.like]: `%${skill}%` } },
              { project_skill_protocol: { [Op.like]: `%${skill}%` } },
              { project_skill_etc: { [Op.like]: `%${skill}%` } }
            ]
          }));

          // excludeSkillsCondition에 따라 AND/OR 결정 (기본값: OR)
          const excludeSearchCondition = excludeSkillsCondition === 'AND' ? Op.and : Op.or;
          
          const excludeSkillDeveloperIds = await DeveloperSkillInfo.findAll({
            where: {
              [excludeSearchCondition]: excludeSkillConditions
            },
            attributes: ['developer_id'],
            raw: true
          });
          
          const excludeIds = excludeSkillDeveloperIds.map(item => item.developer_id);
          if (excludeIds.length > 0) {
            whereCondition.developer_id = { [Op.notIn]: excludeIds };
          }
        }
      }

      // 포함 기술 검색 조건
      let includeConditions = [];
      if (skills) {
        // 콤마로 구분된 기술들을 배열로 분리 (공백 완전 제거)
        const skillsArray = skills
          .split(',')
          .map(skill => skill.trim().replace(/\s+/g, ' ')) // 연속된 공백을 하나로 변환
          .filter(skill => skill && skill.length > 0);
        
        console.log('포함 기술 배열:', skillsArray);
        
        if (skillsArray.length > 0) {
          // 각 기술에 대한 OR 조건 생성
          const skillConditions = skillsArray.map(skill => ({
            [Op.or]: [
              { project_name: { [Op.like]: `%${skill}%` } },
              { task: { [Op.like]: `%${skill}%` } },
              { project_skill_model: { [Op.like]: `%${skill}%` } },
              { project_skill_os: { [Op.like]: `%${skill}%` } },
              { project_skill_language: { [Op.like]: `%${skill}%` } },
              { project_skill_dbms: { [Op.like]: `%${skill}%` } },
              { project_skill_tool: { [Op.like]: `%${skill}%` } },
              { project_skill_protocol: { [Op.like]: `%${skill}%` } },
              { project_skill_etc: { [Op.like]: `%${skill}%` } }
            ]
          }));

          // skillsCondition에 따라 AND/OR 결정 (기본값: OR)
          const searchCondition = skillsCondition === 'AND' ? Op.and : Op.or;
          
          includeConditions.push({
            model: DeveloperSkillInfo,
            where: {
              [searchCondition]: skillConditions
            },
            required: true // INNER JOIN
          });
        }
      }

      const queryOptions = {
        where: whereCondition,
        order: [['developer_id', 'DESC']], // 개발자 ID 내림차순
        limit,
        offset,
        distinct: true // 중복 제거
      };

      if (includeConditions.length > 0) {
        queryOptions.include = includeConditions;
      }

      console.log('최종 WHERE 조건:', JSON.stringify(whereCondition, null, 2));
      console.log('쿼리 옵션:', JSON.stringify(queryOptions, null, 2));

      const { count, rows: developers } = await Developer.findAndCountAll(queryOptions);

      res.json({
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        developers
      });
    } catch (error) {
      console.error('개발자 목록 조회 중 오류:', error);
      res.status(500).json({ message: "개발자 목록 조회 중 오류가 발생했습니다." });
    }
});

// 개발자 상세 정보 조회
router.get("/:id", async (req, res) => {
  try {
    const developer = await Developer.findByPk(req.params.id);

    if (!developer) {
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    res.json(developer);
  } catch (error) {
    console.error('개발자 상세 정보 조회 중 오류:', error);
    res.status(500).json({ message: "개발자 상세 정보 조회 중 오류가 발생했습니다." });
  }
});

// 개발자 생성
router.post("/", async (req, res) => {
  try {
    // 필수 필드 검증
    if (!req.body.developer_name) {
      return res.status(400).json({ 
        message: "개발자 이름은 필수입니다.",
        field: "developer_name"
      });
    }

    if (!req.body.developer_phone) {
      return res.status(400).json({ 
        message: "전화번호는 필수입니다.",
        field: "developer_phone"
      });
    }

    // 전화번호 형식 처리
    const phoneNumber = req.body.developer_phone.replace(/-/g, '');
    if (phoneNumber.length !== 11) {
      return res.status(400).json({
        message: "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)",
        field: "developer_phone"
      });
    }
    const formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;

    // 다음 개발자 ID 계산 (최대값 + 1)
    const maxIdResult = await Developer.findOne({
      attributes: [[sequelize.fn('MAX', sequelize.cast(sequelize.col('developer_id'), 'UNSIGNED')), 'maxId']],
      raw: true
    });
    const nextId = parseInt(maxIdResult.maxId || 0) + 1;
    console.log('현재 최대 ID:', maxIdResult.maxId, '다음 개발자 ID:', nextId);

    // 새 개발자 생성
    const developer = await Developer.create({
      developer_id: nextId,
      developer_name: req.body.developer_name,
      developer_birth: req.body.developer_birth || null,
      developer_sex: req.body.developer_sex || null,
      developer_email: req.body.developer_email || null,
      developer_phone: formattedPhone,
      developer_addr: req.body.developer_addr || null,
      developer_profile_image: req.body.developer_profile_image || null,
      developer_start_date: req.body.developer_start_date || null,
      developer_career_start_date: req.body.developer_career_start_date || null,
      developer_current_position: req.body.developer_current_position || null,
      developer_grade: req.body.developer_grade || null,
      developer_married: req.body.developer_married || null,
      developer_military_start_date: req.body.developer_military_start_date || null,
      developer_military_end_date: req.body.developer_military_end_date || null,
      developer_military_desc: req.body.developer_military_desc || null
    });

    res.status(201).json(developer);
  } catch (error) {
    console.error('개발자 생성 중 오류:', error);
    res.status(500).json({ message: "개발자 생성 중 오류가 발생했습니다." });
  }
});

// 개발자 정보 수정
router.put("/:id", async (req, res) => {
  try {
    // 전화번호 형식 처리 (있는 경우)
    let formattedPhone = req.body.developer_phone;
    if (formattedPhone) {
      const phoneNumber = formattedPhone.replace(/-/g, '');
      if (phoneNumber.length !== 11) {
        return res.status(400).json({
          message: "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)",
          field: "developer_phone"
        });
      }
      formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
    }

    const updateData = {
      developer_name: req.body.developer_name,
      developer_birth: req.body.developer_birth || null,
      developer_sex: req.body.developer_sex || null,
      developer_email: req.body.developer_email || null,
      developer_addr: req.body.developer_addr || null,
      developer_profile_image: req.body.developer_profile_image || null,
      developer_start_date: req.body.developer_start_date || null,
      developer_career_start_date: req.body.developer_career_start_date || null,
      developer_current_position: req.body.developer_current_position || null,
      developer_grade: req.body.developer_grade || null,
      developer_married: req.body.developer_married || null,
      developer_military_start_date: req.body.developer_military_start_date || null,
      developer_military_end_date: req.body.developer_military_end_date || null,
      developer_military_desc: req.body.developer_military_desc || null
    };

    if (formattedPhone) {
      updateData.developer_phone = formattedPhone;
    }

    const [updated] = await Developer.update(updateData, {
      where: { developer_id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    const updatedDeveloper = await Developer.findByPk(req.params.id);
    res.json(updatedDeveloper);
  } catch (error) {
    console.error('개발자 정보 수정 중 오류:', error);
    res.status(500).json({ message: "개발자 정보 수정 중 오류가 발생했습니다." });
  }
});

// 개발자 삭제 (단일 또는 다중)
router.delete("/", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 개발자 ID가 필요합니다." });
    }

    const result = await Developer.destroy({
      where: {
        developer_id: ids
      }
    });

    if (result === 0) {
      return res.status(404).json({ message: "삭제할 개발자를 찾을 수 없습니다." });
    }

    res.json({ message: `${result}명의 개발자가 성공적으로 삭제되었습니다.` });
  } catch (error) {
    console.error('개발자 삭제 중 오류:', error);
    res.status(500).json({ message: "개발자 삭제 중 오류가 발생했습니다." });
  }
});

// 프로필 이미지 업로드
router.post("/:id/profile-image", upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "이미지 파일이 필요합니다." });
    }

    const developerId = req.params.id;
    const imageUrl = `/uploads/profiles/${path.basename(req.file.path)}`;

    const result = await sequelize.query(
      `UPDATE dev_management.developer_info 
       SET developer_profile_image = ?, updated_at = NOW() 
       WHERE developer_id = ?`,
      {
        replacements: [imageUrl, developerId],
        type: QueryTypes.UPDATE
      }
    );

    if (result[1] === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    res.json({ 
      message: "프로필 이미지가 업로드되었습니다.",
      imageUrl: imageUrl
    });
  } catch (error) {
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
  
      // 프로젝트 개월 수 계산
      const calculateProjectMonths = (startYM, endYM) => {
        const startYear = parseInt(startYM.substring(0, 4));
        const startMonth = parseInt(startYM.substring(4, 6));
        
        let endYear, endMonth;
        if (endYM) {
          endYear = parseInt(endYM.substring(0, 4));
          endMonth = parseInt(endYM.substring(4, 6));
        } else {
          // 종료일이 없으면 현재 연월 사용
          const now = new Date();
          endYear = now.getFullYear();
          endMonth = now.getMonth() + 1;
        }
        
        // 시작월부터 종료월까지 포함한 개월 수 계산
        return Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
      };

      const projectMonths = calculateProjectMonths(project_start_ym, project_end_ym);

      // 새 기술 이력 생성
      const skill = await DeveloperSkillInfo.create({
        developer_id: developerId,
        project_id: uuidv4(),
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
        project_skill_etc,
        project_month: projectMonths
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
  
      // 프로젝트 개월 수 계산
      const calculateProjectMonths = (startYM, endYM) => {
        const startYear = parseInt(startYM.substring(0, 4));
        const startMonth = parseInt(startYM.substring(4, 6));
        
        let endYear, endMonth;
        if (endYM) {
          endYear = parseInt(endYM.substring(0, 4));
          endMonth = parseInt(endYM.substring(4, 6));
        } else {
          // 종료일이 없으면 현재 연월 사용
          const now = new Date();
          endYear = now.getFullYear();
          endMonth = now.getMonth() + 1;
        }
        
        // 시작월부터 종료월까지 포함한 개월 수 계산
        return Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);
      };

      const projectMonths = calculateProjectMonths(projectStartYm, project_end_ym);

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
          project_skill_etc,
          project_month: projectMonths
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
