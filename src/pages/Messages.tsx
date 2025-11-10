import { useState, useMemo } from 'react';
import ComposeMessage from '../components/ComposeMessage';
import MessageDetail from '../components/MessageDetail';
import MessageItem from '../components/MessageItem';
import { Tabs } from '../components/common';
import type { TabItem } from '../components/common/Tabs';
import { useMessageStore, type Message } from '../store/messageStore';
import common from '@/styles/Common.module.css';
import styles from '../styles/Messages.module.css';
import sortDropdownIcon from '../assets/images/icon-sortdrop.png';
import noteIcon from '../assets/images/icon-note.png';
import searchIcon from '../assets/images/icon-search.png';

const Messages = () => {
  const messages = useMessageStore((state) => state.messages);
  const {
    addMessage,
    markAsRead,
    markAllAsRead,
    togglePin,
    deleteMessage,
    archiveMessage,
    unarchiveMessage,
  } = useMessageStore();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<string>('received');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortType, setSortType] = useState<'latest' | 'unread'>('latest'); // 정렬 타입
  const [isComposing, setIsComposing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; messageId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    messageId: null
  });

  // 탭에 따라 보여줄 메시지 필터링 및 정렬
  const filteredMessages = useMemo(() => {
    let filtered: Message[] = [];

    // 1. 탭에 따른 필터링
    switch (activeTab) {
      case 'received':
        filtered = messages.filter((msg) => msg.type === 'received');
        break;
      case 'sent':
        filtered = messages.filter((msg) => msg.type === 'sent');
        break;
      case 'archived':
        filtered = messages.filter((msg) => msg.isArchived);
        break;
      default:
        filtered = messages.filter((msg) => msg.type === 'received');
    }

    // 2. 검색어 필터링 (제목, 내용, 발신자 이름, 발신자 아이디)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((msg) => {
        // 제목 검색
        const subjectMatch = msg.subject.toLowerCase().includes(query);

        // 내용 검색 (HTML 태그 제거)
        const contentText = msg.content.replace(/<[^>]*>/g, '');
        const contentMatch = contentText.toLowerCase().includes(query);

        // 발신자 정보 검색
        const senders = Array.isArray(msg.sender) ? msg.sender : [msg.sender];
        const senderMatch = senders.some(
          (sender) =>
            sender.name.toLowerCase().includes(query) ||
            sender.username.toLowerCase().includes(query)
        );

        return subjectMatch || contentMatch || senderMatch;
      });
    }

    // 3. 정렬 적용
    return filtered.sort((a, b) => {
      // 고정된 메시지를 맨 위로
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 정렬 타입에 따른 정렬
      if (sortType === 'latest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortType === 'unread') {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }

      return 0;
    });
  }, [activeTab, messages, sortType, searchQuery]);

  const sortMenuItems = [
    { key: '1', label: '최신 쪽지 순', type: undefined },
    { key: '2', label: '안 읽은 쪽지 순', type: undefined },
    { key: 'divider', label: '', type: 'divider' as const },
    { key: '3', label: '모두 읽음 처리', type: undefined },
  ];

  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    setSortMenuOpen(false);
  };

  const handleContextMenuAction = (action: string, messageId: string) => {
    switch (action) {
      case 'pin':
      case 'unpin':
        togglePin(messageId);
        break;
      case 'delete':
        deleteMessage(messageId);
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        break;
      case 'archive':
        archiveMessage(messageId);
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        break;
      case 'unarchive':
        unarchiveMessage(messageId);
        break;
    }
    handleCloseContextMenu();
  };

  // 컨텍스트 메뉴 아이템을 동적으로 생성
  const getContextMenuItems = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message) return [];

    const items = [];

    // 고정/해제 옵션
    if (message.isPinned) {
      items.push({ key: 'unpin', label: '쪽지 상단 해제', danger: false });
    } else {
      items.push({ key: 'pin', label: '쪽지 상단 고정', danger: false });
    }
    // 보관/보관해제 옵션
    if (message.isArchived) {
      items.push({ key: 'unarchive', label: '보관함에서 꺼내기', danger: false });
    } else {
      items.push({ key: 'archive', label: '쪽지 보관하기', danger: false });
    }
   // 삭제 옵션
    items.push({ key: 'delete', label: '쪽지 삭제하기', danger: true });

    return items;
  };

  const tabItems: TabItem[] = [
    { key: 'received', label: '받은쪽지함' },
    { key: 'sent', label: '보낸쪽지함' },
    { key: 'archived', label: '보관함' },
  ];

  return (
    <div className={common.containerWrap} onClick={handleCloseContextMenu}>
      {/* 중간 - 쪽지 목록 */}
      <div className={common.listLeft}>
        <div className={common.listHeader}>
          <div className={common.headerActions}>
          <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
            <h2>쪽지</h2>
                       
            <div className={common.sortDropdown}>
              <button
                className={styles.sortButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortMenuOpen(!sortMenuOpen);
                }}
              >
                 <img
                src={sortDropdownIcon}
                alt="정렬"
              />
              </button>
              {sortMenuOpen && (
                <div className={common.sortMenu}>
                  {sortMenuItems.map((item) => {
                    if (item.type === 'divider') {
                      return <div key={item.key} className={styles.menuDivider} />;
                    }

                    // 현재 선택된 항목인지 체크
                    const isSelected =
                      (item.key === '1' && sortType === 'latest') ||
                      (item.key === '2' && sortType === 'unread');

                    return (
                      <button
                        key={item.key}
                        className={`${common.menuItem} ${isSelected ? common.menuItemSelected : ''}`}
                        onClick={() => {
                          if (item.key === '1') {
                            setSortType('latest');
                          } else if (item.key === '2') {
                            setSortType('unread');
                          } else if (item.key === '3') {
                            markAllAsRead();
                          }
                          setSortMenuOpen(false);
                        }}
                      >
                        {isSelected && <span className={styles.checkmark}>✓ </span>}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
           </div>
           <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ fontSize: '12px', marginRight: '8px' }}
            >
              🔄 초기화
            </button>

            <button
              className={styles.composeButton}
              onClick={() => {
                setIsComposing(true);
                setSelectedMessage(null);
              }}
            >
               <img
                src={noteIcon}
                alt="쪽지보내기"
                className={styles.composeIcon}
              />
            </button>
            </div>
          </div>

          <div className={common.searchWrapper}>
             <img
              src={searchIcon}
              alt="검색"
              className={common.searchIcon}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={common.searchInput}
            />
            
          </div>
        </div>

        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

        <div className={common.listItems}>
          {filteredMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isSelected={selectedMessage?.id === message.id}
              onSelect={() => {
                setSelectedMessage(message);
                if (!message.isRead) {
                  markAsRead(message.id);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, message.id)}
            />
          ))}
        </div>
      </div>

      {/* 오른쪽 - 쪽지 상세 또는 작성 */}
      <div className={common.listDetail}>
        {isComposing ? (
          <ComposeMessage
            onCancel={() => setIsComposing(false)}
            onSend={(data) => {
              // 보낸 쪽지함에 메시지 추가
              addMessage({
                sender: { name: '임지선', username: 'joy' }, // 현재 로그인 사용자 (실제로는 authStore에서 가져와야 함)
                subject: data.subject,
                content: data.content,
                isRead: true, // 보낸 쪽지는 읽음 상태
                hasAttachment: data.attachments.length > 0,
                isPinned: false,
                recipients: data.recipients.map(name => ({ name, username: '' })), // 실제로는 조직도에서 선택한 정보 사용
                cc: data.cc.length > 0 ? data.cc.map(name => ({ name, username: '' })) : undefined,
                attachments: data.attachments.length > 0 ? data.attachments.map(file => ({
                  name: file.name,
                  size: file.size,
                  url: '#'
                })) : undefined,
                type: 'sent',
                isArchived: false,
              });

              // 성공 팝업 표시
              alert('쪽지가 전송되었습니다.');

              setIsComposing(false);
              setActiveTab('sent'); // 보낸쪽지함으로 이동
            }}
          />
        ) : selectedMessage ? (
          <MessageDetail message={selectedMessage} />
        ) : (
          <div className={styles.emptyState}>
            <p>쪽지를 선택해주세요</p>
          </div>
        )}
      </div>

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu.visible && contextMenu.messageId && (
        <div
          className={ `${common.sortMenu} ${common.chat}`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {getContextMenuItems(contextMenu.messageId).map((item) => (
            <button
              key={item.key}
              className={`${common.menuItem} ${item.danger ? styles.danger : ''}`}
              onClick={() => handleContextMenuAction(item.key, contextMenu.messageId!)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
