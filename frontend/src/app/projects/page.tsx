'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Project, ProjectFormData, ProjectDeveloper, SearchParams, PaginationInfo } from '@/types/project';
// import { formatDateForAPI, formatDateForDisplay } from '@/utils/projectUtils';
import { useSearchStore } from '@/store/searchStore';
// import ModalWrapper from '@/components/common/ModalWrapper';
import DateInput from '@/components/common/DateInput';
import ProjectDetailModal from '@/components/projects/ProjectDetailModal';
import AssignmentModal from '@/components/projects/AssignmentModal';
import SidebarMenu from '@/components/common/SidebarMenu';

// ================================================================
// 타입 정의 영역
// ================================================================

/**
 * 개발자 배정 관리에서 사용하는 확장된 개발자 타입
 * - 삭제/추가 상태 추적 및 배정 정보 포함
 */
interface ExtendedProjectDeveloper extends ProjectDeveloper {
  isMarkedForDeletion?: boolean;  // 삭제 예정 표시
  isNewlyAdded?: boolean;         // 신규 추가 표시
  start_date?: string;            // 배정 시작일
  end_date?: string;              // 배정 종료일
  task?: string;                  // 담당 업무
}



// ================================================================
// 메인 컴포넌트
// ================================================================

/**
 * 프로젝트 관리 메인 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 프로젝트 목록 조회 및 검색
 * - 프로젝트 생성/수정/삭제
 * - 개발자 배정 관리
 * - 페이지네이션 및 필터링
 */
