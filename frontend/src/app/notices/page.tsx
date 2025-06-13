'use client';

import { useState, useRef } from 'react';
import NoticeList from '@/components/notice/NoticeList';
import NoticeDetail from '@/components/notice/NoticeDetail';

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

export default function NoticesPage() {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const fetchNoticesRef = useRef<() => void>();

  // NoticeList에서 fetchNotices를 등록
  const handleRegisterFetch = (fetchFn: () => void) => {
    fetchNoticesRef.current = fetchFn;
  };

  // 생성/수정/삭제 후 재조회 및 상세 초기화
  const handleRefresh = () => {
    if (fetchNoticesRef.current) fetchNoticesRef.current();
    setSelectedNotice(null);
  };

  return (
    <>
      {/* 왼쪽: 공지사항 목록 */}
      <div>
        <NoticeList 
          onNoticeSelect={(notice) => {
            setIsWriteMode(false);
            setSelectedNotice(notice);
          }}
          selectedNotice={selectedNotice}
          onWriteClick={() => {
            setIsWriteMode(false);
            setSelectedNotice(null);
            setTimeout(() => setIsWriteMode(true), 0);
          }}
          registerFetch={handleRegisterFetch}
          onRefresh={() => {
            setSelectedNotice(null);
            setIsWriteMode(false);
          }}
        />
      </div>
      {/* 오른쪽: 공지사항 상세/글쓰기 */}
      <div>
        <NoticeDetail
          notice={selectedNotice}
          onNewNotice={handleRefresh}
          isWriteMode={isWriteMode}
          setIsWriteMode={setIsWriteMode}
        />
      </div>
    </>
  );
} 