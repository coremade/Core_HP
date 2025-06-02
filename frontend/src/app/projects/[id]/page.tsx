'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Project | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://192.168.0.61:4000/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data);
        setEditData(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        router.push('/projects');
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(project);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!editData) return;

    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      setProject(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('프로젝트 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.61:4000/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  if (!project || !editData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
              </h1>
              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      삭제
                    </button>
                    <Link
                      href="/projects"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      목록
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기본 정보</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">프로젝트 상태</h3>
                    {isEditing ? (
                      <select
                        name="project_status"
                        value={editData.project_status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="PLANNING">계획중</option>
                        <option value="IN_PROGRESS">진행중</option>
                        <option value="COMPLETED">완료</option>
                        <option value="ON_HOLD">보류</option>
                      </select>
                    ) : (
                      <p className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {project.project_status}
                        </span>
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">기간</h3>
                    <div className="mt-1 space-y-2">
                      {isEditing ? (
                        <>
                          <input
                            type="date"
                            name="project_start_date"
                            value={editData.project_start_date.split('T')[0]}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <input
                            type="date"
                            name="project_end_date"
                            value={editData.project_end_date.split('T')[0]}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </>
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {new Date(project.project_start_date).toLocaleDateString()} ~ {new Date(project.project_end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">클라이언트</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="project_client_id"
                        value={editData.project_client_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">{project.project_client_id || '-'}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">수행사</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="project_practitioner_id"
                        value={editData.project_practitioner_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">{project.project_practitioner_id || '-'}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">프로젝트 매니저</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="project_pm_name"
                        value={editData.project_pm_name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-white">{project.project_pm_name || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 기술 스택 */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">기술 스택</h2>
                <div className="grid grid-cols-1 gap-4">
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
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
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

            {/* 프로젝트 설명 */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">프로젝트 설명</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
} 