const { Op } = require('sequelize');
const { sequelize, Project, Developer, ProjectAssignment, DeveloperSkill } = require('../models');

// 프로젝트 목록 조회
exports.getProjects = async (req, res) => {
  try {
    const { project_name, project_start_date, project_end_date, project_status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (project_name) where.project_name = { [Op.like]: `%${project_name}%` };
    if (project_start_date) where.project_start_date = { [Op.gte]: project_start_date };
    if (project_end_date) where.project_end_date = { [Op.lte]: project_end_date };
    if (project_status) where.project_status = project_status;

    const { count, rows } = await Project.findAndCountAll({
      where,
      limit: Number(limit),
      offset: offset,
      include: [{
        model: Developer,
        through: { attributes: [] },
        attributes: []
      }],
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM project_assignment_info WHERE project_assignment_info.project_id = Project.project_id)'),
            'developer_count'
          ]
        ]
      },
      distinct: true
    });

    res.json({
      projects: rows,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: Number(limit)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: '프로젝트 목록을 가져오는데 실패했습니다.' });
  }
};

// 프로젝트 상세 조회
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 프로젝트 생성
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({
      project_id: project.project_id,
      message: '프로젝트가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: '프로젝트 생성에 실패했습니다.' });
  }
};

// 프로젝트 수정
exports.updateProject = async (req, res) => {
  try {
    const [updated] = await Project.update(req.body, {
      where: { project_id: req.params.id }
    });
    if (updated === 0) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }
    res.json({ message: "프로젝트 수정 성공" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 프로젝트 삭제
exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.destroy({
      where: { project_id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }
    res.json({ message: "프로젝트 삭제 성공" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 프로젝트 개발자 배정
exports.assignDeveloper = async (req, res) => {
  try {
    const { developer_id, task, start_date, end_date } = req.body;
    await ProjectAssignment.create({
      project_id: req.params.id,
      developer_id,
      task,
      start_date,
      end_date,
      status: 'ACTIVE'
    });
    res.json({ message: "개발자 배정 성공" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 프로젝트 개발자 목록 조회
exports.getProjectDevelopers = async (req, res) => {
  try {
    const developers = await Developer.findAll({
      include: [{
        model: Project,
        where: { project_id: req.params.id },
        through: { attributes: ['role'] }
      }]
    });
    res.json(developers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 개발자 검색
exports.searchDevelopers = async (req, res) => {
  try {
    console.log('=== 개발자 검색 시작 ===');
    const { query, page = 1 } = req.query;
    
    const limit = 10;
    const offset = (parseInt(page) - 1) * limit;
    
    console.log('검색 파라미터:', { query, page, limit, offset });

    const searchQuery = {
      attributes: [
        'developer_id',
        'developer_name',
        'developer_grade',
        'developer_email',
        'developer_phone'
      ],
      include: [{
        model: DeveloperSkill,
        required: false, // LEFT OUTER JOIN
        attributes: [
          'task',
          'project_skill_language',
          'project_skill_dbms',
          'project_skill_tool',
          'project_skill_protocol',
          'project_skill_etc'
        ]
      }],
      where: {},
      order: [['developer_name', 'ASC']],
      limit,
      offset,
      distinct: true
    };

    // 검색어가 있는 경우 OR 조건으로 여러 필드 검색
    if (query && query.trim() !== '') {
      searchQuery.where = {
        [Op.or]: [
          { developer_name: { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.task$': { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.project_skill_language$': { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.project_skill_dbms$': { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.project_skill_tool$': { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.project_skill_protocol$': { [Op.like]: `%${query}%` } },
          { '$DeveloperSkills.project_skill_etc$': { [Op.like]: `%${query}%` } }
        ]
      };
    }

    console.log('검색 조건:', JSON.stringify(searchQuery, null, 2));

    // 전체 개수 조회
    const { count } = await Developer.findAndCountAll({
      ...searchQuery,
      limit: undefined,
      offset: undefined
    });

    // 페이지 데이터 조회
    const developers = await Developer.findAll(searchQuery);
    
    console.log('전체 개발자 수:', count);
    console.log('현재 페이지 개발자 수:', developers.length);
    console.log('현재 페이지:', page);
    console.log('다음 페이지 존재 여부:', offset + developers.length < count);

    res.json({
      developers,
      hasMore: offset + developers.length < count,
      currentPage: parseInt(page),
      totalCount: count
    });
  } catch (error) {
    console.error('개발자 검색 중 오류 발생:', error);
    res.status(500).json({ 
      message: "개발자 검색 중 오류가 발생했습니다.",
      error: error.message 
    });
  }
}; 