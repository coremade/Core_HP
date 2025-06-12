import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '@/types/project';
import ModalWrapper from '../common/ModalWrapper';
import DateInput from '../common/DateInput';
import { formatDateForAPI } from '@/utils/projectUtils';

// ================================================================
// 타입 정의 영역
// ================================================================

/**
 * 프로젝트 상세/생성 모달 컴포넌트의 Props
 */
interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;                   // Optional for create mode
  onSave: (updatedProject: Project) => void;
  mode?: 'create' | 'view';                   // 'create' for new project, 'view' for existing project
}

/**
 * 새 프로젝트 생성 시 사용할 초기 데이터
 */
const initialProjectData: ProjectFormData = {
  project_name: '',
  project_start_date: '',
  project_end_date: '',
  project_description: '',
  project_client_id: '',
  project_practitioner_id: '',
  project_pm_name: '',
  project_status: 'PLANNING',
  project_skill_model: '',
  project_skill_os: '',
  project_skill_language: '',
  project_skill_dbms: '',
  project_skill_tool: '',
  project_skill_protocol: '',
  project_skill_etc: ''
};

// ================================================================
// 메인 컴포넌트
// ================================================================

/**
 * 프로젝트 상세보기/생성 통합 모달 컴포넌트
 * - 프로젝트 생성 모드: 새로운 프로젝트 생성
 * - 프로젝트 상세보기 모드: 기존 프로젝트 조회/수정/삭제
 * - 공통 UI/UX로 일관된 사용자 경험 제공
 */
