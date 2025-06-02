-- 개발자 목록 조회 (페이지네이션 + 검색)
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
WHERE 
    CASE 
        WHEN ? != '' THEN -- 검색어가 있는 경우
            developer_name LIKE CONCAT('%', ?, '%')
            OR developer_email LIKE CONCAT('%', ?, '%')
            OR developer_current_position LIKE CONCAT('%', ?, '%')
        ELSE TRUE -- 검색어가 없는 경우 모든 레코드 반환
    END
ORDER BY developer_id DESC, created_at DESC
LIMIT ? OFFSET ?;

-- 전체 개발자 수 조회 (검색 조건 포함)
SELECT COUNT(*) as total
FROM dev_management.developer_info
WHERE 
    CASE 
        WHEN ? != '' THEN
            developer_name LIKE CONCAT('%', ?, '%')
            OR developer_email LIKE CONCAT('%', ?, '%')
            OR developer_current_position LIKE CONCAT('%', ?, '%')
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