
CREATE TABLE certification_info
(
  developer_id       VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  certification_date DATE         NULL     COMMENT '취득년월',
  created_at         DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at         DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  certification_name VARCHAR(100) NOT NULL COMMENT '자격증명',
  PRIMARY KEY (developer_id, certification_date)
) COMMENT '자격증 정보';

CREATE TABLE common_code_detail
(
  detail_id    VARCHAR(20)  NULL     COMMENT '상세 코드',
  master_id    VARCHAR(20)  NOT NULL COMMENT '마스터 코드',
  detail_name  VARCHAR(100) NOT NULL COMMENT '상세 코드명',
  sort_order   INT          NULL     DEFAULT 0 COMMENT '정렬 순서',
  description  TEXT         NULL     COMMENT '설명',
  use_yn       CHAR(1)      NULL     DEFAULT Y COMMENT '사용여부',
  extra_value1 VARCHAR(100) NULL     COMMENT '추가값1',
  extra_value2 VARCHAR(100) NULL     COMMENT '추가값2',
  extra_value3 VARCHAR(100) NULL     COMMENT '추가값3',
  created_at   DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at   DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (detail_id)
) COMMENT '공통 코드 상세';

CREATE TABLE common_code_master
(
  master_id   VARCHAR(20)  NULL     COMMENT '마스터 코드',
  master_name VARCHAR(100) NOT NULL COMMENT '마스터명',
  description TEXT         NULL     COMMENT '설명',
  use_yn      CHAR(1)      NULL     DEFAULT Y COMMENT '사용여부',
  created_at  DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at  DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  PRIMARY KEY (master_id)
) COMMENT '공통 코드 마스터';

CREATE TABLE developer_info
(
  developer_id                  VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  created_at                    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at                    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  developer_name                VARCHAR(100) NOT NULL COMMENT '이름',
  developer_birth               NUMERIC      NOT NULL COMMENT '생년월일',
  developer_sex                 VARCHAR(1)   NOT NULL COMMENT '성별',
  developer_email               VARCHAR(100) NOT NULL COMMENT '이메일',
  developer_phone               VARCHAR(20)  NULL     COMMENT '연락처',
  developer_addr                VARCHAR(250) NOT NULL COMMENT '주소',
  developer_profile_image       VARCHAR(255) NULL     COMMENT '프로필 이미지 URL',
  developer_start_date          DATE         NOT NULL COMMENT '입사일',
  developer_career_start_date   DATE         NULL     COMMENT '경력 시작일',
  developer_current_position    VARCHAR(50)  NOT NULL COMMENT '현재 직급/포지션',
  developer_grade               VARCHAR(20)  NOT NULL COMMENT '등급',
  developer_married             VARCHAR(1)   NULL     COMMENT '결혼여부',
  developer_military_start_date DATE         NULL     COMMENT '입대일',
  developer_military_end_date   DATE         NULL     COMMENT '제대일',
  developer_military_desc       VARCHAR(20)  NULL     COMMENT '역종,병과',
  developer_evaluation_code     VARCHAR(10)  NULL     COMMENT '평가등급',
  PRIMARY KEY (developer_id)
) COMMENT '개발자 정보';

ALTER TABLE developer_info
  ADD CONSTRAINT UQ_developer_email UNIQUE (developer_email);

CREATE TABLE developer_skill_info
(
  developer_id            VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  project_start_ym        VARCHAR(6)   NOT NULL COMMENT '시작년월',
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  project_name            VARCHAR(100) NULL     COMMENT '프로젝트명',
  project_practitioner_id VARCHAR(100) NULL     COMMENT '수행사 ID',
  project_client_id       VARCHAR(100) NULL     COMMENT '클라이언트 ID',
  role                    VARCHAR(50)  NULL     COMMENT '역할',
  project_end_ym          VARCHAR(6)   NULL     COMMENT '종료년월',
  project_skill_model     VARCHAR(100) NULL     COMMENT '기종',
  project_skill_os        VARCHAR(100) NULL     COMMENT 'OS',
  project_skill_language  VARCHAR(100) NULL     COMMENT '언어',
  project_skill_dbms      VARCHAR(100) NULL     COMMENT 'DBMS',
  project_skill_tool      VARCHAR(100) NULL     COMMENT '도구',
  project_skill_protocol  VARCHAR(100) NULL     COMMENT '통신',
  project_skill_etc       VARCHAR(100) NULL     COMMENT '기타',
  project_month           NUMERIC      NULL     COMMENT '프로젝트월수',
  project_id              VARCHAR(36)  NOT NULL COMMENT '프로젝트 ID',
  PRIMARY KEY (developer_id, project_start_ym)
) COMMENT '개발자-기술 매핑';

