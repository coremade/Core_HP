const { Op } = require('sequelize');
const { sequelize, Project, Developer, ProjectAssignment, DeveloperSkill } = require('../models');

// 프로젝트 목록 조회
exports.getProjects = async (req, res) => {
  console.log('getProjects 호출됨');
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
  console.log('getProjectById 호출됨');
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
  console.log('createProject 호출됨');
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
  console.log('updateProject 호출됨');
  try {
    // 먼저 프로젝트가 존재하는지 확인
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    // 프로젝트 업데이트
    await project.update(req.body);
    
    // 업데이트된 프로젝트 조회
    const updatedProject = await Project.findByPk(req.params.id);
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 프로젝트 삭제
exports.deleteProject = async (req, res) => {
  console.log('deleteProject 호출됨');
  const t = await sequelize.transaction();
  
  try {
    // 먼저 프로젝트가 존재하는지 확인
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
    }

    // 프로젝트에 연결된 project_assignment_info 데이터 삭제
    await ProjectAssignment.destroy({
      where: { project_id: req.params.id },
      transaction: t
    });

    // 프로젝트 삭제
    await Project.destroy({
      where: { project_id: req.params.id },
      transaction: t
    });

    await t.commit();
    res.json({ message: "프로젝트와 관련 데이터가 성공적으로 삭제되었습니다." });
  } catch (error) {
    await t.rollback();
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 프로젝트 개발자 배정
exports.assignDeveloper = async (req, res) => {
  console.log('assignDeveloper 호출됨');
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
  console.log('getProjectDevelopers 호출됨');
  try {
    const projectId = req.params.id;
    
    const result = await sequelize.query(`
      WITH project_developers AS (
        -- 프로젝트에 배정된 개발자 기본 정보
        SELECT 
          di.*,
          pai.task,
          pai.start_date,
          pai.end_date
        FROM developer_info di
        INNER JOIN project_assignment_info pai 
          ON di.developer_id = pai.developer_id
        WHERE pai.project_id = :projectId
          AND pai.status = 'ACTIVE'
      )
      SELECT 
        pd.*,
        -- 가장 많은 경험이 있는 task
        (
          SELECT task
          FROM developer_skill_info dsi
          WHERE dsi.developer_id = pd.developer_id
          GROUP BY task
          ORDER BY SUM(project_month) DESC
          LIMIT 1
        ) AS main_task,
        
        -- 가장 많이 사용한 프로그래밍 언어
        (
          SELECT project_skill_language
          FROM developer_skill_info dsi
          WHERE dsi.developer_id = pd.developer_id
          GROUP BY project_skill_language
          ORDER BY SUM(project_month) DESC
          LIMIT 1
        ) AS project_skill_language,
        
        -- 가장 많이 사용한 DBMS
        (
          SELECT project_skill_dbms
          FROM developer_skill_info dsi
          WHERE dsi.developer_id = pd.developer_id
          GROUP BY project_skill_dbms
          ORDER BY SUM(project_month) DESC
          LIMIT 1
        ) AS project_skill_dbms,
        
        -- 가장 많이 사용한 개발 도구
        (
          SELECT project_skill_tool
          FROM developer_skill_info dsi
          WHERE dsi.developer_id = pd.developer_id
          GROUP BY project_skill_tool
          ORDER BY SUM(project_month) DESC
          LIMIT 1
        ) AS project_skill_tool
      FROM project_developers pd
      ORDER BY pd.developer_name ASC
    `, {
      replacements: { projectId },
      type: sequelize.QueryTypes.SELECT
    });

    const developers = result.map(row => ({
      developer_id: row.developer_id,
      developer_name: row.developer_name,
      developer_grade: row.developer_grade,
      developer_email: row.developer_email,
      developer_phone: row.developer_phone,
      developer_profile_image: row.developer_profile_image,
      task: row.task || row.main_task,
      start_date: row.start_date,
      end_date: row.end_date,
      project_skill_language: row.project_skill_language,
      project_skill_dbms: row.project_skill_dbms,
      project_skill_tool: row.project_skill_tool
    }));

    res.json(developers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 개발자 검색
exports.searchDevelopers = async (req, res) => {
  console.log('searchDevelopers 호출됨');
  try {
    console.log('=== 개발자 검색 시작 ===');
    console.log('Request Query:', req.query);
    
    const { developer_name = '', page = 1 } = req.query;
    const limit = 10;
    const offset = (parseInt(page) - 1) * limit;
    
    // 검색어가 빈 문자열이거나 undefined인 경우를 체크
    const isEmptySearch = !developer_name || developer_name.trim() === '';
    
    console.log('파라미터 변환 후:', {
      developer_name,
      isEmptySearch,
      page,
      parsedPage: parseInt(page),
      limit,
      offset,
      searchQuery: isEmptySearch ? '%' : `%${developer_name}%`
    });

    const replacements = {
      searchQuery: isEmptySearch ? '%' : `%${developer_name}%`,
      limit,
      offset
    };
    
    console.log('SQL 쿼리 파라미터:', replacements);

    const result = await sequelize.query(`
      WITH base_developers AS (
        -- 개발자 기본 정보에서 이름으로 검색
        SELECT DISTINCT di.*
        FROM developer_info di
        WHERE ${isEmptySearch ? '1=1' : 'di.developer_name LIKE :searchQuery'}
      ),
      skill_matched_developers AS (
        -- 스킬 정보로 검색된 개발자
        SELECT DISTINCT di.*
        FROM developer_info di
        WHERE ${isEmptySearch ? '1=1' : `
          EXISTS (
            SELECT 1
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = di.developer_id
            AND (
              task LIKE :searchQuery OR
              project_skill_language LIKE :searchQuery OR
              project_skill_dbms LIKE :searchQuery OR
              project_skill_tool LIKE :searchQuery OR
              project_skill_protocol LIKE :searchQuery OR
              project_skill_etc LIKE :searchQuery
            )
          )
        `}
      ),
      filtered_developers AS (
        -- 이름 또는 스킬로 검색된 모든 개발자 (중복 제거)
        SELECT DISTINCT *
        FROM (
          SELECT * FROM base_developers
          UNION
          SELECT * FROM skill_matched_developers
        ) combined
      ),
      total_count AS (
        SELECT COUNT(*) as total FROM filtered_developers
      ),
      paged_developers AS (
        SELECT *
        FROM filtered_developers
        ORDER BY developer_name ASC, developer_id ASC
        LIMIT :limit OFFSET :offset
      )
      SELECT 
        pd.*,
        tc.total,
        -- task
        (
          SELECT IFNULL((
            SELECT task
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND task LIKE :searchQuery
            GROUP BY task
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT task
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY task
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS task_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND task LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY task
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS task_month,

        -- project_skill_language
        (
          SELECT IFNULL((
            SELECT project_skill_language
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_language LIKE :searchQuery
            GROUP BY project_skill_language
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT project_skill_language
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_language
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS language_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_language LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_language
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS language_month,

        -- project_skill_dbms
        (
          SELECT IFNULL((
            SELECT project_skill_dbms
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_dbms LIKE :searchQuery
            GROUP BY project_skill_dbms
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT project_skill_dbms
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_dbms
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS dbms_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_dbms LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_dbms
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS dbms_month,

        -- project_skill_tool
        (
          SELECT IFNULL((
            SELECT project_skill_tool
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_tool LIKE :searchQuery
            GROUP BY project_skill_tool
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT project_skill_tool
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_tool
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS tool_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_tool LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_tool
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS tool_month,

        -- project_skill_protocol
        (
          SELECT IFNULL((
            SELECT project_skill_protocol
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_protocol LIKE :searchQuery
            GROUP BY project_skill_protocol
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT project_skill_protocol
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_protocol
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS protocol_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_protocol LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_protocol
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS protocol_month,

        -- project_skill_etc
        (
          SELECT IFNULL((
            SELECT project_skill_etc
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_etc LIKE :searchQuery
            GROUP BY project_skill_etc
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ), (
            SELECT project_skill_etc
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_etc
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS etc_value,
        (
          SELECT IFNULL((
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id AND project_skill_etc LIKE :searchQuery
          ), (
            SELECT SUM(project_month)
            FROM developer_skill_info dsi
            WHERE dsi.developer_id = pd.developer_id
            GROUP BY project_skill_etc
            ORDER BY SUM(project_month) DESC
            LIMIT 1
          ))
        ) AS etc_month
      FROM paged_developers pd
      CROSS JOIN total_count tc
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const totalCount = result[0]?.total || 0;
    const developers = result.map(row => ({
      developer_id: row.developer_id,
      developer_name: row.developer_name,
      developer_grade: row.developer_grade,
      developer_email: row.developer_email,
      developer_phone: row.developer_phone,
      task: row.task_value,
      project_skill_language: row.language_value,
      project_skill_dbms: row.dbms_value,
      project_skill_tool: row.tool_value,
      project_skill_protocol: row.protocol_value,
      project_skill_etc: row.etc_value
    }));

    console.log('전체 개발자 수:', totalCount);
    console.log('현재 페이지 개발자 수:', developers.length);
    console.log('현재 페이지:', page);
    console.log('다음 페이지 존재 여부:', offset + developers.length < totalCount);

    res.json({
      developers,
      hasMore: offset + developers.length < totalCount,
      currentPage: parseInt(page),
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('개발자 검색 중 오류 발생:', error);
    res.status(500).json({ 
      message: "개발자 검색 중 오류가 발생했습니다.",
      error: error.message 
    });
  }
};

// 프로젝트 개발자 배치 배정
exports.assignDevelopersBatch = async (req, res) => {
  console.log('assignDevelopersBatch 호출됨');
  const t = await sequelize.transaction();
  
  try {
    const { assignments } = req.body;
    const projectId = req.params.id;

    // 날짜 형식 검증 및 변환 함수
    const validateAndFormatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    };

    // 기존 배정 정보 삭제
    await ProjectAssignment.destroy({
      where: { project_id: projectId },
      transaction: t
    });

    // 새로운 배정 정보 일괄 생성
    await ProjectAssignment.bulkCreate(
      assignments.map(assignment => ({
        project_id: projectId,
        developer_id: assignment.developer_id,
        task: assignment.task || '',
        start_date: validateAndFormatDate(assignment.start_date),
        end_date: validateAndFormatDate(assignment.end_date),
        status: 'ACTIVE'
      })),
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "개발자 배정 성공" });
  } catch (error) {
    await t.rollback();
    console.error('Error:', error);
    res.status(500).json({ 
      message: "서버 오류가 발생했습니다.",
      error: error.message 
    });
  }
}; 