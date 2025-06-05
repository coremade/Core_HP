const { Developer, DeveloperSkillInfo } = require("../models");
const { Op } = require("sequelize");

exports.getAllDevelopers = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 목록 조회 시작 ===');
    console.log('요청 파라미터:', req.query);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const name = req.query.name || '';
    const email = req.query.email || '';
    const phone = req.query.phone || '';
    const skills = req.query.skills || '';
    const gender = req.query.gender || '';
    const position = req.query.position || '';
    const grade = req.query.grade || '';
    const offset = (page - 1) * pageSize;

    const where = {};
    const include = [];

    // 이름 검색
    if (name) {
      where.developer_name = { [Op.like]: `%${name}%` };
    }

    // 이메일 검색
    if (email) {
      where.developer_email = { [Op.like]: `%${email}%` };
    }

    // 전화번호 검색
    if (phone) {
      where.developer_phone = { [Op.like]: `%${phone}%` };
    }

    // 기술 검색 (콤마로 구분된 여러 기술 검색 지원)
    if (skills) {
      const skillList = skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      
      if (skillList.length > 0) {
        include.push({
          model: DeveloperSkillInfo,
          required: true,
          where: {
            [Op.and]: skillList.map(skill => ({
              [Op.or]: [
                { project_skill_model: { [Op.like]: `%${skill}%` } },
                { project_skill_os: { [Op.like]: `%${skill}%` } },
                { project_skill_language: { [Op.like]: `%${skill}%` } },
                { project_skill_dbms: { [Op.like]: `%${skill}%` } },
                { project_skill_tool: { [Op.like]: `%${skill}%` } },
                { project_skill_protocol: { [Op.like]: `%${skill}%` } },
                { project_skill_etc: { [Op.like]: `%${skill}%` } }
              ]
            }))
          },
          attributes: [
            'project_skill_model',
            'project_skill_os',
            'project_skill_language',
            'project_skill_dbms',
            'project_skill_tool',
            'project_skill_protocol',
            'project_skill_etc'
          ]
        });
      }
    }

    // 성별 검색 조건
    if (gender) {
      where.developer_sex = gender;
    }

    // 직급 검색 조건
    if (position) {
      where.developer_current_position = position;
    }

    // 등급 검색 조건
    if (grade) {
      where.developer_grade = grade;
    }

    const { count, rows: developers } = await Developer.findAndCountAll({
      where,
      include,
      distinct: true,
      order: [["developer_id", "DESC"]],
      offset,
      limit: pageSize,
      attributes: [
        'developer_id',
        'developer_name',
        'developer_birth',
        'developer_sex',
        'developer_email',
        'developer_phone',
        'developer_addr',
        'developer_profile_image',
        'developer_start_date',
        'developer_career_start_date',
        'developer_current_position',
        'developer_grade',
        'developer_married',
        'developer_military_start_date',
        'developer_military_end_date',
        'developer_military_desc',
        'developer_evaluation_code',
        'created_at',
        'updated_at'
      ]
    });

    const response = {
      developers,
      total: count,
      page,
      pageSize
    };

    console.log('=== 개발자 목록 조회 완료 ===\n');
    res.json(response);
  } catch (err) {
    console.error('개발자 목록 조회 중 오류 발생:', err);
    next(err);
  }
};

exports.getDeveloperById = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 상세 정보 조회 ===');
    console.log('요청 ID:', req.params.id);

    const developer = await Developer.findByPk(req.params.id);
    if (!developer) {
      console.log('개발자를 찾을 수 없음');
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    console.log('조회된 개발자:', {
      id: developer.developer_id,
      name: developer.developer_name,
      email: developer.developer_email,
      position: developer.developer_current_position
    });
    console.log('=== 개발자 상세 정보 조회 완료 ===\n');

    res.json(developer);
  } catch (err) {
    console.error('개발자 상세 정보 조회 중 오류 발생:', err);
    next(err);
  }
};