export default function ProjectsPage() {
  // ================================================================
  // 상태 관리 영역
  // ================================================================
  
  // 프로젝트 관련 상태
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState<Project | null>(null);
  
  // 모달 관련 상태
  const [showModal, setShowModal] = useState(false);              // 프로젝트 생성/상세 모달
  const [showDetailModal, setShowDetailModal] = useState(false);  // 프로젝트 상세보기 모달
  const [showAssignmentModal, setShowAssignmentModal] = useState(false); // 개발자 배정 모달
  
  // 페이지네이션 상태
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // 검색 관련 상태
  const [searchParams, setSearchParams] = useState<SearchParams>({
    project_name: '',
    project_start_date: '',
    project_end_date: '',
    project_status: '',
    page: 1,
    limit: 5
  });
  
  // 개발자 배정 관련 상태
  const [projectDevelopers, setProjectDevelopers] = useState<ProjectDeveloper[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [selectedDevelopers, setSelectedDevelopers] = useState<ExtendedProjectDeveloper[]>([]);
  
  // 외부 상태 관리 (개발자 배정 모달에서 사용)
  // const { searchDevelopers: searchDevelopersStore } = useSearchStore();

  // 검색 필드의 임시 상태를 저장할 state
  const [searchFields, setSearchFields] = useState({
    project_name: '',
    project_start_date: '',
    project_end_date: '',
    project_status: '',
    project_skill_language: ''
  });

  // ================================================================
  // API 통신 함수 영역
  // ================================================================
  
  /**
   * 프로젝트 목록 조회
   */
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

  /**
   * 프로젝트별 배정된 개발자 목록 조회
   */
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

  // ================================================================
  // 이벤트 핸들러 영역
  // ================================================================
  
  /**
   * 검색 필드 입력 핸들러
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 검색 폼 제출 핸들러
   */
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

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === pagination.currentPage) return;
    
    // 페이지 변경 시 개발자 배정 현황 초기화
    setSelectedProjectForAssignment(null);
    setProjectDevelopers([]);
    setSelectedDevelopers([]);
    
    fetchProjects({
      ...searchParams,
      page: newPage
    });
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  }, [pagination.currentPage, searchParams, fetchProjects]);

  /**
   * 페이지당 항목 수 변경 핸들러
   */
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    
    // 페이지당 항목 수 변경 시 개발자 배정 현황 초기화
    setSelectedProjectForAssignment(null);
    setProjectDevelopers([]);
    setSelectedDevelopers([]);
    
    const newParams = {
      ...searchParams,
      page: 1,
      limit: newLimit
    };
    fetchProjects(newParams);
    setSearchParams(newParams);
  };

  // ================================================================
  // 프로젝트 관리 함수 영역
  // ================================================================
  
  /**
   * 프로젝트 상세보기
   */
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

  /**
   * 프로젝트 생성 모달 열기
   */
  const handleCreateProject = async () => {
    setShowModal(true);
  };

  /**
   * 프로젝트 생성 모달 닫기
   */
  const handleCloseCreateModal = () => {
    setShowModal(false);
  };

  /**
   * 프로젝트 업데이트 완료 후 처리
   */
  const handleProjectUpdate = (updatedProject: Project) => {
    // 생성 모드인 경우 모달을 닫고, 상세보기 모드인 경우 selectedProject 업데이트
    if (showModal) {
      handleCloseCreateModal();
    } else {
      setSelectedProject(updatedProject);
    }
    fetchProjects();
  };

  // ================================================================
  // 개발자 배정 관리 함수 영역
  // ================================================================
  
  /**
   * 프로젝트 클릭 시 개발자 배정 현황 조회
   */
  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProjectForAssignment(project);
    fetchProjectDevelopers(project.project_id);
  }, [fetchProjectDevelopers]);

  /**
   * 개발자 배정 모달 열기
   */
  const handleShowAssignmentModal = useCallback(() => {
    if (!selectedProjectForAssignment) return;
    setShowAssignmentModal(true);
  }, [selectedProjectForAssignment]);

  /**
   * 개발자 배정 모달 닫기
   */
  const handleCloseAssignmentModal = useCallback(() => {
    setShowAssignmentModal(false);
  }, []);

  /**
   * 개발자 추가
   */
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

  /**
   * 개발자 제거
   */
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

  // ================================================================
  // 생명주기 관리 영역
  // ================================================================
  
  /**
   * 컴포넌트 마운트 시 프로젝트 목록 로드
   */
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /**
   * 모달 열림/닫힘에 따른 body 스크롤 제어
   */
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



  // ================================================================
  // 로딩 상태 처리
  // ================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex justify-center items-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  // ================================================================
  // 메인 렌더링 영역
  // ================================================================
  
  return (
    <>
      <SidebarMenu/>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ============================================================
              페이지 헤더 영역 - 제목 및 프로젝트 생성 버튼
              ============================================================ */}
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

          {/* ============================================================
              검색 필터 영역
              ============================================================ */}
          <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-4">
              {/* 첫 번째 줄: 프로젝트명, 기술스택 */}
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
              
              {/* 두 번째 줄: 시작일, 종료일, 상태 */}
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
              
              {/* 검색 버튼 */}
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

          {/* ============================================================
              메인 콘텐츠 영역 - 2열 레이아웃
              ============================================================ */}
          <div className="grid grid-cols-2 gap-6">
            {/* ============================================================
                왼쪽 패널 - 프로젝트 목록 및 페이지네이션
                ============================================================ */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              {/* 프로젝트 목록 */}
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
                        {/* 프로젝트 기본 정보 */}
                        <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {project.project_name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            시작일: {new Date(project.project_start_date).toLocaleDateString()} | 
                            종료 예정일: {new Date(project.project_end_date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* 프로젝트 상태 및 개발자 수 */}
                        <div className="flex items-center space-x-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {project.project_status}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            개발자 {project.developer_count || 0}명
                          </span>
                        </div>
                      </div>

                        {/* 상세보기 버튼 */}
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

              {/* 페이지네이션 영역 */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                {/* 페이지당 항목 수 선택 */}
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
                
                {/* 페이지 버튼들 */}
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

            {/* ============================================================
                오른쪽 패널 - 개발자 배정 현황
                ============================================================ */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              {selectedProjectForAssignment ? (
                <div>
                  {/* 헤더 - 프로젝트명 및 개발자 추가 버튼 */}
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

                  {/* 개발자 목록 또는 로딩/빈 상태 */}
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
                              {/* 개발자 기본 정보 */}
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

                              {/* 개발자 등급, 업무, 기술 스펙 */}
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

                              {/* 투입 기간 */}
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                투입기간: {developer.start_date} ~ {developer.end_date}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* 빈 상태 - 배정된 개발자가 없을 때 */
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
                /* 프로젝트 미선택 상태 */
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  프로젝트를 선택하여 개발자 배정 현황을 확인하세요
                    </div>
              )}
            </div>
          </div>

          {/* ============================================================
              모달 영역
              ============================================================ */}
          
          {/* 프로젝트 생성 모달 */}
          {showModal && (
            <ProjectDetailModal
              isOpen={showModal}
              onClose={handleCloseCreateModal}
              project={null}
              onSave={handleProjectUpdate}
              mode="create"
            />
          )}
          
          {/* 프로젝트 상세보기 모달 */}
          {showDetailModal && selectedProject && (
            <ProjectDetailModal
              isOpen={showDetailModal}
              onClose={() => setShowDetailModal(false)}
              project={selectedProject}
              onSave={handleProjectUpdate}
              onDelete={() => {
                setShowDetailModal(false);
                setSelectedProject(null);
                setSelectedProjectForAssignment(null);
                setProjectDevelopers([]);
                setSelectedDevelopers([]);
                fetchProjects();
              }}
              mode="view"
            />
          )}
          
          {/* 개발자 배정 관리 모달 */}
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
              onAssignmentUpdate={fetchProjects}
            />
          )}
        </div>
      </div>
    </>
  );
}
