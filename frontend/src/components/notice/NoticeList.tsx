'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

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

interface NoticeListProps {
  onNoticeSelect: (notice: Notice | null) => void;
  selectedNotice: Notice | null;
  onWriteClick: () => void;
  registerFetch: (fetchFn: () => void) => void;
  onRefresh?: () => void;
}

const PAGE_SIZE = 10;

export default function NoticeList({ onNoticeSelect, selectedNotice, onWriteClick, registerFetch, onRefresh }: NoticeListProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/notices');
      setNotices(response.data);
      setError(null);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error('공지사항 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    if (registerFetch) {
      registerFetch(fetchNotices);
    }
    // eslint-disable-next-line
  }, []);

  const handleNoticeClick = (notice: Notice) => {
    onNoticeSelect(notice);
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
    setSelectedIds([]);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(pagedNotices.map(n => n.notice_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (noticeId: number) => {
    setSelectedIds(prev =>
      prev.includes(noticeId) ? prev.filter(id => id !== noticeId) : [...prev, noticeId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.length}개의 공지사항을 삭제하시겠습니까?`)) return;
    try {
      await axios.delete('http://localhost:4000/api/notices', { data: { ids: selectedIds } });
      setSelectedIds([]);
      fetchNotices();
      onNoticeSelect(null);
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const truncateTitle = (title: string, maxLength: number = 35) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  // 페이징된 데이터
  const pagedNotices = notices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRefresh = async () => {
    try {
      await fetchNotices();
      setSelectedIds([]);
      setPage(1);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('새로고침 실패:', err);
    }
  };

  // 전체 선택 체크박스 상태 계산
  const isAllSelected = pagedNotices.length > 0 && pagedNotices.every(notice => selectedIds.includes(notice.notice_id));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Checkbox
            checked={isAllSelected}
            onChange={handleSelectAll}
            inputProps={{ 'aria-label': '전체 선택' }}
            className="ml-1 mr-2"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center ml-0">
            <svg className="w-6 h-6 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM20.5 11H9a4 4 0 01-4-4V5a2 2 0 012-2h11.5z" />
            </svg>
            공지사항
            <button
              className="ml-1 p-0.5 text-gray-400 hover:text-blue-500 focus:outline-none"
              style={{ fontSize: '1rem', verticalAlign: 'middle' }}
              onClick={handleRefresh}
              title="새로고침"
            >
              <RefreshIcon fontSize="small" />
            </button>
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            총 {notices.length}건
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="contained" color="primary" size="small" onClick={onWriteClick}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            새 글 작성
          </Button>
          <Button variant="contained" color="error" size="small" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            선택 삭제
          </Button>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="overflow-y-auto flex-1" style={{ height: 'calc(100% - 73px)' }}>
        {pagedNotices.map((notice) => (
          <div
            key={notice.notice_id}
            onClick={() => handleNoticeClick(notice)}
            className={`py-2 px-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
              selectedNotice?.notice_id === notice.notice_id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                : ''
            } flex items-center`}
          >
            <Checkbox
              checked={selectedIds.includes(notice.notice_id)}
              onChange={() => handleSelectOne(notice.notice_id)}
              onClick={e => e.stopPropagation()}
              className="mr-2 ml-1"
            />
            <div className="flex-1">
              <div className="flex items-start space-x-3">
                {/* 중요 표시 */}
                {notice.is_important === 'Y' && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  {/* 제목 */}
                  <h3 className={`text-sm font-medium text-gray-900 dark:text-white mb-1 ${
                    notice.is_important === 'Y' ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    {notice.is_important === 'Y' && '[중요] '}
                    {truncateTitle(notice.title)}
                  </h3>
                  {/* 메타 정보 */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {notice.author}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {format(new Date(notice.created_at), 'MM.dd', { locale: ko })}
                    </span>
                    {/* 조회수 표시 주석 처리
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {notice.views}
                    </span>
                    */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이징 UI */}
      <Box display="flex" justifyContent="center" alignItems="center" py={2}>
        <Pagination
          count={Math.ceil(notices.length / PAGE_SIZE)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </div>
  );
} 