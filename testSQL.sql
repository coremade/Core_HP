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
    FOREIGN KEY (master_id) REFERENCES common_code_master(master_id)
) COMMENT '공통 코드 상세';

-- 개발자 테이블
CREATE TABLE developer_info (
    developer_id VARCHAR(36) PRIMARY KEY COMMENT '개발자 ID', --주민번호 + 성명
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
    developer_married VARCHAR(1) COMMENT '결혼여부',
    developer_military_start_date DATE COMMENT '입대일',
    developer_military_end_date DATE COMMENT '제대일',
    developer_military_desc VARCHAR(20) COMMENT '역종,병과',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '개발자 정보';

-- 학교 테이블
CREATE TABLE school_info (
    developer_id VARCHAR(36) PRIMARY KEY COMMENT '개발자 ID', --주민번호 + 성명
    school_graduation_ym VARCHAR(6)  PRIMARY KEY COMMENT '졸업년월',
    school_name VARCHAR(100) NOT NULL COMMENT '학교명',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '학교 정보';

-- 자격증

CREATE TABLE certification_info (
    developer_id VARCHAR(36) PRIMARY KEY COMMENT '개발자 ID', --주민번호 + 성명
    certification_date DATE  PRIMARY KEY COMMENT '졸업년월',
    certification_name VARCHAR(100) NOT NULL COMMENT '자격증명',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '자격증 정보';

-- 근무이력 테이블
CREATE TABLE work_info(
    developer_id VARCHAR(36) PRIMARY KEY COMMENT '개발자 ID', --주민번호 + 성명
    work_start_date DATE  PRIMARY KEY COMMENT '시작일',
    work_end_date DATE COMMENT '종료일',
    work_name VARCHAR(100) NOT NULL COMMENT '회사명',
    work_position VARCHAR(100) COMMENT '직위',
    work_task VARCHAR(50) COMMENT '담당업무',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '근무 이력 정보';

-- 프로젝트 테이블
CREATE TABLE project_info (
    project_id VARCHAR(36) PRIMARY KEY COMMENT '프로젝트 ID', -- SEQ
    project_name VARCHAR(100) NOT NULL COMMENT '프로젝트명',
    project_description TEXT COMMENT '프로젝트 설명',
    project_start_date DATE COMMENT '시작일',
    project_end_date DATE COMMENT '종료일',
    project_status VARCHAR(20) DEFAULT 'PLANNING' COMMENT '상태',
    project_client_id VARCHAR(100) COMMENT '클라이언트 ID',
    project_practitioner_id VARCHAR(100) COMMENT '수행사 ID',
    project_pm_name VARCHAR(36) COMMENT '프로젝트 매니저명',
    project_skill_model VARCHAR(36) COMMENT '기종',
    project_skill_os VARCHAR(36) COMMENT 'OS',
    project_skill_language VARCHAR(36) COMMENT '언어',
    project_skill_dbms VARCHAR(36) COMMENT 'DBMS',
    project_skill_tool VARCHAR(36) COMMENT '도구',
    project_skill_protocol VARCHAR(36) COMMENT '통신',
    project_skill_etc VARCHAR(36) COMMENT '기타',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
) COMMENT '프로젝트';

-- 프로젝트 배정 테이블
CREATE TABLE project_assignment_info (
    developer_id VARCHAR(36) COMMENT '개발자 ID',
    project_id VARCHAR(36) COMMENT '프로젝트 ID',
    role VARCHAR(50) COMMENT '역할',
    start_date DATE COMMENT '투입 시작일',
    end_date DATE COMMENT '투입 종료일',
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '상태',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    PRIMARY KEY (developer_id, project_id),
    FOREIGN KEY (developer_id) REFERENCES developer(developer_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
) COMMENT '프로젝트 배정';


===============================================================

-- 개발자-기술 매핑 테이블
CREATE TABLE developer_skill_info (
    developer_id VARCHAR(36) COMMENT '개발자 ID',
    project_id VARCHAR(36) PRIMARY KEY COMMENT '프로젝트 ID', -- SEQ
    role VARCHAR(50) COMMENT '역할',
    project_start_date DATE COMMENT '시작일',
    project_end_date DATE COMMENT '종료일',
    project_skill_model VARCHAR(36) COMMENT '기종',
    project_skill_os VARCHAR(36) COMMENT 'OS',
    project_skill_language VARCHAR(36) COMMENT '언어',
    project_skill_dbms VARCHAR(36) COMMENT 'DBMS',
    project_skill_tool VARCHAR(36) COMMENT '도구',
    project_skill_protocol VARCHAR(36) COMMENT '통신',
    project_skill_etc VARCHAR(36) COMMENT '기타',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
) COMMENT '개발자-기술 매핑';

-- 이력서 테이블
CREATE TABLE resume (
    resume_id VARCHAR(36) PRIMARY KEY COMMENT '이력서 ID',
    developer_id VARCHAR(36) NOT NULL COMMENT '개발자 ID',
    file_path VARCHAR(255) NOT NULL COMMENT '파일 경로',
    file_type VARCHAR(10) COMMENT '파일 형식',
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
    version INT DEFAULT 1 COMMENT '버전',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '상태',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    FOREIGN KEY (developer_id) REFERENCES developer(developer_id)
) COMMENT '이력서';
