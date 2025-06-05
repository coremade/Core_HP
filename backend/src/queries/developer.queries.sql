-- 개발자 목록 조회 (페이지네이션 + 검색)
SELECT DISTINCT
    d.developer_id,
    d.developer_name,
    DATE_FORMAT(d.developer_birth, '%Y-%m-%d') as developer_birth,
    d.developer_sex,
    d.developer_email,
    d.developer_phone,
    d.developer_addr,
    d.developer_profile_image,
    d.developer_start_date,
    d.developer_career_start_date,
    d.developer_current_position,
    d.developer_grade,
    d.developer_married,
    d.developer_military_start_date,
    d.developer_military_end_date,
    d.developer_military_desc,
    d.developer_evaluation_code,
    d.created_at,
    d.updated_at
FROM dev_management.developer_info d
LEFT JOIN dev_management.developer_skill_info s ON d.developer_id = s.developer_id
WHERE 
    CASE 
        WHEN ? != '' THEN -- 이름 검색
            d.developer_name LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 이메일 검색
            d.developer_email LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 전화번호 검색
            d.developer_phone LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 기술 검색
            s.project_skill_model LIKE CONCAT('%', ?, '%')
            OR s.project_skill_os LIKE CONCAT('%', ?, '%')
            OR s.project_skill_language LIKE CONCAT('%', ?, '%')
            OR s.project_skill_dbms LIKE CONCAT('%', ?, '%')
            OR s.project_skill_tool LIKE CONCAT('%', ?, '%')
            OR s.project_skill_protocol LIKE CONCAT('%', ?, '%')
            OR s.project_skill_etc LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 성별 필터
            d.developer_sex = ?
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 직급 필터
            d.developer_current_position = ?
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 등급 필터
            d.developer_grade = ?
        ELSE TRUE
    END
ORDER BY d.developer_id DESC, d.created_at DESC
LIMIT ? OFFSET ?;

-- 전체 개발자 수 조회 (검색 조건 포함)
SELECT COUNT(DISTINCT d.developer_id) as total
FROM dev_management.developer_info d
LEFT JOIN dev_management.developer_skill_info s ON d.developer_id = s.developer_id
WHERE 
    CASE 
        WHEN ? != '' THEN -- 이름 검색
            d.developer_name LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 이메일 검색
            d.developer_email LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 전화번호 검색
            d.developer_phone LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 기술 검색
            s.project_skill_model LIKE CONCAT('%', ?, '%')
            OR s.project_skill_os LIKE CONCAT('%', ?, '%')
            OR s.project_skill_language LIKE CONCAT('%', ?, '%')
            OR s.project_skill_dbms LIKE CONCAT('%', ?, '%')
            OR s.project_skill_tool LIKE CONCAT('%', ?, '%')
            OR s.project_skill_protocol LIKE CONCAT('%', ?, '%')
            OR s.project_skill_etc LIKE CONCAT('%', ?, '%')
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 성별 필터
            d.developer_sex = ?
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 직급 필터
            d.developer_current_position = ?
        ELSE TRUE
    END
    AND CASE
        WHEN ? != '' THEN -- 등급 필터
            d.developer_grade = ?
        ELSE TRUE
    END;

-- 개발자 상세 정보 조회
SELECT 
    developer_id,
    developer_name,
    DATE_FORMAT(developer_birth, '%Y-%m-%d') as developer_birth,
    developer_sex,
    developer_email,
    developer_phone,
    developer_addr,
    developer_profile_image,
    developer_start_date,
    developer_career_start_date,
    developer_current_position,
    developer_grade,
    developer_married,
    developer_military_start_date,
    developer_military_end_date,
    developer_military_desc,
    developer_evaluation_code,
    created_at,
    updated_at
FROM dev_management.developer_info
WHERE developer_id = ?;

-- 개발자 삭제 (단일 또는 다중)
DELETE FROM developer_info 
WHERE FIND_IN_SET(developer_id, ?) > 0;

/* 
참고: developer_info 테이블의 developer_id를 참조하는 다른 테이블들은 
ON DELETE CASCADE 설정이 되어 있어서 자동으로 함께 삭제됩니다:
- school_info
- resume
- developer_skill
- project_assignment
*/

-- 개발자 기본 정보 저장
INSERT INTO developer_info (
    developer_id,
    developer_name,
    developer_birth,
    developer_sex,
    developer_email,
    developer_phone,
    developer_addr,
    developer_profile_image,
    developer_start_date,
    developer_career_start_date,
    developer_current_position,
    developer_grade,
    developer_married,
    developer_military_start_date,
    developer_military_end_date,
    developer_military_desc
) 
VALUES (
    (SELECT COALESCE(MAX(developer_id), 0) + 1 FROM developer_info),
    ?, -- developer_name
    STR_TO_DATE(?, '%Y-%m-%d'), -- developer_birth
    ?, -- developer_sex
    ?, -- developer_email
    ?, -- developer_phone
    ?, -- developer_addr
    ?, -- developer_profile_image
    ?, -- developer_start_date
    ?, -- developer_career_start_date
    ?, -- developer_current_position
    ?, -- developer_grade
    ?, -- developer_married
    ?, -- developer_military_start_date
    ?, -- developer_military_end_date
    ?  -- developer_military_desc
);


-- 개발자 기술 스택 정보 저장
INSERT INTO developer_skill (
    developer_id,
    skill_id,
    proficiency_level,
    years_of_experience,
    last_used_date
) VALUES (
    ?, -- developer_id
    ?, -- skill_id
    ?, -- proficiency_level (1-5)
    ?, -- years_of_experience
    ?  -- last_used_date (YYYY-MM-DD 형식)
);

-- 개발자 정보 수정
UPDATE developer_info
SET 
    developer_name = ?,
    developer_birth = STR_TO_DATE(?, '%Y-%m-%d'),
    developer_sex = ?,
    developer_email = ?,
    developer_phone = ?,
    developer_addr = ?,
    developer_profile_image = ?,
    developer_start_date = ?,
    developer_career_start_date = ?,
    developer_current_position = ?,
    developer_grade = ?
WHERE developer_id = ?; 