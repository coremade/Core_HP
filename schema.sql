-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS hrm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hrm_system;

-- 공통 코드 마스터 테이블
CREATE TABLE common_code_master (
    master_id VARCHAR(20) PRIMARY KEY COMMENT '마스터 코드',
    master_name VARCHAR(100) NOT NULL COMMENT '마스터명',
    description TEXT COMMENT '설명',
    use_yn CHAR(1) DEFAULT 'Y' COMMENT '사용여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '공통 코드 마스터';

-- 공통 코드 상세 테이블
CREATE TABLE common_code_detail (
    detail_id VARCHAR(20) PRIMARY KEY COMMENT '상세 코드',
    master_id VARCHAR(20) NOT NULL COMMENT '마스터 코드',
    detail_name VARCHAR(100) NOT NULL COMMENT '상세 코드명',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    description TEXT COMMENT '설명',
    use_yn CHAR(1) DEFAULT 'Y' COMMENT '사용여부',
    extra_value1 VARCHAR(100) COMMENT '추가값1',
    extra_value2 VARCHAR(100) COMMENT '추가값2',
    extra_value3 VARCHAR(100) COMMENT '추가값3',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (master_id) REFERENCES common_code_master(master_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '공통 코드 상세';

-- 개발자 정보 테이블
CREATE TABLE developer_info (
    developer_id VARCHAR(36) PRIMARY KEY COMMENT '개발자 ID',
    developer_name VARCHAR(100) NOT NULL COMMENT '이름',
    developer_birth NUMERIC COMMENT '생년월일',
    developer_sex VARCHAR(1) COMMENT '성별',
    developer_email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    developer_phone VARCHAR(20) COMMENT '연락처',
    developer_addr VARCHAR(250) COMMENT '주소',
    developer_profile_image VARCHAR(255) COMMENT '프로필 이미지 URL',
    developer_start_date DATE COMMENT '입사일',
    developer_career_start_date DATE COMMENT '경력 시작일',
    developer_current_position VARCHAR(50) COMMENT '현재 직급/포지션',
    developer_grade VARCHAR(20) COMMENT '등급',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '개발자 정보';

-- 학교 정보 테이블
CREATE TABLE school_info (
    developer_id VARCHAR(36) NOT NULL COMMENT '개발자 ID',
    school_graduation_ym VARCHAR(6) NOT NULL COMMENT '졸업년월',
    school_name VARCHAR(100) NOT NULL COMMENT '학교명',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (developer_id, school_graduation_ym),
    FOREIGN KEY (developer_id) REFERENCES developer_info(developer_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '학교 정보';

-- 이력서 테이블
CREATE TABLE resume (
    resume_id VARCHAR(36) PRIMARY KEY COMMENT '이력서 ID',
    developer_id VARCHAR(36) NOT NULL COMMENT '개발자 ID',
    file_path VARCHAR(255) NOT NULL COMMENT '파일 경로',
    file_type VARCHAR(10) NOT NULL COMMENT '파일 형식(PDF/DOCX/TXT)',
    version INT DEFAULT 1 COMMENT '버전',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '상태(PENDING/PROCESSING/COMPLETED/ERROR)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (developer_id) REFERENCES developer_info(developer_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '이력서';

-- 이력서 추출 데이터 테이블
CREATE TABLE resume_extraction (
    extraction_id VARCHAR(36) PRIMARY KEY COMMENT '추출 ID',
    resume_id VARCHAR(36) NOT NULL COMMENT '이력서 ID',
    extraction_type VARCHAR(20) NOT NULL COMMENT '추출 유형(BASIC_INFO/SKILLS/EXPERIENCE/EDUCATION/CERTIFICATES)',
    extracted_data JSON NOT NULL COMMENT '추출된 데이터',
    confidence_score FLOAT DEFAULT 0 COMMENT '신뢰도 점수',
    is_verified BOOLEAN DEFAULT false COMMENT '검증 여부',
    verified_by VARCHAR(36) COMMENT '검증자 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (resume_id) REFERENCES resume(resume_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES developer_info(developer_id) ON DELETE SET NULL ON UPDATE CASCADE
) COMMENT '이력서 추출 데이터';

-- 프로젝트 테이블
CREATE TABLE project (
    project_id VARCHAR(36) PRIMARY KEY COMMENT '프로젝트 ID',
    name VARCHAR(100) NOT NULL COMMENT '프로젝트명',
    description TEXT COMMENT '프로젝트 설명',
    start_date DATE COMMENT '시작일',
    end_date DATE COMMENT '종료일',
    status VARCHAR(20) DEFAULT 'PLANNING' COMMENT '상태(PLANNING/READY/IN_PROGRESS/ON_HOLD/COMPLETED)',
    client VARCHAR(100) COMMENT '클라이언트',
    manager_id VARCHAR(36) NOT NULL COMMENT '프로젝트 매니저 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (manager_id) REFERENCES developer_info(developer_id) ON DELETE RESTRICT ON UPDATE CASCADE
) COMMENT '프로젝트';

-- 프로젝트 배정 테이블
CREATE TABLE project_assignment (
    project_id VARCHAR(36) NOT NULL COMMENT '프로젝트 ID',
    developer_id VARCHAR(36) NOT NULL COMMENT '개발자 ID',
    role VARCHAR(50) NOT NULL COMMENT '역할',
    start_date DATE NOT NULL COMMENT '투입 시작일',
    end_date DATE COMMENT '투입 종료일',
    contribution INT DEFAULT 0 COMMENT '기여도(%)',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '상태(ACTIVE/COMPLETED/TERMINATED)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (project_id, developer_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (developer_id) REFERENCES developer_info(developer_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '프로젝트 배정';

-- 기술 스택 테이블
CREATE TABLE skill (
    skill_id VARCHAR(36) PRIMARY KEY COMMENT '기술 스택 ID',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '기술명',
    category VARCHAR(50) NOT NULL COMMENT '기술 카테고리',
    description TEXT COMMENT '기술 설명',
    level_requirements JSON COMMENT '등급별 요구사항',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '기술 스택';

-- 개발자-기술 매핑 테이블
CREATE TABLE developer_skill (
    developer_id VARCHAR(36) NOT NULL COMMENT '개발자 ID',
    skill_id VARCHAR(36) NOT NULL COMMENT '기술 스택 ID',
    proficiency_level INT DEFAULT 1 COMMENT '숙련도 레벨(1-5)',
    years_of_experience FLOAT DEFAULT 0 COMMENT '경력 연수',
    last_used_date DATE COMMENT '최근 사용일',
    certification VARCHAR(255) COMMENT '자격증 정보',
    verified BOOLEAN DEFAULT false COMMENT '검증 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (developer_id, skill_id),
    FOREIGN KEY (developer_id) REFERENCES developer_info(developer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill(skill_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '개발자-기술 매핑';

-- 프로젝트-기술 매핑 테이블
CREATE TABLE project_skill (
    project_id VARCHAR(36) NOT NULL COMMENT '프로젝트 ID',
    skill_id VARCHAR(36) NOT NULL COMMENT '기술 스택 ID',
    required_level INT DEFAULT 1 COMMENT '요구 레벨(1-5)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (project_id, skill_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill(skill_id) ON DELETE CASCADE ON UPDATE CASCADE
) COMMENT '프로젝트-기술 매핑';

-- 초기 공통 코드 데이터 입력
-- 개발 언어 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('DEV_LANG', '개발 언어', '프로그래밍 언어 분류');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('DEV_LANG_001', 'DEV_LANG', 'Java', 1),
('DEV_LANG_002', 'DEV_LANG', 'Python', 2),
('DEV_LANG_003', 'DEV_LANG', 'JavaScript', 3),
('DEV_LANG_004', 'DEV_LANG', 'TypeScript', 4),
('DEV_LANG_005', 'DEV_LANG', 'C#', 5),
('DEV_LANG_006', 'DEV_LANG', 'C++', 6),
('DEV_LANG_007', 'DEV_LANG', 'PHP', 7),
('DEV_LANG_008', 'DEV_LANG', 'Ruby', 8),
('DEV_LANG_009', 'DEV_LANG', 'Swift', 9),
('DEV_LANG_010', 'DEV_LANG', 'Kotlin', 10);

-- 사용 시스템 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('SYS_TYPE', '사용 시스템', '시스템 환경 분류');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('SYS_TYPE_001', 'SYS_TYPE', 'Windows', 1),
('SYS_TYPE_002', 'SYS_TYPE', 'Linux', 2),
('SYS_TYPE_003', 'SYS_TYPE', 'macOS', 3),
('SYS_TYPE_004', 'SYS_TYPE', 'iOS', 4),
('SYS_TYPE_005', 'SYS_TYPE', 'Android', 5),
('SYS_TYPE_006', 'SYS_TYPE', 'AWS', 6),
('SYS_TYPE_007', 'SYS_TYPE', 'Azure', 7),
('SYS_TYPE_008', 'SYS_TYPE', 'GCP', 8);

-- 업체 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('COMPANY', '업체', '거래처 및 협력사 분류');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('COMPANY_001', 'COMPANY', '자사', 1),
('COMPANY_002', 'COMPANY', '협력사', 2),
('COMPANY_003', 'COMPANY', '고객사', 3);

-- 업무 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('WORK_TYPE', '업무', '업무 유형 분류');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('WORK_TYPE_001', 'WORK_TYPE', '웹 개발', 1),
('WORK_TYPE_002', 'WORK_TYPE', '모바일 앱 개발', 2),
('WORK_TYPE_003', 'WORK_TYPE', '서버/백엔드 개발', 3),
('WORK_TYPE_004', 'WORK_TYPE', '데이터베이스', 4),
('WORK_TYPE_005', 'WORK_TYPE', '시스템 설계', 5),
('WORK_TYPE_006', 'WORK_TYPE', '프로젝트 관리', 6),
('WORK_TYPE_007', 'WORK_TYPE', '품질 관리', 7),
('WORK_TYPE_008', 'WORK_TYPE', '유지보수', 8);

-- 직급 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('POSITION', '직급', '직급 체계');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('POSITION_001', 'POSITION', '사원', 1),
('POSITION_002', 'POSITION', '대리', 2),
('POSITION_003', 'POSITION', '과장', 3),
('POSITION_004', 'POSITION', '차장', 4),
('POSITION_005', 'POSITION', '부장', 5),
('POSITION_006', 'POSITION', '이사', 6);

-- 등급 코드
INSERT INTO common_code_master (master_id, master_name, description) 
VALUES ('GRADE', '등급', '개발자 등급 체계');

INSERT INTO common_code_detail (detail_id, master_id, detail_name, sort_order) VALUES
('GRADE_001', 'GRADE', '초급', 1),
('GRADE_002', 'GRADE', '중급', 2),
('GRADE_003', 'GRADE', '고급', 3),
('GRADE_004', 'GRADE', '특급', 4); 