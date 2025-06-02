'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

interface Project {
  project_id: string;
  project_name: string;
  project_status: string;
  project_start_date: string;
  project_end_date: string;
  project_description: string;
  project_client_id: string;
  project_practitioner_id: string;
  project_pm_name: string;
  project_skill_model: string;
  project_skill_os: string;
  project_skill_language: string;
  project_skill_dbms: string;
  project_skill_tool: string;
  project_skill_protocol: string;
  project_skill_etc: string;
  developer_count: number;
}

interface ProjectFormData {
  project_name: string;
  project_start_date: string;
  project_end_date: string;
  project_description: string;
  project_client_id: string;
  project_practitioner_id: string;
  project_pm_name: string;
  project_skill_model: string;
  project_skill_os: string;
  project_skill_language: string;
  project_skill_dbms: string;
  project_skill_tool: string;
  project_skill_protocol: string;
  project_skill_etc: string;
}

interface SearchParams {
  project_name?: string;
  project_start_date?: string;
  project_end_date?: string;
  project_status?: string;
  page?: number;
  limit?: number;
  developer_name?: string;
  task?: string;
  project_skill_language?: string;
  project_skill_dbms?: string;
  project_skill_tool?: string;
  project_skill_protocol?: string;
  project_skill_etc?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface Developer {
  developer_id: string;
  developer_name: string;
  developer_grade?: string;
  developer_email?: string;
  developer_phone?: string;
  task?: string;
  start_date?: string;
  end_date?: string;
  project_skill_language?: string;
  project_skill_dbms?: string;
  project_skill_tool?: string;
  project_skill_protocol?: string;
  project_skill_etc?: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  developers: Developer[];
  selectedDevelopers: Developer[];
  setSelectedDevelopers: (developers: Developer[]) => void;
  onAddDeveloper: (developer: Developer) => void;
  onRemoveDeveloper: (developerId: string) => void;
  onSearch: (params: SearchParams, page: number) => void;
  isSearching: boolean;
  hasMore: boolean;
  showArrow: boolean;
  onLoadMore: () => void;
  isFirstScroll: boolean;
  onScrollStateChange: (isFirst: boolean) => void;
}

const initialFormData: ProjectFormData = {
    project_name: '',
    project_start_date: new Date().toISOString().split('T')[0],
    project_end_date: '',
    project_description: '',
    project_client_id: '',
    project_practitioner_id: '',
    project_pm_name: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${project.project_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('프로젝트 수정에 실패했습니다.');
      }

      onSave(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('프로젝트 수정에 실패했습니다.');
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
                { label: '클라이언트', field: 'project_client_id' },
                { label: '수행사', field: 'project_practitioner_id' },
                { label: '프로젝트 매니저', field: 'project_pm_name' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={editData[field as keyof Project]}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {project[field as keyof Project] || '-'}
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
                { label: '기종', field: 'project_skill_model' },
                { label: '운영체제', field: 'project_skill_os' },
                { label: '프로그래밍 언어', field: 'project_skill_language' },
                { label: 'DBMS', field: 'project_skill_dbms' },
                { label: '개발 도구', field: 'project_skill_tool' },
                { label: '통신 프로토콜', field: 'project_skill_protocol' },
                { label: '기타', field: 'project_skill_etc' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field}
                      value={editData[field as keyof Project]}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {project[field as keyof Project] || '-'}
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

        <div className="mt-8 flex justify-end space-x-3">
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
    </ModalWrapper>
  );
};

// 개발자 배정 모달 컴포넌트
const AssignmentModal = ({
  isOpen,
  onClose,
  project,
  developers,
  selectedDevelopers,
  setSelectedDevelopers,
  onAddDeveloper,
  onRemoveDeveloper,
  onSearch,
  isSearching,
  hasMore,
  showArrow,
  onLoadMore,
  isFirstScroll,
  onScrollStateChange,
}: AssignmentModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch({ developer_name: query }, 1);  // 페이지 1부터 다시 검색
  };

  // 선택되지 않은 개발자만 필터링하는 함수
  const filteredDevelopers = useMemo(() => 
    developers.filter(
      developer => !selectedDevelopers.some(
        selected => selected.developer_id === developer.developer_id
      )
    ),
    [developers, selectedDevelopers]
  );

  const handleAddDeveloper = (developer: Developer) => {
    setSelectedDevelopers([...selectedDevelopers, developer]);
  };

  const handleRemoveDeveloper = (developerId: string) => {
    setSelectedDevelopers(selectedDevelopers.filter(d => d.developer_id !== developerId));
  };

  const handleSaveAssignments = async () => {
    try {
      // 각 선택된 개발자에 대해 배정 요청
      for (const developer of selectedDevelopers) {
        await fetch(`http://192.168.0.61:4000/api/projects/${project.project_id}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developer_id: developer.developer_id,
            task: developer.task || '',
            start_date: developer.start_date || null,
            end_date: developer.end_date || null
          }),
        });
      }
      
      alert('개발자 배정이 완료되었습니다.');
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('개발자 배정 중 오류가 발생했습니다.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          개발자 배정 관리 - {project.project_name}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
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
                  onChange={handleSearch}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="이름, 기술스택, 업무로 검색"
                />
              </div>
            </div>

            <div 
              className="overflow-y-auto h-[32rem] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 relative"
              onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                // 스크롤이 하단에 도달했는지 확인 (여유 공간 50px)
                if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isSearching) {
                  onLoadMore();
                }
              }}
            >
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
                          onClick={() => onAddDeveloper(developer)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* 2번째 라인: 등급, 업무, 기술 스펙 */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {developer.developer_grade && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {developer.developer_grade}
                          </span>
                        )}
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-300 mx-auto"></div>
                </div>
              )}
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
                  className="p-4 border-b border-gray-200 dark:border-gray-600 group relative"
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
                          onClick={() => onRemoveDeveloper(developer.developer_id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                      </div>

                      {/* 2번째 라인: 등급 */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {developer.developer_grade && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {developer.developer_grade}
                          </span>
                        )}
                      </div>

                      {/* 3번째 라인: 업무, 투입일자 */}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="업무 입력"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            투입 시작일
                          </label>
                          <input
                            type="date"
                            value={developer.start_date || ''}
                            onChange={(e) => {
                              const updatedDevelopers = selectedDevelopers.map(d => 
                                d.developer_id === developer.developer_id 
                                  ? { ...d, start_date: e.target.value }
                                  : d
                              );
                              setSelectedDevelopers(updatedDevelopers);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            투입 종료일
                          </label>
                          <input
                            type="date"
                            value={developer.end_date || ''}
                            onChange={(e) => {
                              const updatedDevelopers = selectedDevelopers.map(d => 
                                d.developer_id === developer.developer_id 
                                  ? { ...d, end_date: e.target.value }
                                  : d
                              );
                              setSelectedDevelopers(updatedDevelopers);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
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
            onClick={onClose}
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
    limit: 10
  });
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Project | null>(null);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState<Project | null>(null);
  const [projectDevelopers, setProjectDevelopers] = useState<Developer[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [searchDevelopers, setSearchDevelopers] = useState<Developer[]>([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState<Developer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [isFirstScroll, setIsFirstScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`http://192.168.0.61:4000/api/projects?${queryParams}`);
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
  };

  const handlePageChange = useCallback((newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      [name]: value
    }));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      limit: newLimit
    }));
  };

  const handleViewDetail = async (projectId: string) => {
    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${projectId}`);
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

  useEffect(() => {
    fetchProjects();
  }, [searchParams]);

  const handleCreateProject = async () => {
    setShowModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowModal(false);
    setFormData(initialFormData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (isEditing) {
      setEditData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${selectedProject.project_id}`, {
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
      const response = await fetch('http://192.168.0.61:4000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${selectedProject.project_id}`, {
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

  const fetchProjectDevelopers = async (projectId: string) => {
    try {
      setLoadingDevelopers(true);
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${projectId}/developers`);
      if (!response.ok) {
        throw new Error('개발자 목록을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setProjectDevelopers(data);
    } catch (error) {
      console.error('Error fetching project developers:', error);
    } finally {
      setLoadingDevelopers(false);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProjectForAssignment(project);
    await fetchProjectDevelopers(project.project_id);
  };

  const handleRemoveDeveloper = async (projectId: string, developerId: string) => {
    if (!confirm('정말로 이 개발자를 프로젝트에서 제거하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${projectId}/assignments/${developerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('개발자 제거에 실패했습니다.');
      }

      await fetchProjectDevelopers(projectId);
    } catch (error) {
      console.error('Error removing developer:', error);
      alert('개발자 제거에 실패했습니다.');
    }
  };

  const handleAddDeveloper = async (projectId: string, developerId: string, task: string) => {
    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${projectId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_id: developerId,
          task: task,
        }),
      });

      if (!response.ok) {
        throw new Error('개발자 배정에 실패했습니다.');
      }

      await fetchProjectDevelopers(projectId);
    } catch (error) {
      console.error('Error assigning developer:', error);
      alert('개발자 배정에 실패했습니다.');
    }
  };

  const handleSearchDevelopers = async (searchParams: SearchParams, page: number = 1) => {
    try {
      setIsSearching(true);
      const queryParams = new URLSearchParams();
      
      // 검색어 파라미터 추가
      if (searchParams.developer_name) {
        queryParams.append('query', searchParams.developer_name);
      }
      
      // 페이지 파라미터 추가
      queryParams.append('page', page.toString());
      
      console.log('API 요청 파라미터:', queryParams.toString());  // 디버깅용
      
      const response = await fetch(`http://192.168.0.61:4000/api/projects/developers?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 응답:', data);  // 디버깅용
      
      // 페이지 1이면 목록 초기화, 아니면 기존 목록에 추가
      setSearchDevelopers(prev => page === 1 ? data.developers : [...prev, ...data.developers]);
      setHasMore(data.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('개발자 검색 중 오류 발생:', error);
      setSearchDevelopers([]);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToSelection = (developer: Developer) => {
    setSelectedDevelopers(prev => {
      // 이미 선택된 개발자인지 확인
      if (prev.some(d => d.developer_id === developer.developer_id)) {
        return prev;
      }
      return [...prev, developer];
    });
  };

  const handleRemoveFromSelection = (developerId: string) => {
    setSelectedDevelopers(prev => prev.filter(d => d.developer_id !== developerId));
  };

  const handleLoadMore = () => {
    if (!isSearching && hasMore) {
      const nextPage = currentPage + 1;
      console.log('다음 페이지 로드:', nextPage);  // 디버깅용
      handleSearchDevelopers({ developer_name: searchQuery }, nextPage);
    }
  };

  const handleShowAssignmentModal = () => {
    setShowAssignmentModal(true);
    setSearchQuery('');  // 검색어 초기화
    setCurrentPage(1);   // 페이지 초기화
    handleSearchDevelopers({}, 1);  // 초기 검색
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSearchQuery('');
    setSearchDevelopers([]);
    setSelectedDevelopers([]);
    setCurrentPage(1);
    setHasMore(false);
  };

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
        handleSearchDevelopers({ developer_name: searchQuery }, currentPage + 1);
        setShowArrow(false);
      }
    }
  };

  // 화살표 클릭 핸들러
  const handleArrowClick = () => {
    handleSearchDevelopers({ developer_name: searchQuery }, currentPage + 1);
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">시작일</label>
                    <input
                      type="date"
                      name="project_start_date"
                      value={formData.project_start_date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">종료 예정일</label>
                    <input
                      type="date"
                      name="project_end_date"
                      value={formData.project_end_date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
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
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기술 스택</h3>
                <div className="space-y-4">
                  {[
                    { label: '기종', field: 'project_skill_model' },
                    { label: '운영체제', field: 'project_skill_os' },
                    { label: '프로그래밍 언어', field: 'project_skill_language' },
                    { label: 'DBMS', field: 'project_skill_dbms' },
                    { label: '개발 도구', field: 'project_skill_tool' },
                    { label: '통신 프로토콜', field: 'project_skill_protocol' },
                    { label: '기타', field: 'project_skill_etc' },
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
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">프로젝트명</label>
              <input
                type="text"
                name="project_name"
                value={searchParams.project_name}
                onChange={handleSearch}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">시작일</label>
              <input
                type="date"
                name="project_start_date"
                value={searchParams.project_start_date}
                onChange={handleSearch}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-default text-gray-700 dark:text-gray-300">종료일</label>
              <input
                type="date"
                name="project_end_date"
                value={searchParams.project_end_date}
                onChange={handleSearch}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">상태</label>
              <select
                name="project_status"
                value={searchParams.project_status}
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
            <div className="md:col-span-4 flex justify-end">
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
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
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
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center">
                  <select
                    value={searchParams.limit}
                    onChange={handleLimitChange}
                    className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    <option value="5">5 pages</option>
                    <option value="10">10 pages</option>
                    <option value="20">20 pages</option>
                    <option value="50">50 pages</option>
                  </select>
                </div>
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      pagination.currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    이전
                    </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 2 && pageNumber <= pagination.currentPage + 2)
                    ) {
                      return (
                    <button 
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            pagination.currentPage === pageNumber
                              ? 'z-10 bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === pagination.currentPage - 3 && pageNumber > 1) ||
                      (pageNumber === pagination.currentPage + 3 && pageNumber < pagination.totalPages)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      pagination.currentPage === pagination.totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
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
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {developer.developer_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {developer.task}
                            </p>
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
            developers={searchDevelopers}
            selectedDevelopers={selectedDevelopers}
            setSelectedDevelopers={setSelectedDevelopers}
            onAddDeveloper={handleAddToSelection}
            onRemoveDeveloper={handleRemoveFromSelection}
            onSearch={handleSearchDevelopers}
            isSearching={isSearching}
            hasMore={hasMore}
            showArrow={showArrow}
            onLoadMore={handleLoadMore}
            isFirstScroll={isFirstScroll}
            onScrollStateChange={(isFirst: boolean) => setIsFirstScroll(isFirst)}
          />
        )}
      </div>
    </div>
  );
}
