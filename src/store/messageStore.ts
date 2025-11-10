import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MessageUser {
  name: string;
  username: string;
}

export interface MessageAttachment {
  name: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  sender: MessageUser | MessageUser[]; // 단일 또는 여러 명의 발신자
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  hasAttachment: boolean;
  isPinned: boolean;
  recipients: MessageUser[];
  cc?: MessageUser[];
  attachments?: MessageAttachment[];
  type: 'received' | 'sent'; // 받은쪽지인지 보낸쪽지인지
  isArchived: boolean; // 보관함 여부
}

interface MessageState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  togglePin: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  archiveMessage: (messageId: string) => void;
  unarchiveMessage: (messageId: string) => void;
  getReceivedMessages: () => Message[];
  getSentMessages: () => Message[];
  getArchivedMessages: () => Message[];
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: '1',
          sender: [
            { name: '김영희', username: 'kim456' }
          ],
          subject: '공동 상담 일정 조율 요청',
          content: '<p>안녕하세요. 다음 주 공동 상담 일정을 조율하고자 합니다...</p>',
          timestamp: new Date(), // 오늘 날짜로 설정
          isRead: false, // 새로운 쪽지
          hasAttachment: true,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }, { name: '정태우', username: 'jung789' },
            { name: '최민준', username: 'choi012' }, { name: '정태우', username: 'jung789' }, { name: '정태우', username: 'jung789' }, { name: '정태우', username: 'jung789' }],
          cc: [{ name: '박민수', username: 'park123' }],
          attachments: [
            { name: '일정안.pdf', size: 1024000, url: '#' },
            { name: '참고자료.xlsx', size: 512000, url: '#' },
            { name: 'test.xlsx', size: 512000, url: '#' }
          ],
          type: 'received',
          isArchived: false,
        },
        {
          id: '2',
          sender: { name: '이승진', username: 'lee' },
          subject: '프로젝트 진행 상황 보고',
          content: '<p>현재 프로젝트 진행률은 75%입니다...</p>',
          timestamp: new Date('2024-11-02T10:15:00'),
          isRead: false,
          hasAttachment: false,
          isPinned: false,
          recipients: [{ name: '암지선', username: 'joy' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '3',
          sender: { name: '이영희', username: 'lee123' },
          subject: '월간 보고서',
          content: '<p>10월 월간 보고서를 전달드립니다...</p>',
          timestamp: new Date('2024-11-01T16:45:00'),
          isRead: true,
          hasAttachment: true,
          isPinned: false,
          recipients: [{ name: '암지선', username: 'joy' }],
          attachments: [{ name: '월간보고서.docx', size: 256000, url: '#' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '4',
          sender: { name: '임지선', username: 'joy' }, // 내가 보낸 쪽지 (현재 로그인 사용자)
          subject: '업무 협조 요청',
          content: '<p>다음 주까지 자료 준비 부탁드립니다.</p>',
          timestamp: new Date('2024-11-03T09:20:00'),
          isRead: true,
          hasAttachment: false,
          isPinned: false,
          recipients: [
            { name: '이승진', username: 'lee' },
            { name: '박민수', username: 'park123' }
          ],
          type: 'sent',
          isArchived: false,
        },
        {
          id: '5',
          sender: { name: '박민수', username: 'park123' },
          subject: '긴급 공지사항',
          content: '<p>내일 전체 회의가 예정되어 있습니다.</p>',
          timestamp: new Date('2024-10-30T14:00:00'),
          isRead: true,
          hasAttachment: false,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          type: 'received',
          isArchived: true,
        },
        {
          id: '6',
          sender: { name: '정수연', username: 'jung456' },
          subject: '마케팅 전략 회의 요청 마케팅 전략 회의 요청 마케팅 전략 회의 요청 마케팅 전략 회의 요청 마케팅 전략 회의 요청',
          content: '<p>다음 달 마케팅 전략에 대해 논의하고 싶습니다. 회의 일정을 잡아주세요.</p>',
          timestamp: new Date('2024-11-04T11:30:00'),
          isRead: false,
          hasAttachment: true,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          attachments: [{ name: '마케팅_계획안.pptx', size: 2048000, url: '#' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '7',
          sender: { name: '최지훈', username: 'choi789' },
          subject: '시스템 점검 안내',
          content: '<p>금주 토요일 새벽 2시부터 4시까지 시스템 점검이 예정되어 있습니다.</p>',
          timestamp: new Date('2024-11-03T15:20:00'),
          isRead: true,
          hasAttachment: false,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '8',
          sender: { name: '강민지', username: 'kang234' },
          subject: '연차 사용 승인 요청',
          content: '<p>다음 주 월요일 연차 사용 승인 부탁드립니다.</p>',
          timestamp: new Date('2024-11-02T14:00:00'),
          isRead: false,
          hasAttachment: false,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '9',
          sender: { name: '윤서준', username: 'yoon567' },
          subject: 'API 문서 업데이트',
          content: '<p>새로운 API 엔드포인트 문서를 업데이트했습니다. 확인 부탁드립니다.</p>',
          timestamp: new Date('2024-11-01T09:45:00'),
          isRead: true,
          hasAttachment: true,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          attachments: [{ name: 'API_문서_v2.pdf', size: 512000, url: '#' }],
          type: 'received',
          isArchived: false,
        },
        {
          id: '10',
          sender: { name: '한소희', username: 'han890' },
          subject: '디자인 시안 검토 요청',
          content: '<p>새로운 랜딩 페이지 디자인 시안을 첨부합니다. 피드백 부탁드립니다.</p>',
          timestamp: new Date('2024-10-31T16:30:00'),
          isRead: false,
          hasAttachment: true,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          attachments: [
            { name: '랜딩페이지_시안_v1.fig', size: 3072000, url: '#' },
            { name: '이미지_에셋.zip', size: 1536000, url: '#' }
          ],
          type: 'received',
          isArchived: false,
        },
        {
          id: '11',
          sender: [
            { name: '박서연', username: 'park321' },
            { name: '이준호', username: 'lee654' }
          ],
          subject: '팀 워크샵 일정 공유',
          content: '<p>다음 달 팀 워크샵 일정과 장소가 확정되었습니다. 참석 여부 회신 바랍니다.</p>',
          timestamp: new Date('2024-10-29T10:00:00'),
          isRead: true,
          hasAttachment: false,
          isPinned: false,
          recipients: [{ name: '임지선', username: 'joy' }],
          type: 'received',
          isArchived: false,
        },
      ],

      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
          }
        ]
      })),

      markAsRead: (messageId) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      })),

      markAllAsRead: () => set((state) => ({
        messages: state.messages.map((msg) => ({ ...msg, isRead: true }))
      })),

      togglePin: (messageId) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
        )
      })),

      deleteMessage: (messageId) => set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== messageId)
      })),

      archiveMessage: (messageId) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isArchived: true } : msg
        )
      })),

      unarchiveMessage: (messageId) => set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isArchived: false } : msg
        )
      })),

      // 받은쪽지함: 받은쪽지 전체 (보관 여부 상관없이)
      getReceivedMessages: () => {
        return get().messages.filter((msg) => msg.type === 'received');
      },

      // 보낸쪽지함: 보낸쪽지 전체 (보관 여부 상관없이)
      getSentMessages: () => {
        return get().messages.filter((msg) => msg.type === 'sent');
      },

      // 보관함: 보관된 쪽지만 (받은/보낸 구분없이)
      getArchivedMessages: () => {
        return get().messages.filter((msg) => msg.isArchived);
      },
    }),
    {
      name: 'message-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              messages: state.messages.map((msg: Message) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }
          };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);
