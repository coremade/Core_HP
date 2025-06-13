'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';

interface Notice {
  notice_id: number;
  title: string;
  content: string;
  author: string;
  is_important: string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface NoticeDetailProps {
  notice: Notice | null;
  onNewNotice: () => void;
  isWriteMode?: boolean;
  setIsWriteMode?: (v: boolean) => void;
}

interface NoticeForm {
  title: string;
  content: string;
  is_important: string;
  author: string;
}

export default function NoticeDetail({ notice, onNewNotice, isWriteMode: externalWriteMode, setIsWriteMode: setExternalWriteMode }: NoticeDetailProps) {
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    is_important: 'N',
    author: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  // 외부에서 글쓰기 모드 제어
  useEffect(() => {
    if (typeof externalWriteMode === 'boolean') {
      setIsWriteMode(externalWriteMode);
    }
  }, [externalWriteMode]);

  // 글쓰기/수정 모드 진입 시 폼 초기화
  useEffect(() => {
    if (isWriteMode) {
      if (editId && notice) {
        setForm({
          title: notice.title,
          content: notice.content,
          is_important: notice.is_important,
          author: notice.author || '관리자'
        });
      } else {
        setForm({ title: '', content: '', is_important: 'N', author: '관리자' });
      }
    }
  }, [isWriteMode, editId, notice]);

  // NoticeList에서 새 글 작성 클릭 시
  useEffect(() => {
    if (!notice && isWriteMode) {
      setEditId(null);
      setForm({ title: '', content: '', is_important: 'N', author: '관리자' });
    }
  }, [notice, isWriteMode]);

  const handleWriteClick = () => {
    setEditId(null);
    setIsWriteMode(true);
    setForm({ title: '', content: '', is_important: 'N', author: '' });
    if (setExternalWriteMode) setExternalWriteMode(true);
  };

  const handleEditClick = () => {
    if (notice) {
      setEditId(notice.notice_id);
      setIsWriteMode(true);
      if (setExternalWriteMode) setExternalWriteMode(true);
    }
  };

  const handleCancelWrite = () => {
    setIsWriteMode(false);
    setEditId(null);
    setForm({ title: '', content: '', is_important: 'N', author: '' });
    if (setExternalWriteMode) setExternalWriteMode(false);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        // 수정
        await axios.put(`http://localhost:4000/api/notices/${editId}`, form);
        alert('공지사항이 수정되었습니다.');
      } else {
        // 생성
        await axios.post('http://localhost:4000/api/notices', form);
        alert('공지사항이 저장되었습니다.');
      }
      setIsWriteMode(false);
      setEditId(null);
      setForm({ title: '', content: '', is_important: 'N', author: '' });
      if (onNewNotice) onNewNotice();
    } catch (error) {
      console.error('공지사항 저장/수정 실패:', error);
      alert('공지사항 저장/수정에 실패했습니다.');
    }
  };

  const handleInputChange = (field: keyof NoticeForm, value: string) => {
    if (field === 'author' && value.length > 20) return;
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 글쓰기/수정 모드
  if (isWriteMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editId ? '공지사항 수정' : '공지사항 작성'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCancelWrite}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.content.trim() || !form.author.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>

        {/* 글쓰기 폼 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-3">
            {/* 중요 공지 체크박스 */}
            <div className="flex items-center">
              <input
                id="important"
                type="checkbox"
                checked={form.is_important === 'Y'}
                onChange={(e) => handleInputChange('is_important', e.target.checked ? 'Y' : 'N')}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="important" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                중요 공지
              </label>
            </div>

            {/* 작성자 입력 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="author" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  작성자 *
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">{form.author.length}/20</span>
              </div>
              <input
                id="author"
                type="text"
                value={form.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="작성자 이름을 입력하세요"
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* 제목 입력 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  제목 *
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">{form.title.length}/200</span>
              </div>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* 내용 입력 */}
            <div className="flex-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용 *
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 상세보기 모드
  if (notice) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              공지사항 상세
            </h2>
            <button
              onClick={handleEditClick}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              수정
            </button>
          </div>
        </div>

        {/* 공지사항 상세 내용 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* 제목 및 메타 정보 */}
          <div className="mb-4">
            <div className="flex items-start mb-2">
              {notice.is_important === 'Y' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mr-2">
                  중요
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full whitespace-nowrap">
                제목 : {notice.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                작성자: {notice.author}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                작성일: {format(new Date(notice.created_at), 'yyyy년 MM월 dd일 HH:mm:ss', { locale: ko })}
              </div>
              {/* 조회수 표시 주석 처리
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                조회수: {notice.views}
              </div>
              */}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 mb-6" />

          {/* 내용 */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기본 상태 (공지사항 선택되지 않음)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            공지사항
          </h2>
          <button
            onClick={handleWriteClick}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            새 글 작성
          </button>
        </div>
      </div>

      {/* 빈 상태 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            공지사항을 선택하세요
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            왼쪽 목록에서 공지사항을 선택하면<br />
            상세 내용을 확인할 수 있습니다.
          </p>
          <button
            onClick={handleWriteClick}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            새 공지사항 작성
          </button>
        </div>
      </div>
    </div>
  );
} 