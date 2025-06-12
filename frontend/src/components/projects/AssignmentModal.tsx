import React, { useCallback, useEffect, useMemo } from 'react';
import { Project, ProjectDeveloper } from '@/types/project';
import { useSearchStore } from '@/store/searchStore';
import ModalWrapper from '../common/ModalWrapper';
import DateInput from '../common/DateInput';

// ================================================================
// 타입 정의 영역
// ================================================================

/**
 * 프로젝트 배정 관리에서 사용하는 확장된 개발자 타입
 * - 삭제 표시, 신규 추가 표시, 배정 정보 포함
 */
interface ExtendedProjectDeveloper extends ProjectDeveloper {
  isMarkedForDeletion?: boolean; // 삭제 예정 표시
  isNewlyAdded?: boolean;        // 신규 추가 표시
  start_date?: string;           // 배정 시작일
  end_date?: string;             // 배정 종료일
  task?: string;                 // 담당 업무
}

/**
 * 개발자 배정 관리 모달 컴포넌트의 Props
 */
interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  selectedDevelopers: ExtendedProjectDeveloper[];
  setSelectedDevelopers: React.Dispatch<React.SetStateAction<ExtendedProjectDeveloper[]>>;
  onAddDeveloper: (developer: ProjectDeveloper) => void;
  onRemoveDeveloper: (developerId: string) => void;
  fetchProjectDevelopers: (projectId: string) => Promise<void>;
  onAssignmentUpdate?: () => void;  // 배정 변경 시 프로젝트 목록 재렌더링을 위한 콜백
}

// ================================================================
// 메인 컴포넌트
// ================================================================

/**
 * 개발자 배정 관리 모달 컴포넌트
 * - 프로젝트에 개발자 배정/제거 기능
 * - 개발자 검색 및 필터링
 * - 배정 정보 수정 (시작일, 종료일, 담당업무)
 */
const AssignmentModal = ({
  isOpen,
  onClose,
  project,
  selectedDevelopers,
  setSelectedDevelopers,
  onAddDeveloper,
  onRemoveDeveloper,
  fetchProjectDevelopers,
  onAssignmentUpdate
}: AssignmentModalProps) => {
  // ================================================================
  // 상태 관리 영역
  // ================================================================
  const [searchQuery, setSearchQuery] = React.useState('');
  const { searchState, searchDevelopers } = useSearchStore();

  // ================================================================
  // 생명주기 관리 영역
  // ================================================================
  
  /**
   * 모달이 열릴 때 검색 초기화
   */
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      searchDevelopers({ developer_name: '' }, 1);
    }
  }, [isOpen, searchDevelopers]);

  // ================================================================
  // 이벤트 핸들러 영역
  // ================================================================
  
  /**
   * 스크롤 이벤트 핸들러 - 무한 스크롤 구현
   */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단에 도달했는지 확인 (여유 공간 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50 && searchState.hasMore && !searchState.isSearching) {
      searchDevelopers({ 
        developer_name: searchQuery 
      }, searchState.page + 1);
    }
  }, [searchQuery, searchState.hasMore, searchState.isSearching, searchState.page, searchDevelopers]);

  // ================================================================
  // 계산된 값 영역
  // ================================================================
  
  /**
   * 이미 선택된 개발자를 제외한 검색 결과 필터링
   */
  const filteredDevelopers = useMemo(() => 
    searchState.developers.filter(developer => 
      !selectedDevelopers.some(selected => selected.developer_id === developer.developer_id)
    ),
    [searchState.developers, selectedDevelopers]
  );

  /**
   * 저장되지 않은 변경사항 확인
   */
  const hasUnsavedChanges = useMemo(() => {
    const hasAddedDevelopers = selectedDevelopers.some(dev => dev.isNewlyAdded);
    const hasRemovedDevelopers = selectedDevelopers.some(dev => dev.isMarkedForDeletion);
    return hasAddedDevelopers || hasRemovedDevelopers;
  }, [selectedDevelopers]);

  // ================================================================
  // 액션 함수 영역
  // ================================================================
  
  /**
   * 모달 닫기 처리 - 변경사항 확인 후 닫기
   */
  const handleCloseModal = useCallback(() => {
    if (hasUnsavedChanges) {
      const message = `저장되지 않은 변경사항이 있습니다. 정말로 닫으시겠습니까?`;
      if (!confirm(message)) {
        return;
      }
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  /**
   * 개발자 배정 정보 저장
   */
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
          start_date: developer.start_date,
          end_date: developer.end_date,
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
      
      // 프로젝트 목록도 재렌더링 (개발자 수 업데이트를 위해)
      if (onAssignmentUpdate) {
        onAssignmentUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('개발자 배정 저장에 실패했습니다.');
    }
  };

  // ================================================================
  // 렌더링 영역
  // ================================================================
  
  return (
    <ModalWrapper isOpen={isOpen} onClose={handleCloseModal}>
      {/* ============================================================
          모달 헤더 영역 - 제목 및 닫기 버튼
          ============================================================ */}
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
          {/* ============================================================
              왼쪽 패널 - 개발자 검색 및 추가 영역
              ============================================================ */}
          <div>
            {/* 검색 입력 필드 */}
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

            {/* 개발자 검색 결과 목록 */}
            <div 
              className="overflow-y-auto h-[32rem] border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              onScroll={handleScroll}
            >
              {/* 로딩 인디케이터 */}
              {searchState.isSearching && (
                <div className="sticky top-0 z-10 flex justify-center py-2 bg-gray-50 dark:bg-gray-700">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {/* 개발자 목록 */}
              {filteredDevelopers.map((developer) => (
                <div
                  key={developer.developer_id}
                  className="p-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 group relative"
                >
                  {/* 개발자 기본 정보 */}
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

          {/* ============================================================
              오른쪽 패널 - 선택된 개발자 관리 영역
              ============================================================ */}
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
        
        {/* ============================================================
            모달 푸터 영역 - 저장/취소 버튼
            ============================================================ */}
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

export default AssignmentModal; 