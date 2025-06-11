'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { Project, ProjectFormData, ProjectDeveloper, SearchParams, PaginationInfo } from '@/types/project';
import { initializeProjectDeveloperDates, formatDateForAPI, formatDateForDisplay } from '@/utils/projectUtils';
import { useSearchStore } from '@/store/searchStore';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  selectedDevelopers: ExtendedProjectDeveloper[];
  setSelectedDevelopers: Dispatch<SetStateAction<ExtendedProjectDeveloper[]>>;
  onAddDeveloper: (developer: ProjectDeveloper) => void;
  onRemoveDeveloper: (developerId: string) => void;
  fetchProjectDevelopers: (projectId: string) => Promise<void>;
}

interface SearchState {
  query: string;
  page: number;
  developers: ProjectDeveloper[];
  hasMore: boolean;
  isSearching: boolean;
}

const initialFormData: ProjectFormData = {
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

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper = ({ isOpen, onClose, children }: ModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-hidden cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProjectDetailModal = ({
  isOpen,
  onClose,
  project,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (updatedProject: Project) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Project>(project);

  // project prop이 변경될 때 editData 업데이트
  useEffect(() => {
    setEditData(project);
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSave = async () => {
    try {
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
    } catch (error) {
      console.error('Error updating project:', error);
      alert(error instanceof Error ? error.message : '프로젝트 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
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

  const handleCancelEdit = () => {
    setEditData(project);
    setIsEditing(false);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? (
            <input
              type="text"
              name="project_name"
              value={editData.project_name}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          ) : (
            project.project_name
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
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기본 정보</h3>
            <div className="space-y-4">
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
                        value={editData?.[field]}
                        onChange={handleDateChange}
                        label={label}
                        required
                      />
                    ) : type === 'select' ? (
                      <select
                        name={field}
                        value={editData?.[field] || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        value={editData?.[field] || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    )
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {type === 'select' ? 
                        options?.find(opt => opt.value === project[field])?.label || '-' :
                        project[field] || '-'
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

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
                      value={editData?.[field] || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {project[field] || '-'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">프로젝트 설명</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {isEditing ? (
              <textarea
                name="project_description"
                value={editData.project_description}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {project.project_description || '-'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          {/* 왼쪽: 삭제 버튼 */}
          {!isEditing && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              삭제
            </button>
          )}

          {/* 오른쪽: 나머지 버튼들 */}
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  저장
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

interface DateInputProps {
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false,
  disabled = false 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState('');

  // 날짜 유효성 검사
  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 8) {
      setDisplayValue(val);
    }
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    
    if (!val) {
      onChange({ ...e, target: { ...e.target, name, value: '' } });
      setDisplayValue('');
      return;
    }

    if (val.length === 8) {
      const formattedDate = formatDateForAPI(val);
      if (formattedDate && isValidDate(formattedDate)) {
        onChange({ ...e, target: { ...e.target, name, value: val } });
        setDisplayValue(val);
      } else {
        alert('올바른 날짜를 입력해주세요.');
        setDisplayValue(formatDateForDisplay(value?.toString()));
      }
    } else if (val.length > 0) {
      alert('YYYYMMDD 형식으로 입력해주세요.');
      setDisplayValue(formatDateForDisplay(value?.toString()));
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const yyyymmdd = formatDateForDisplay(selectedDate);
      setDisplayValue(yyyymmdd);
      onChange({ ...e, target: { ...e.target, name, value: yyyymmdd } });
    }
  };

  // value가 변경될 때 displayValue 업데이트
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value?.toString()));
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={displayValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="YYYYMMDD"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          required={required}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <input
            type="date"
            value={value ? formatDateForAPI(value.toString()) : ''}
            onChange={handleDateSelect}
            className={`absolute opacity-0 w-full h-full cursor-pointer ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
            disabled={disabled}
          />
          <svg className={`h-5 w-5 text-gray-400 pointer-events-none ${
            disabled ? 'opacity-50' : ''
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// 개월 수 계산 함수 추가
const calculateMonths = (startDate?: string, endDate?: string): number | undefined => {
  if (!startDate || !endDate) return undefined;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  return months > 0 ? months : undefined;
};

// ExtendedProjectDeveloper 인터페이스 수정
interface ExtendedProjectDeveloper extends ProjectDeveloper {
  isMarkedForDeletion?: boolean;
  isNewlyAdded?: boolean;
  start_date?: string;
  end_date?: string;
  task?: string;
}

// 개발자 배정 모달 컴포넌트
const AssignmentModal = ({
  isOpen,
  onClose,
  project,
  selectedDevelopers,
  setSelectedDevelopers,
  onAddDeveloper,
  onRemoveDeveloper,
  fetchProjectDevelopers
}: AssignmentModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchState, searchDevelopers } = useSearchStore();

  // 검색 초기화를 위한 useEffect
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      searchDevelopers({ developer_name: '' }, 1);
    }
  }, [isOpen, searchDevelopers]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단에 도달했는지 확인 (여유 공간 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50 && searchState.hasMore && !searchState.isSearching) {
      searchDevelopers({ 
        developer_name: searchQuery 
      }, searchState.page + 1);
    }
  }, [searchQuery, searchState.hasMore, searchState.isSearching, searchState.page, searchDevelopers]);

  // 선택되지 않은 개발자만 필터링하는 함수
  const filteredDevelopers = useMemo(() => 
    searchState.developers.filter(developer => 
      !selectedDevelopers.some(selected => selected.developer_id === developer.developer_id)
    ),
    [searchState.developers, selectedDevelopers]
  );

  const hasUnsavedChanges = useMemo(() => {
    const hasAddedDevelopers = selectedDevelopers.some(dev => dev.isNewlyAdded);
    const hasRemovedDevelopers = selectedDevelopers.some(dev => dev.isMarkedForDeletion);
    return hasAddedDevelopers || hasRemovedDevelopers;
  }, [selectedDevelopers]);

  const handleCloseModal = useCallback(() => {
    if (hasUnsavedChanges) {
      const message = `저장되지 않은 변경사항이 있습니다. 정말로 닫으시겠습니까?`;
      if (!confirm(message)) {
        return;
      }
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  const handleSaveAssignments = async () => {
    if (!project) return;

    // 변경사항이 있는지 확인
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    const addedDevelopers = selectedDevelopers.filter(dev => dev.isNewlyAdded);
    const removedDevelopers = selectedDevelopers.filter(dev => dev.isMarkedForDeletion);

    const confirmMessage = `다음 변경사항을 저장하시겠습니까?\n` +
      `- 추가될 개발자: ${addedDevelopers.length}명\n` +
      `- 제외될 개발자: ${removedDevelopers.length}명`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const assignments = selectedDevelopers
        .filter(developer => !developer.isMarkedForDeletion || developer.isNewlyAdded)
        .map(developer => ({
          project_id: project.project_id,
          developer_id: developer.developer_id,
          task: developer.task || '',
          start_date: formatDateForAPI(developer.start_date),
          end_date: formatDateForAPI(developer.end_date),
          status: 'ACTIVE'
        }));

      const response = await fetch(`http://localhost:4000/api/projects/${project.project_id}/assignments/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        throw new Error('개발자 배정 저장에 실패했습니다.');
      }

      await fetchProjectDevelopers(project.project_id);
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('개발자 배정 저장에 실패했습니다.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleCloseModal}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          개발자 배정 관리 - {project.project_name}
        </h2>
        <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">닫기</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* 개발자 검색 */}
          <div>
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                개발자 검색
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchDevelopers({ developer_name: e.target.value }, 1);
                  }}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이름, 기술스택, 업무로 검색"
                />
              </div>
            </div>

            <div 
              className="overflow-y-auto h-[32rem] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              onScroll={handleScroll}
            >
              {searchState.isSearching && (
                <div className="sticky top-0 z-10 flex justify-center py-2 bg-gray-50 dark:bg-gray-700">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
              {filteredDevelopers.map((developer) => (
                <div
                  key={developer.developer_id}
                  className="p-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 group relative"
                >
                  {/* 1번째 라인: 이름, 전화번호, 이메일 */}
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {developer.developer_name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {developer.developer_phone}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {developer.developer_email}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onAddDeveloper(developer);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* 2번째 라인: 등급, 업무, 기술 스펙 */}
                      <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {developer.developer_grade}
                        </span>
                        {developer.task && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {developer.task}
                          </span>
                        )}
                        {developer.project_skill_language && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {developer.project_skill_language}
                          </span>
                        )}
                        {developer.project_skill_dbms && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {developer.project_skill_dbms}
                          </span>
                        )}
                        {developer.project_skill_tool && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {developer.project_skill_tool}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 개발자 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              선택된 개발자
            </h3>
            <div className="overflow-y-auto h-[32rem] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
              {selectedDevelopers.map((developer) => (
                <div
                  key={developer.developer_id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-600 group relative ${
                    developer.isMarkedForDeletion 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : developer.isNewlyAdded
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : ''
                  }`}
                >
                  {/* 1번째 라인: 이름, 전화번호, 이메일 */}
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h3 className={`text-sm font-medium text-gray-900 dark:text-white ${
                            developer.isMarkedForDeletion ? 'line-through' : ''
                          }`}>
                            {developer.developer_name}
                          </h3>
                          <span className={`text-sm text-gray-500 dark:text-gray-400 ${
                            developer.isMarkedForDeletion ? 'line-through' : ''
                          }`}>
                            {developer.developer_phone}
                          </span>
                          <span className={`text-sm text-gray-500 dark:text-gray-400 ${
                            developer.isMarkedForDeletion ? 'line-through' : ''
                          }`}>
                            {developer.developer_email}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onRemoveDeveloper(developer.developer_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {developer.isMarkedForDeletion ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* 2번째 라인: 등급, 업무, 기술 스펙 */}
                      <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {developer.developer_grade}
                        </span>
                        {developer.task && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {developer.task}
                          </span>
                        )}
                        {developer.project_skill_language && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {developer.project_skill_language}
                          </span>
                        )}
                        {developer.project_skill_dbms && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {developer.project_skill_dbms}
                          </span>
                        )}
                        {developer.project_skill_tool && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {developer.project_skill_tool}
                          </span>
                        )}
                      </div>

                      {/* 3번째 라인: 투입기간 */}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            업무
                          </label>
                          <input
                            type="text"
                            value={developer.task || ''}
                            onChange={(e) => {
                              const updatedDevelopers = selectedDevelopers.map(d => 
                                d.developer_id === developer.developer_id 
                                  ? { ...d, task: e.target.value }
                                  : d
                              );
                              setSelectedDevelopers(updatedDevelopers);
                            }}
                            disabled={developer.isMarkedForDeletion}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              developer.isMarkedForDeletion ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            placeholder="업무 입력"
                          />
                        </div>
                        <DateInput
                          name="start_date"
                          value={developer.start_date}
                          onChange={(e) => {
                            const updatedDevelopers = selectedDevelopers.map(d => 
                              d.developer_id === developer.developer_id 
                                ? { ...d, start_date: e.target.value }
                                : d
                            );
                            setSelectedDevelopers(updatedDevelopers);
                          }}
                          disabled={developer.isMarkedForDeletion}
                          label="투입 시작일"
                        />
                        <DateInput
                          name="end_date"
                          value={developer.end_date}
                          onChange={(e) => {
                            const updatedDevelopers = selectedDevelopers.map(d => 
                              d.developer_id === developer.developer_id 
                                ? { ...d, end_date: e.target.value }
                                : d
                            );
                            setSelectedDevelopers(updatedDevelopers);
                          }}
                          disabled={developer.isMarkedForDeletion}
                          label="투입 종료일"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 저장 버튼 */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSaveAssignments}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            저장
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({
    project_name: '',
    project_start_date: '',
    project_end_date: '',
    project_status: '',
    page: 1,
    limit: 5
  });
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Project | null>(null);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState<Project | null>(null);
  const [projectDevelopers, setProjectDevelopers] = useState<ProjectDeveloper[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [searchDevelopers, setSearchDevelopers] = useState<ProjectDeveloper[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<ExtendedProjectDeveloper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [isFirstScroll, setIsFirstScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { searchState, searchDevelopers: searchDevelopersStore } = useSearchStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 검색 필드의 임시 상태를 저장할 state 추가
  const [searchFields, setSearchFields] = useState({
    project_name: '',
    project_start_date: '',
    project_end_date: '',
    project_status: '',
    project_skill_language: ''
  });

  const fetchProjects = useCallback(async (params = searchParams) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`http://localhost:4000/api/projects?${queryParams}`);
      if (!response.ok) {
        throw new Error('프로젝트 데이터를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setProjects(data.projects);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems,
        itemsPerPage: data.itemsPerPage
      });
    } catch (error) {
      console.error('프로젝트 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === pagination.currentPage) return;
    fetchProjects({
      ...searchParams,
      page: newPage
    });
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  }, [pagination.currentPage, searchParams, fetchProjects]);

  useEffect(() => {
    // 초기 로딩 시에만 실행
    fetchProjects();
  }, [fetchProjects]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    const newParams = {
      ...searchParams,
      page: 1,
      limit: newLimit
    };
    fetchProjects(newParams);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = {
      ...searchParams,
      ...searchFields,
      page: 1
    };
    fetchProjects(newParams);
    setSearchParams(newParams);
  };

  const handleViewDetail = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('프로젝트 상세 정보를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setSelectedProject(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert('프로젝트 상세 정보를 가져오는데 실패했습니다.');
    }
  };

  const handleCreateProject = async () => {
    setShowModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
  };

  const handleEdit = () => {
    if (selectedProject) {
      setEditData({...selectedProject});
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!editData || !selectedProject) return;

    try {
      const response = await fetch(`http://localhost:4000/api/projects/${selectedProject.project_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('프로젝트 수정에 실패했습니다.');
      }

      setSelectedProject(editData);
      setIsEditing(false);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('프로젝트 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    if (selectedProject) {
      setEditData({...selectedProject});
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 날짜 형식 변환
      const submissionData = {
        ...formData,
        project_start_date: formatDateForAPI(formData.project_start_date),
        project_end_date: formatDateForAPI(formData.project_end_date)
      };

      const response = await fetch('http://localhost:4000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        handleCloseCreateModal();
        fetchProjects();
      } else {
        throw new Error('프로젝트 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedProject || !confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/projects/${selectedProject.project_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('프로젝트 삭제에 실패했습니다.');
      }

      setShowDetailModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  const fetchProjectDevelopers = useCallback(async (projectId: string) => {
    const targetProject = projects.find(p => p.project_id === projectId);
    if (!targetProject) {
      console.error('Project not found');
      return;
    }
    
    try {
      setLoadingDevelopers(true);
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/developers`);
      if (!response.ok) {
        throw new Error('개발자 목록을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      
      // 기존 개발자들을 선택된 개발자 목록에 추가
      const initializedDevelopers = data.map((dev: ProjectDeveloper) => ({
        ...dev,
        isMarkedForDeletion: false,
        isNewlyAdded: false,
        start_date: dev.start_date || targetProject.project_start_date,
        end_date: dev.end_date || targetProject.project_end_date
      }));
      
      setProjectDevelopers(data);
      setSelectedDevelopers(initializedDevelopers);
    } catch (error) {
      console.error('Error fetching project developers:', error);
      alert('개발자 목록을 가져오는데 실패했습니다.');
    } finally {
      setLoadingDevelopers(false);
    }
  }, [projects]);

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProjectForAssignment(project);
    fetchProjectDevelopers(project.project_id);
  }, [fetchProjectDevelopers]);

  const handleCloseAssignmentModal = useCallback(() => {
    setShowAssignmentModal(false);
    setSearchQuery('');
    setCurrentPage(1);
    setHasMore(false);
  }, []);

  const handleShowAssignmentModal = useCallback(() => {
    if (!selectedProjectForAssignment) return;
    setShowAssignmentModal(true);
    setSearchQuery('');
    setCurrentPage(1);
    searchDevelopersStore({}, 1);
  }, [selectedProjectForAssignment, searchDevelopersStore]);

  const handleAddDeveloper = useCallback((developer: ProjectDeveloper) => {
    if (!selectedProjectForAssignment) return;

    setSelectedDevelopers(prev => {
      if (prev.some(d => d.developer_id === developer.developer_id)) {
        return prev;
      }
      return [...prev, { 
        ...developer, 
        isNewlyAdded: true, 
        isMarkedForDeletion: false,
        start_date: selectedProjectForAssignment.project_start_date,
        end_date: selectedProjectForAssignment.project_end_date
      }];
    });
  }, [selectedProjectForAssignment]);

  const handleRemoveDeveloper = useCallback((developerId: string) => {
    setSelectedDevelopers(prev => {
      const developer = prev.find(d => d.developer_id === developerId);
      if (developer?.isNewlyAdded) {
        return prev.filter(d => d.developer_id !== developerId);
      }
      return prev.map(dev => 
        dev.developer_id === developerId 
          ? { ...dev, isMarkedForDeletion: !dev.isMarkedForDeletion }
          : dev
      );
    });
  }, []);

  const handleModalOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseAssignmentModal();
    }
  };

  const handleModalInsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단에 도달했는지 확인
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (isFirstScroll && hasMore && !isSearching) {
        // 처음 하단에 도달했을 때 화살표만 표시
        setShowArrow(true);
        setIsFirstScroll(false);
      } else if (!isFirstScroll && hasMore && !isSearching) {
        // 두 번째 이후 스크롤에서 데이터 로드
        searchDevelopersStore({ 
          developer_name: searchQuery 
        }, currentPage + 1);
        setShowArrow(false);
      }
    }
  };

  // 화살표 클릭 핸들러
  const handleArrowClick = () => {
    searchDevelopersStore({ 
      developer_name: searchQuery 
    }, currentPage + 1);
    setShowArrow(false);
  };

  useEffect(() => {
    const isAnyModalOpen = showModal || showDetailModal || showAssignmentModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDetailModal, showAssignmentModal]);

  const CreateProjectModal = useMemo(() => {
    if (!showModal) return null;
    
    return (
      <ModalWrapper isOpen={showModal} onClose={handleCloseCreateModal}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">새 프로젝트 생성</h2>
          <button onClick={handleCloseCreateModal} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">닫기</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트명</label>
                    <input
                      type="text"
                      name="project_name"
                      value={formData.project_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <DateInput
                    name="project_start_date"
                    value={formData.project_start_date}
                    onChange={handleChange}
                    label="시작일"
                    required
                  />
                  <DateInput
                    name="project_end_date"
                    value={formData.project_end_date}
                    onChange={handleChange}
                    label="종료 예정일"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">클라이언트 ID</label>
                    <input
                      type="text"
                      name="project_client_id"
                      value={formData.project_client_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">수행사 ID</label>
                    <input
                      type="text"
                      name="project_practitioner_id"
                      value={formData.project_practitioner_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트 매니저명</label>
                    <input
                      type="text"
                      name="project_pm_name"
                      value={formData.project_pm_name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">상태</label>
                    <select
                      name="project_status"
                      value={formData.project_status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="PLANNING">계획중</option>
                      <option value="IN_PROGRESS">진행중</option>
                      <option value="COMPLETED">완료</option>
                      <option value="ON_HOLD">보류</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기술 스택</h3>
                <div className="space-y-4">
                  {[
                    { label: '기종', field: 'project_skill_model' as keyof ProjectFormData },
                    { label: '운영체제', field: 'project_skill_os' as keyof ProjectFormData },
                    { label: '프로그래밍 언어', field: 'project_skill_language' as keyof ProjectFormData },
                    { label: 'DBMS', field: 'project_skill_dbms' as keyof ProjectFormData },
                    { label: '개발 도구', field: 'project_skill_tool' as keyof ProjectFormData },
                    { label: '통신 프로토콜', field: 'project_skill_protocol' as keyof ProjectFormData },
                    { label: '기타', field: 'project_skill_etc' as keyof ProjectFormData },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field as keyof ProjectFormData]}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">프로젝트 설명</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <textarea
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    );
  }, [showModal, formData, handleSubmit, handleChange]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    fetchProjects();
  };

  useEffect(() => {
    // 프로젝트 생성 모달이 열릴 때 start_date와 end_date 설정
    if (showModal && !formData.project_start_date) {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };
      
      setFormData(prev => ({
        ...prev,
        project_start_date: formatDate(today),
        project_end_date: formatDate(nextMonth)
      }));
    }
  }, [showModal, formData.project_start_date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex justify-center items-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            프로젝트 관리
          </h1>
          <button 
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            프로젝트 생성
          </button>
        </div>

        <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트명</label>
                <input
                  type="text"
                  name="project_name"
                  value={searchFields.project_name}
                  onChange={handleSearch}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">기술스택</label>
                <input
                  type="text"
                  name="project_skill_language"
                  value={searchFields.project_skill_language}
                  onChange={handleSearch}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="언어, DBMS, 도구 등"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <DateInput
                name="project_start_date"
                value={searchFields.project_start_date}
                onChange={handleSearch}
                label="시작일"
              />
              <DateInput
                name="project_end_date"
                value={searchFields.project_end_date}
                onChange={handleSearch}
                label="종료일"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">상태</label>
                <select
                  name="project_status"
                  value={searchFields.project_status}
                  onChange={handleSearch}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">전체</option>
                  <option value="PLANNING">계획중</option>
                  <option value="IN_PROGRESS">진행중</option>
                  <option value="COMPLETED">완료</option>
                  <option value="ON_HOLD">보류</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                검색
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.project_id} 
                  className={`bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    selectedProjectForAssignment?.project_id === project.project_id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleProjectClick(project)}
                >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 w-full">
                    <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.project_name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        시작일: {new Date(project.project_start_date).toLocaleDateString()} | 
                        종료 예정일: {new Date(project.project_end_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {project.project_status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        개발자 {project.developer_count || 0}명
                      </span>
                    </div>
                  </div>

                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(project.project_id);
                        }}
                        className="whitespace-nowrap inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center">
                <select
                  value={searchParams.limit}
                  onChange={handleLimitChange}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="5">5건</option>
                  <option value="10">10건</option>
                  <option value="20">20건</option>
                  <option value="50">50건</option>
                </select>
              </div>
              <nav className="flex items-center justify-center flex-wrap gap-1 max-w-full overflow-x-auto" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  이전
                </button>
                
                {[...Array(pagination.totalPages || 1)].map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === (pagination.totalPages || 1) ||
                    (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button 
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md min-w-[2rem] justify-center ${
                          pagination.currentPage === pageNumber
                            ? 'z-10 bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === pagination.currentPage - 2 && pageNumber > 1) ||
                    (pageNumber === pagination.currentPage + 2 && pageNumber < (pagination.totalPages || 1))
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === (pagination.totalPages || 1)}
                  className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pagination.currentPage === (pagination.totalPages || 1)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  다음
                </button>
              </nav>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {selectedProjectForAssignment ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedProjectForAssignment.project_name} - 개발자 배정 현황
                  </h2>
                  <button
                    onClick={() => handleShowAssignmentModal()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    개발자 추가
                    </button>
                  </div>

                {loadingDevelopers ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
                  </div>
                ) : projectDevelopers.length > 0 ? (
                  <div 
                    className="space-y-4 cursor-pointer transition-all hover:opacity-90"
                    onClick={() => handleShowAssignmentModal()}
                  >
                    {projectDevelopers.map((developer) => (
                      <div key={developer.developer_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {developer.developer_name}
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {developer.developer_phone}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {developer.developer_email}
                                </span>
                              </div>
                            </div>

                            {/* 2번째 라인: 등급, 업무, 기술 스펙 */}
                            <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {developer.developer_grade}
                              </span>
                              {developer.task && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {developer.task}
                                </span>
                              )}
                              {developer.project_skill_language && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  {developer.project_skill_language}
                                </span>
                              )}
                              {developer.project_skill_dbms && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  {developer.project_skill_dbms}
                                </span>
                              )}
                              {developer.project_skill_tool && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  {developer.project_skill_tool}
                                </span>
                              )}
                            </div>

                            {/* 3번째 라인: 투입기간 */}
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              투입기간: {developer.start_date} ~ {developer.end_date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center h-64 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    onClick={() => handleShowAssignmentModal()}
                  >
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      배정된 개발자가 없습니다
                  </div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                  </div>
                  </div>
                )}
                  </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                프로젝트를 선택하여 개발자 배정 현황을 확인하세요
                  </div>
            )}
          </div>
        </div>

        {CreateProjectModal}
        {showDetailModal && selectedProject && (
          <ProjectDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            project={selectedProject}
            onSave={handleProjectUpdate}
          />
        )}
        {showAssignmentModal && selectedProjectForAssignment && (
          <AssignmentModal
            isOpen={showAssignmentModal}
            onClose={handleCloseAssignmentModal}
            project={selectedProjectForAssignment}
            selectedDevelopers={selectedDevelopers}
            setSelectedDevelopers={setSelectedDevelopers}
            onAddDeveloper={handleAddDeveloper}
            onRemoveDeveloper={handleRemoveDeveloper}
            fetchProjectDevelopers={fetchProjectDevelopers}
          />
        )}
      </div>
    </div>
  );
}