CREATE TABLE project_assignment_info
(
  project_id   VARCHAR(36) NOT NULL COMMENT '프로젝트 ID',
  developer_id VARCHAR(36) NULL     COMMENT '개발자 ID',
  created_at   DATETIME    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at   DATETIME    NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  role         VARCHAR(50) NULL     COMMENT '역할',
  start_date   DATE        NULL     COMMENT '투입 시작일',
  end_date     DATE        NULL     COMMENT '투입 종료일',
  status       VARCHAR(20) NULL     DEFAULT ACTIVE COMMENT '상태',
  PRIMARY KEY (project_id, developer_id)
) COMMENT '프로젝트 배정';

CREATE TABLE project_info
(
  project_id              VARCHAR(36)  NULL     COMMENT '프로젝트 ID',
  created_at              DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at              DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  project_name            VARCHAR(100) NOT NULL COMMENT '프로젝트명',
  project_start_date      DATE         NULL     COMMENT '시작일',
  project_end_date        DATE         NULL     COMMENT '종료일',
  project_status          VARCHAR(20)  NULL     DEFAULT PLANNING COMMENT '상태',
  project_client_id       VARCHAR(100) NULL     COMMENT '클라이언트 ID',
  project_practitioner_id VARCHAR(100) NULL     COMMENT '수행사 ID',
  project_pm_name         VARCHAR(36)  NULL     COMMENT '프로젝트 매니저명',
  project_skill_model     VARCHAR(36)  NULL     COMMENT '기종',
  project_skill_os        VARCHAR(36)  NULL     COMMENT 'OS',
  project_skill_language  VARCHAR(36)  NULL     COMMENT '언어',
  project_skill_dbms      VARCHAR(36)  NULL     COMMENT 'DBMS',
  project_skill_tool      VARCHAR(36)  NULL     COMMENT '도구',
  project_skill_protocol  VARCHAR(36)  NULL     COMMENT '통신',
  project_skill_etc       VARCHAR(36)  NULL     COMMENT '기타',
  project_description     TEXT         NULL     COMMENT '프로젝트 비고',
  PRIMARY KEY (project_id)
) COMMENT '프로젝트';

CREATE TABLE resume
(
  developer_id VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  created_at   DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at   DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  developer_id VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  file_path    VARCHAR(255) NOT NULL COMMENT '파일 경로',
  file_type    VARCHAR(10)  NULL     COMMENT '파일 형식',
  upload_date  DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 일시',
  version      INT          NULL     DEFAULT 1 COMMENT '버전',
  status       VARCHAR(20)  NULL     DEFAULT PENDING COMMENT '상태',
  PRIMARY KEY (developer_id)
) COMMENT '이력서';

CREATE TABLE school_info
(
  developer_id         VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  school_graduation_ym VARCHAR(6)   NULL     COMMENT '졸업년월',
  created_at           DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at           DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  school_name          VARCHAR(100) NOT NULL COMMENT '학교명',
  PRIMARY KEY (developer_id, school_graduation_ym)
) COMMENT '학교 정보';

CREATE TABLE work_info
(
  developer_id  VARCHAR(36)  NOT NULL COMMENT '개발자 ID',
  work_start_ym VARCHAR(6)   NULL     COMMENT '시작년월',
  created_at    DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  updated_at    DATETIME     NULL     DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
  work_end_ym   VARCHAR(6)   NULL     COMMENT '종료년월',
  work_name     VARCHAR(100) NOT NULL COMMENT '회사명',
  work_position VARCHAR(100) NULL     COMMENT '직위',
  work_task     VARCHAR(50)  NULL     COMMENT '담당업무',
  PRIMARY KEY (developer_id, work_start_ym)
) COMMENT '근무 이력 정보';

ALTER TABLE common_code_detail
  ADD CONSTRAINT FK_common_code_master_TO_common_code_detail
    FOREIGN KEY (master_id)
    REFERENCES common_code_master (master_id);

ALTER TABLE developer_skill_info
  ADD CONSTRAINT FK_developer_info_TO_developer_skill_info
    FOREIGN KEY (developer_id)
    REFERENCES developer_info (developer_id);

ALTER TABLE resume
  ADD CONSTRAINT FK_developer_info_TO_resume
    FOREIGN KEY (developer_id)
    REFERENCES developer_info (developer_id);

ALTER TABLE work_info
  ADD CONSTRAINT FK_developer_info_TO_work_info
    FOREIGN KEY (developer_id)
    REFERENCES developer_info (developer_id);

ALTER TABLE school_info
  ADD CONSTRAINT FK_developer_info_TO_school_info
    FOREIGN KEY (developer_id)
    REFERENCES developer_info (developer_id);

ALTER TABLE project_assignment_info
  ADD CONSTRAINT FK_project_info_TO_project_assignment_info
    FOREIGN KEY (project_id)
    REFERENCES project_info (project_id);

ALTER TABLE certification_info
  ADD CONSTRAINT FK_developer_info_TO_certification_info
    FOREIGN KEY (developer_id)
    REFERENCES developer_info (developer_id);
