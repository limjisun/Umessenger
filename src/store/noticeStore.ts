import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NoticeAttachment {
  name: string;
  size: number;
  url: string;
}

export interface NoticeTarget {
  id: string;
  name: string;
  username: string;
}

export interface NoticePeriod {
  startAt: string;
  endAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isImportant: boolean;
  period?: NoticePeriod;
  targets?: NoticeTarget[];
  attachments?: NoticeAttachment[];
  status?: '전체' | '공지중' | '임시저장' | '공지예정' | '공지종료';
}

interface NoticeState {
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'createdAt'>) => void;
  markAsRead: (noticeId: string) => void;
  markAllAsRead: () => void;
  deleteNotice: (noticeId: string) => void;
}

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set, get) => ({
      notices: [
        {
          id: 'n1',
          title: '사내 서버실 장비 교체 안내 사내 서버실 장비 교체 안내 사내 서버실 장비 교체 안내',
          content: `<p>안녕하세요, 임직원 여러분</p>
          <p>아래 일정으로 사내 서버실 장비 교체가 예정되어 있습니다.</p>
          <ol>
            <li>일정 - 오늘 23:00 ~ 23:30</li>
            <li>사유 - 네트워크 임대 장비 교체</li>
          </ol>`,
          author: '관리자',
          createdAt: new Date(Date.now() - 1000 * 60 * 60),
          isImportant: true,
          period: {
            startAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            endAt: new Date(Date.now() + 1000 * 60 * 50).toISOString(),
          },
          targets: [
            { id: 'u1', name: '콜상담1팀', username: 'team1' },
            { id: 'u2', name: '콜상담2팀', username: 'team2' },
            { id: 'u3', name: '전산팀', username: 'it' },
            { id: 'u4', name: '영업팀', username: 'sales' },
          ],
          attachments: [
            { name: '점검안내.pdf', size: 102400, url: '#' },
            { name: '서버리스트.xlsx', size: 20480, url: '#' },
            { name: '네트워크도면.png', size: 40960, url: '#' },
          ],
          status: '공지중',
        },
        {
          id: 'n2',
          title: '신규 기능 업데이트',
          content: '<p>메신저에 새로운 검색 기능이 추가되었습니다.</p>',
          author: '운영팀',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isImportant: false,
          period: {
            startAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          },
          targets: [
            { id: 'u1', name: '전체직원', username: 'all' },
          ],
          status: '임시저장',
        },
        {
          id: 'n3',
          title: '2024년 하반기 인사평가 안내',
          content: '<p>2024년 하반기 인사평가를 다음과 같이 진행합니다.</p><p>- 평가 기간: 11월 15일 ~ 11월 30일</p><p>- 평가 대상: 전 직원</p><p>- 제출 방법: 인사시스템 접속 후 작성</p>',
          author: '인사팀',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          isImportant: true,
          period: {
            startAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          },
          targets: [
            { id: 'u1', name: '전체직원', username: 'all' },
            { id: 'u2', name: '인사팀', username: 'hr' },
          ],
          attachments: [
            { name: '인사평가_가이드.pdf', size: 1024000, url: '#' }
          ],
          status: '공지중',
        },
        {
          id: 'n4',
          title: '사무실 이전 안내',
          content: '<p>12월 1일부터 본사 사무실이 이전됩니다.</p><p>새 주소: 서울시 강남구 테헤란로 123</p><p>이사 당일 근무는 재택근무로 진행됩니다.</p>',
          author: '총무팀',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
          isImportant: false,
          period: {
            startAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          },
          targets: [
            { id: 'u1', name: '전체직원', username: 'all' },
            { id: 'u2', name: '총무팀', username: 'admin' },
          ],
          status: '공지예정',
        },
        {
          id: 'n5',
          title: '보안 정책 업데이트',
          content: '<p>정보보안 강화를 위해 비밀번호 정책이 변경되었습니다.</p><p>- 최소 길이: 10자 이상</p><p>- 특수문자 포함 필수</p><p>- 3개월마다 변경 권장</p>',
          author: '보안팀',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
          isImportant: false,
          period: {
            startAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
            endAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          targets: [
            { id: 'u1', name: '전체직원', username: 'all' },
            { id: 'u2', name: '보안팀', username: 'security' },
          ],
          status: '공지종료',
        },
      ],

      addNotice: (notice) =>
        set((state) => ({
          notices: [
            {
              ...notice,
              id: Date.now().toString(),
              createdAt: new Date(),
            },
            ...state.notices,
          ],
        })),

      markAsRead: (noticeId) =>
        set((state) => ({
          notices: state.notices.map((notice) =>
            notice.id === noticeId ? { ...notice, isImportant: false } : notice
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notices: state.notices.map((notice) => ({ ...notice, isImportant: false })),
        })),

      deleteNotice: (noticeId) =>
        set((state) => ({
          notices: state.notices.filter((notice) => notice.id !== noticeId),
        })),
    }),
    {
      name: 'notice-storage',
    }
  )
);
