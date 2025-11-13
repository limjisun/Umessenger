// src\pages\Notice.tsx

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noticesAPI } from '../api';
import { useNoticeStore, type Notice as NoticeType } from '../store/noticeStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import NoticeItem from '../components/NoticeItem';
import NoticeDetail from '../components/NoticeDetail';
import ComposeNotice from '../components/ComposeNotice';
import common from '@/styles/Common.module.css';
import styles from '../styles/Notice.module.css';
import searchIcon from '../assets/images/icon-search.png';
import noteIcon from '../assets/images/icon-note.png';
import sortDropdownIcon from '../assets/images/icon-sortdrop.png';



const formatListDateTime = (value: Date | string) => {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString('ko-KR', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Notice = () => {
  useEffect(() => {
    console.log('[공지] 공지사항 화면 진입');
  }, []);

  const { user } = useAuthStore();
  const isAdmin = user?.username === 'admin';

  const storeNotices = useNoticeStore((s) => s.notices);
  const readNoticeIds = useNotificationStore((s) => s.readNoticeIds);
  const markNoticeIdAsRead = useNotificationStore((s) => s.markNoticeIdAsRead);
  const isNoticeRead = useNotificationStore((s) => s.isNoticeRead);
  const syncBadgeWithUnread = useNotificationStore((s) => s.syncBadgeWithUnread);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);
  const [filterStatus, setFilterStatus] = useState<'전체' | '공지중' | '임시저장' | '공지예정' | '공지종료'>('전체');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  // mock 데이터
  const useMock =  (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

  console.log('[공지 디버깅] user:', user);
  console.log('[공지 디버깅] isAdmin:', isAdmin);
  console.log('[공지 디버깅] useMock:', useMock);
  console.log('[공지 디버깅] storeNotices 개수:', storeNotices.length);
  console.log('[공지 디버깅] storeNotices:', storeNotices);

  const { data } = useQuery({
    queryKey: ['notices'],
    enabled: !useMock,
    retry: 0,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const res = await noticesAPI.getNotices();
        return res;
      } catch (err) {
        console.error('[공지] API 호출 실패, 데모 데이터로 대체' , err);
        return [] as NoticeType[];
      }
    },
  });

  /**
   * API 데이터 또는 스토어 데이터 사용
   */
  const rawNotices: NoticeType[] = useMemo(() => {
    if (!useMock && Array.isArray(data) && data.length > 0) return data;
    return storeNotices;
  }, [data, useMock, storeNotices]);

  /**
   * 검색 + 상태필터링 + 최신순 정렬
   */
  const notices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = rawNotices;

    console.log('[공지 디버깅] rawNotices:', rawNotices);
    console.log('[공지 디버깅] filterStatus:', filterStatus);

    // 일반 유저는 공지중만
    if (!isAdmin) {
      filtered = filtered.filter((n) => (n as any).status === '공지중');
      console.log('[공지 디버깅] 일반 유저 필터링 후:', filtered);
    } else {
      if (filterStatus !== '전체') {
        filtered = filtered.filter((n) => (n as any).status === filterStatus);
      }
      console.log('[공지 디버깅] 관리자 필터링 후:', filtered);
    }

    // 검색
    if (q) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }

    // 최신순
    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    console.log('[공지 디버깅] 최종 notices:', sorted);
    return sorted;
  }, [rawNotices, searchQuery, filterStatus, isAdmin]);

  /**
   * 화면 진입 시 최신 공지 자동 선택
   */
  useEffect(() => {
    if (!selectedNotice && notices.length > 0) {
      setSelectedNotice(notices[0]);
    }
  }, [notices, selectedNotice]);

  /**
   * 배지 동기화
   */
  useEffect(() => {
    const unread = notices.filter((n) => !readNoticeIds.includes(n.id)).length;
    syncBadgeWithUnread(unread);
  }, [notices, readNoticeIds, syncBadgeWithUnread]);

  /**
   * 필터 메뉴 닫기
   */
  const handleCloseFilterMenu = () => {
    setFilterMenuOpen(false);
  };

  /**
   * 공지사항 등록 핸들러
   */
  const handleNoticeSubmit = (data: any) => {
    console.log('[공지사항 등록]', data);
    // TODO: API 호출
    setIsComposing(false);
  };

  const handleNoticeCancel = () => {
    setIsComposing(false);
  };

  return (
    <div className={common.containerWrap} onClick={handleCloseFilterMenu}>
      {/* 왼쪽 목록 */}
      <div className={common.listLeft}>
        <div className={common.listHeader}>
          <div className={common.headerActions}>
            <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
              <h2>공지사항</h2>
              {/* 상태 필터 (관리자 전용) */}
              {isAdmin && (
                <div className={common.sortDropdown}>
                  <button
                    className={styles.sortButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterMenuOpen(!filterMenuOpen);
                    }}
                  >
                    <img
                      src={sortDropdownIcon}
                      alt="필터"
                    />
                  </button>
                  {filterMenuOpen && (
                    <div className={common.sortMenu}>
                      {(['전체', '공지중', '임시저장', '공지예정', '공지종료'] as const).map((status) => {
                        const isSelected = filterStatus === status;
                        return (
                          <button
                            key={status}
                            className={`${common.menuItem} ${isSelected ? common.menuItemSelected : ''}`}
                            onClick={() => {
                              setFilterStatus(status);
                              setFilterMenuOpen(false);
                            }}
                          >
                            {isSelected && <span className={styles.checkmark}>✓ </span>}
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
           
            {isAdmin && (
            <div>
               <button
                className={styles.composeButton}
                onClick={() => {
                  setIsComposing(true);
                  setSelectedNotice(null);
                  console.log('[공지사항 작성 시작]');
                }}
              >
              <img
                src={noteIcon}
                alt="공지사항 등록"
              />
              </button>
            </div>
             )}
          </div>

          <div className={common.searchWrapper}>
            <img src={searchIcon} alt="검색" className={common.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목 또는 내용 검색"
              className={common.searchInput}
            />
          </div>


        </div>

        <div className={`${common.listItems} ${styles.notice}`} >
          {notices.map((item) => {
            const unread = !isNoticeRead(item.id);
            const isSelected = selectedNotice?.id === item.id;

            return (
              <NoticeItem
                key={item.id}
                notice={item}
                isSelected={isSelected}
                isUnread={unread}
                formatDateTime={formatListDateTime}
                onClick={() => {
                  setSelectedNotice(item);
                  if (unread) markNoticeIdAsRead(item.id);
                }}
              />
            );
          })}

          {!notices.length && (
            <div className={styles.emptyRow}>데이터 없음</div>
          )}
        </div>
      </div>

      {/* 오른쪽 상세 */}
      <div className={common.listDetail}>
        {isComposing ? (
          <ComposeNotice
            onCancel={handleNoticeCancel}
            onSubmit={handleNoticeSubmit}
          />
        ) : selectedNotice ? (
          <NoticeDetail
            notice={selectedNotice}
            isAdmin={isAdmin}
            onEdit={() => console.log('[공지사항 수정]', selectedNotice.id)}
          />
        ) : (
          <div className={styles.noticeContainer}>
            <div className={styles.header}>
              <h1
                style={{
                  fontSize: 18,
                  margin: 0,
                  color: '#666',
                }}
              >
                공지를 선택해주세요
              </h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notice;