const ProjectDetailModal = ({
  isOpen,
  onClose,
  project,
  onSave,
  mode = 'view',
}: ProjectDetailModalProps) => {
  // ================================================================
  // 상태 관리 영역
  // ================================================================
  
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [editData, setEditData] = useState<Project | ProjectFormData>(
    project || initialProjectData
  );

  // ================================================================
  // 생명주기 관리 영역
  // ================================================================
  
  /**
   * project prop 또는 mode 변경 시 editData 업데이트
   */
  useEffect(() => {
    if (mode === 'create') {
      setIsEditing(true);
      // 생성 모드일 때 기본 날짜 설정
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };
      
      setEditData({
        ...initialProjectData,
        project_start_date: formatDate(today),
        project_end_date: formatDate(nextMonth)
      });
    } else if (project) {
      setIsEditing(false);
      setEditData(project);
    }
  }, [project, mode]);

  // ================================================================
  // 이벤트 핸들러 영역
  // ================================================================
  
  /**
   * 입력 필드 변경 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 날짜 입력 필드 변경 핸들러
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (value.length === 8 && !value.includes('-')) {
      formattedValue = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    }
    
    setEditData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // ================================================================
  // 액션 함수 영역
  // ================================================================
  
  /**
   * 프로젝트 저장 (생성/수정)
   */
  const handleSave = async () => {
    try {
      if (mode === 'create') {
        // 새 프로젝트 생성
        const submissionData = {
          ...editData as ProjectFormData,
          project_start_date: formatDateForAPI((editData as ProjectFormData).project_start_date),
          project_end_date: formatDateForAPI((editData as ProjectFormData).project_end_date)
        };

        const response = await fetch('http://localhost:4000/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          throw new Error('프로젝트 생성에 실패했습니다.');
        }

        const newProject = await response.json();
        onSave(newProject);
        onClose();
      } else if (project) {
        // 기존 프로젝트 수정
        console.log('Updating project with ID:', project.project_id);
        console.log('Update data:', editData);

        const response = await fetch(`http://localhost:4000/api/projects/${project.project_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '프로젝트 수정에 실패했습니다.');
        }

        const updatedProject = await response.json();
        console.log('Updated project:', updatedProject);
        onSave(updatedProject);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error instanceof Error ? error.message : '프로젝트 저장에 실패했습니다.');
    }
  };

  /**
   * 프로젝트 삭제
   */
  const handleDelete = async () => {
    if (!project || !confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/projects/${project.project_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('프로젝트 삭제에 실패했습니다.');
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  /**
   * 편집 취소 핸들러
   */
  const handleCancelEdit = () => {
    if (mode === 'create') {
      onClose();
    } else if (project) {
      setEditData(project);
      setIsEditing(false);
    }
  };

  // ================================================================
  // 유틸리티 함수 영역
  // ================================================================
  
  /**
   * 모달 제목 생성
   */
  const getModalTitle = () => {
    if (mode === 'create') {
      return '새 프로젝트 생성';
    }
    return isEditing ? '프로젝트 수정' : project?.project_name || '프로젝트 상세';
  };

  // ================================================================
  // 렌더링 영역
  // ================================================================
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* ============================================================
          모달 헤더 영역 - 제목 및 닫기 버튼
          ============================================================ */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' || (isEditing && mode === 'view') ? (
            mode === 'create' ? '새 프로젝트 생성' : (
              <input
                type="text"
                name="project_name"
                value={(editData as any).project_name || ''}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            )
          ) : (
            project?.project_name || '프로젝트 상세'
          )}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">닫기</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ============================================================
              왼쪽 패널 - 기본 정보 영역
              ============================================================ */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기본 정보</h3>
            <div className="space-y-4">
              {/* 생성 모드에서만 표시되는 프로젝트명 입력 */}
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트명</label>
                  <input
                    type="text"
                    name="project_name"
                    value={(editData as ProjectFormData).project_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              )}
              
              {/* 기본 정보 필드들 */}
              {[
                { label: '클라이언트', field: 'project_client_id' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '수행사', field: 'project_practitioner_id' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '프로젝트 매니저', field: 'project_pm_name' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { 
                  label: '시작일', 
                  field: 'project_start_date' as keyof Omit<Project, 'developers' | 'developer_count'>,
                  type: 'date',
                  isDate: true 
                },
                { 
                  label: '종료일', 
                  field: 'project_end_date' as keyof Omit<Project, 'developers' | 'developer_count'>,
                  type: 'date',
                  isDate: true 
                },
                {
                  label: '상태',
                  field: 'project_status' as keyof Omit<Project, 'developers' | 'developer_count'>,
                  type: 'select',
                  options: [
                    { value: 'PLANNING', label: '계획중' },
                    { value: 'IN_PROGRESS', label: '진행중' },
                    { value: 'COMPLETED', label: '완료' },
                    { value: 'ON_HOLD', label: '보류' }
                  ]
                }
              ].map(({ label, field, type, isDate, options }) => (
                <div key={field}>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
                  {isEditing ? (
                    isDate ? (
                      <DateInput
                        name={field}
                        value={(editData as any)?.[field] || ''}
                        onChange={handleDateChange}
                        label={label}
                        required={mode === 'create'}
                      />
                    ) : type === 'select' ? (
                      <select
                        name={field}
                        value={(editData as any)?.[field] || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required={mode === 'create'}
                      >
                        {options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={(editData as any)?.[field] || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {type === 'select' ? 
                        options?.find(opt => opt.value === (project as any)?.[field])?.label || '-' :
                        (project as any)?.[field] || '-'
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================
              오른쪽 패널 - 기술 스택 영역
              ============================================================ */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기술 스택</h3>
            <div className="space-y-4">
              {[
                { label: '기종', field: 'project_skill_model' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '운영체제', field: 'project_skill_os' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '프로그래밍 언어', field: 'project_skill_language' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: 'DBMS', field: 'project_skill_dbms' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '개발 도구', field: 'project_skill_tool' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '통신 프로토콜', field: 'project_skill_protocol' as keyof Omit<Project, 'developers' | 'developer_count'> },
                { label: '기타', field: 'project_skill_etc' as keyof Omit<Project, 'developers' | 'developer_count'> },
              ].map(({ label, field }) => (
                <div key={field}>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={(editData as any)?.[field] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {(project as any)?.[field] || '-'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================
            프로젝트 설명 영역
            ============================================================ */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">프로젝트 설명</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {isEditing ? (
              <textarea
                name="project_description"
                value={(editData as any).project_description || ''}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {project?.project_description || '-'}
              </p>
            )}
          </div>
        </div>

        {/* ============================================================
            모달 푸터 영역 - 액션 버튼들
            ============================================================ */}
        <div className="mt-8 flex justify-between items-center">
          {/* 왼쪽: 삭제 버튼 (view 모드에서만 표시) */}
          {mode === 'view' && !isEditing && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              삭제
            </button>
          )}

          {/* 오른쪽: 편집/저장/취소 버튼들 */}
          <div className="flex space-x-3 ml-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {mode === 'create' ? '생성' : '저장'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  수정
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ProjectDetailModal; 