exports.createDeveloper = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 생성 시작 ===');
    console.log('요청 데이터:', req.body);

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

    // 전화번호에서 하이픈 제거 후 형식 적용
    const phoneNumber = req.body.developer_phone.replace(/-/g, '');
    if (phoneNumber.length !== 11) {
      return res.status(400).json({
        message: "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)",
        field: "developer_phone"
      });
    }
    const formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;

    // 날짜 필드 형식 검증 및 변환
    if (req.body.developer_birth) {
      try {
        const birthDate = new Date(req.body.developer_birth);
        if (isNaN(birthDate.getTime())) {
          return res.status(400).json({
            message: "생년월일 형식이 올바르지 않습니다.",
            field: "developer_birth"
          });
        }
      } catch (err) {
        return res.status(400).json({
          message: "생년월일 형식이 올바르지 않습니다.",
          field: "developer_birth"
        });
      }
    }

    // 선택적 날짜 필드들의 형식 검증
    const dateFields = ['developer_start_date', 'developer_career_start_date', 'developer_military_start_date', 'developer_military_end_date'];
    for (const field of dateFields) {
      if (req.body[field]) {
        try {
          const date = new Date(req.body[field]);
          if (isNaN(date.getTime())) {
            return res.status(400).json({
              message: `${field} 형식이 올바르지 않습니다.`,
              field: field
            });
          }
        } catch (err) {
          return res.status(400).json({
            message: `${field} 형식이 올바르지 않습니다.`,
            field: field
          });
        }
      }
    }

    // 다음 developer_id 생성
    const maxIdResult = await Developer.findOne({
      attributes: [[Developer.sequelize.fn('MAX', Developer.sequelize.col('developer_id')), 'maxId']],
      raw: true
    });
    
    const nextId = maxIdResult.maxId ? String(Number(maxIdResult.maxId) + 1) : '1';
    
    console.log('데이터 검증 완료, DB 저장 시도');
    const developer = await Developer.create({
      ...req.body,
      developer_id: nextId,
      developer_phone: formattedPhone
    });
    
    console.log('생성된 개발자:', {
      id: developer.developer_id,
      name: developer.developer_name,
      phone: developer.developer_phone
    });
    console.log('=== 개발자 생성 완료 ===\n');

    res.status(201).json(developer);
  } catch (err) {
    console.error('개발자 생성 중 오류 발생:', err);
    console.error('상세 에러:', err.stack);
    console.error('에러 상세 정보:', {
      name: err.name,
      message: err.message,
      sql: err.sql,
      parameters: err.parameters
    });
    
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        message: "입력값이 올바르지 않습니다.",
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({ 
      message: "개발자 등록 중 오류가 발생했습니다.",
      error: err.message
    });
  }
};

exports.updateDeveloper = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 정보 수정 시작 ===');
    console.log('수정 대상 ID:', req.params.id);
    console.log('수정 데이터:', req.body);

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

    const [updated] = await Developer.update(req.body, {
      where: { developer_id: req.params.id },
    });
    if (!updated) {
      console.log('수정할 개발자를 찾을 수 없음');
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    const developer = await Developer.findByPk(req.params.id);
    console.log('수정된 개발자:', {
      id: developer.developer_id,
      name: developer.developer_name,
      phone: developer.developer_phone,
      position: developer.developer_current_position
    });
    console.log('=== 개발자 정보 수정 완료 ===\n');

    res.json(developer);
  } catch (err) {
    console.error('개발자 정보 수정 중 오류 발생:', err);
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
    }
    next(err);
  }
};

exports.deleteDeveloper = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 삭제 시작 ===');
    console.log('삭제 대상 ID:', req.params.id);

    const deleted = await Developer.destroy({
      where: { developer_id: req.params.id },
    });
    if (!deleted) {
      console.log('삭제할 개발자를 찾을 수 없음');
      return res.status(404).json({ message: "개발자를 찾을 수 없습니다." });
    }

    console.log('개발자 삭제 완료');
    console.log('=== 개발자 삭제 완료 ===\n');

    res.status(204).end();
  } catch (err) {
    console.error('개발자 삭제 중 오류 발생:', err);
    next(err);
  }
};

exports.deleteDevelopers = async (req, res, next) => {
  try {
    console.log('\n=== 개발자 삭제 시작 ===');
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 개발자 ID가 필요합니다." });
    }

    console.log('삭제할 개발자 ID:', ids);

    const result = await Developer.destroy({
      where: {
        developer_id: {
          [Op.in]: ids
        }
      }
    });

    console.log(`${result}명의 개발자가 삭제됨`);
    console.log('=== 개발자 삭제 완료 ===\n');

    res.json({ message: `${result}명의 개발자가 삭제되었습니다.` });
  } catch (err) {
    console.error('개발자 삭제 중 오류 발생:', err);
    next(err);
  }
};
