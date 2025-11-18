// src\pages\Notice.tsx
/*
  공지 페이지 (Notice)
  - 좌측: 공지 리스트(검색, 상태 필터, 작성 버튼)
  - 우측: 공지 상세/작성/수정
  - 데이터 소스: API 또는 스토어. 파생 목록은 useEffect로 계산(팀 규칙)
  - 로깅: 화면 진입, 검색/필터 변경, 항목 선택, 작성/수정/삭제 시점
*/

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noticesAPI } from '../api';
import { useNoticeStore, type Notice as NoticeType, type NoticeStatus } from '../store/noticeStore';
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
  const addNotice = useNoticeStore.getState().addNotice;
  const updateNotice = useNoticeStore.getState().updateNotice;
  const deleteNotice = useNoticeStore.getState().deleteNotice;

  const readNoticeIds = useNotificationStore((s) => s.readNoticeIds);
  const markNoticeIdAsRead = useNotificationStore((s) => s.markNoticeIdAsRead);
  const isNoticeRead = useNotificationStore((s) => s.isNoticeRead);
  const syncBadgeWithUnread = useNotificationStore((s) => s.syncBadgeWithUnread);

  // 검색/선택/필터/작성 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeType | null>(null);
  // 상태 필터: '전체' | '공개중' | '일시중지' | '공개예정' | '공개종료'
  const [filterStatus, setFilterStatus] = useState<NoticeStatus | '전체'>('전체');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeType | null>(null);

  // 데이터 소스 선택(기본: mock 사용)
  const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

  // API 로드(실서비스 모드에서만)
  const { data } = useQuery({
    queryKey: ['notices'],
    enabled: !useMock,
    retry: 0,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const res = await noticesAPI.getNotices();
        return res as NoticeType[];
      } catch (err) {
        console.error('[공지] API 호출 실패, Mock 데이터로 대체', err);
        return [] as NoticeType[];
      }
    },
  });

  // 원본 공지 목록(소스: API 또는 스토어)
  const [rawNotices, setRawNotices] = useState<NoticeType[]>([]);
  useEffect(() => {
    const next = !useMock && Array.isArray(data) && data.length > 0 ? (data as NoticeType[]) : storeNotices;
    setRawNotices(next);
    console.log('[공지] 원본 목록 갱신', { source: useMock ? 'store' : 'api', count: next.length });
  }, [data, useMock, storeNotices]);

  // 파생: 검색 + 상태필터 + 최신순 정렬(useEffect 기반)
  const [notices, setNotices] = useState<NoticeType[]>([]);
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    let filtered = rawNotices;

    // 관리자 아닌 경우 공개중만 노출
    if (!isAdmin) {
      filtered = filtered.filter((n) => (n as any).status === '공개중');
    } else {
      if (filterStatus !== '전체') {
        filtered = filtered.filter((n) => (n as any).status === filterStatus);
      }
    }

    // 검색(제목/내용)
    if (q) {
      filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotices(sorted);
    console.log('[공지] 목록 계산', { total: rawNotices.length, afterFilter: sorted.length, q, filterStatus });
  }, [rawNotices, searchQuery, filterStatus, isAdmin]);

  // 초기/변경 시 첫 공지 자동 선택
  useEffect(() => {
    if (!selectedNotice && notices.length > 0) {
      setSelectedNotice(notices[0]);
    }
  }, [notices, selectedNotice]);

  // 배지 동기화(미읽음 수)
  useEffect(() => {
    const unread = notices.filter((n) => !readNoticeIds.includes(n.id)).length;
    syncBadgeWithUnread(unread);
  }, [notices, readNoticeIds, syncBadgeWithUnread]);

  // 필터 메뉴 닫기
  const handleCloseFilterMenu = () => {
    setFilterMenuOpen(false);
  };

  // 공지 등록/수정 제출
  const handleNoticeSubmit = (data: any) => {
    const isEdit = !!data.id;
    console.log(isEdit ? '[공지] 공지 수정' : '[공지] 공지 등록', { id: data.id });

    const noticeData = {
      title: data.subject,
      content: data.content,
      author: user?.name || '관리자',
      isImportant: false,
      period: data.startDate && data.endDate ? { startAt: data.startDate, endAt: data.endDate } : undefined,
      targets: data.targets?.map((t: string, idx: number) => ({
        id: `t${Date.now()}_${idx}`,
        name: t.split(' (')[0],
        username: t.match(/\(([^)]+)\)/)?.[1] || '',
      })),
      attachments: data.attachments?.map((file: File) => ({ name: file.name, size: file.size, url: URL.createObjectURL(file) })),
      status: (data.status as NoticeStatus) || '공개중',
    } as Omit<NoticeType, 'id' | 'createdAt'>;

    if (isEdit) {
      updateNotice(data.id, noticeData);
      alert('수정했어요!');
    } else {
      addNotice(noticeData);
      alert(noticeData.status === '일시중지' ? '일시중지되었습니다.' : '등록했어요!');
    }

    setIsComposing(false);
    setEditingNotice(null);
  };

  const handleNoticeCancel = () => {
    setIsComposing(false);
    setEditingNotice(null);
  };

  // 공지 수정 진입
  const handleNoticeEdit = (notice: NoticeType) => {
    setEditingNotice(notice);
    setIsComposing(true);
    setSelectedNotice(null);
    console.log('[공지] 공지 수정 시작', notice.id);
  };

  // 공지 삭제
  const handleNoticeDelete = (notice: NoticeType) => {
    if (window.confirm('공지사항을 삭제할까요?')) {
      deleteNotice(notice.id);
      setSelectedNotice(null);
      alert('삭제했어요!');
      console.log('[공지] 공지 삭제', notice.id);
    }
  };

  return (
    <div className={common.containerWrap} onClick={handleCloseFilterMenu}>
      {/* 좌측 - 목록 */}
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
                    <img src={sortDropdownIcon} alt="필터" />
                  </button>
                  {filterMenuOpen && (
                    <div className={common.sortMenu}>
                      {(['전체', '공개중', '일시중지', '공개예정', '공개종료'] as const).map((status) => {
                        const isSelected = filterStatus === status;
                        return (
                          <button
                            key={status}
                            className={`${common.menuItem} ${isSelected ? common.menuItemSelected : ''}`}
                            onClick={() => {
                              setFilterStatus(status);
                              setFilterMenuOpen(false);
                              console.log('[공지] 상태 필터 변경', status);
                            }}
                          >
                            {isSelected && <span className={styles.checkmark}>✓</span>}
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
                    console.log('[공지] 공지 작성 시작');
                  }}
                >
                  <img src={noteIcon} alt="공지사항 등록" />
                </button>
              </div>
            )}
          </div>

          <div className={common.searchWrapper}>
            <img src={searchIcon} alt="검색" className={common.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                console.log('[공지] 검색어 변경', e.target.value);
              }}
              placeholder="제목 또는 내용 검색"
              className={common.searchInput}
            />
          </div>
        </div>

        <div className={`${common.listItems} ${styles.notice}`}>
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
                  console.log('[공지] 항목 선택', item.id);
                }}
              />
            );
          })}

          {!notices.length && <div className={styles.emptyRow}></div>}
        </div>
      </div>

      {/* 우측 - 상세 */}
      <div className={common.listDetail}>
        {isComposing ? (
          <ComposeNotice onCancel={handleNoticeCancel} onSubmit={handleNoticeSubmit} editingNotice={editingNotice || undefined} />
        ) : selectedNotice ? (
          <NoticeDetail
            notice={selectedNotice}
            isAdmin={isAdmin}
            onEdit={() => handleNoticeEdit(selectedNotice)}
            onDelete={() => handleNoticeDelete(selectedNotice)}
          />
        ) : (
          <div className={styles.noticeContainer}>
            <div className={styles.header}>
              <h1 style={{ fontSize: 18, margin: 0, color: '#666' }}>공지를 선택해 주세요</h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notice;

