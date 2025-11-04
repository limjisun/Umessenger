import type { Message } from '../store/messageStore';
import styles from '../styles/Messages.module.css';
import profile1 from '../assets/images/profile-1.png';
import profile2 from '../assets/images/profile-2.png';
import profile3 from '../assets/images/profile-3.png';
import profileGroup from '../assets/images/profile-group.png';
import attachmentImg from '../assets/images/attachmentImg.png';
import pinImg from '../assets/images/pin.png';

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const MessageItem = ({ message, isSelected, onSelect, onContextMenu }: MessageItemProps) => {
  const getTimeDisplay = (date: Date) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const isToday = dateObj.toDateString() === now.toDateString();

    if (isToday) {
      return dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  };

  // 표시할 사람 정보 (받은쪽지함: 보낸사람, 보낸쪽지함: 받은사람들)
  const getSenderInfo = () => {
    if (message.type === 'received') {
      // 받은쪽지함: 보낸 사람 표시
      const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
      return `${sender.name} (${sender.username})`;
    } else {
      // 보낸쪽지함: 받은 사람들 표시
      const recipients = message.recipients;
      const primaryRecipient = recipients[0];

      if (recipients.length === 1) {
        return `${primaryRecipient.name} (${primaryRecipient.username})`;
      } else {
        return `${primaryRecipient.name} 외 ${recipients.length - 1}명 (${primaryRecipient.username})`;
      }
    }
  };

  // 프로필 이미지 결정 (받은쪽지함: 받은사람 수, 보낸쪽지함: 받은사람 수)
  const getProfileImage = () => {
    let count: number;

    if (message.type === 'received') {
      // 받은쪽지함: 받은 사람(recipients) 수에 따라
      count = message.recipients.length;
    } else {
      // 보낸쪽지함: 받은 사람(recipients) 수에 따라
      count = message.recipients.length;
    }

    if (count === 1) {
      return profile1; // 1명 이미지
    } else if (count === 2) {
      return profile2; // 2명 이미지
    } else if (count === 3) {
      return profile3; // 3명 이미지
    } else {
      return profileGroup; // 여러 명 이미지
    }
  };

  return (
    <div
      className={`${styles.messageItem} ${isSelected ? styles.selected : ''} ${!message.isRead ? styles.unread : ''}`}
      onClick={onSelect}
      onContextMenu={onContextMenu}
    >
      <img src={getProfileImage()} alt="프로필" className={styles.userIcon} />
      <div className={styles.messageItemHeaderWrap}>
          <div className={styles.messageItemHeader}>
            <div className={styles.senderInfoWrap}>
              <span className={styles.senderInfo}>
                <span>{getSenderInfo()}</span>
              </span>
               {message.isPinned && (
                <img
                  src={pinImg}
                  alt="고정됨"
                  className={styles.pinIconImg}
                  width={14}
                  height={16}
                />
              )}
            </div>
            <span className={styles.timestamp}>{getTimeDisplay(message.timestamp)}</span>
          </div>
          <div className={styles.messageItemContent}>
            <span className={styles.subject}>
              {message.hasAttachment && (
                <img
                  src={attachmentImg}
                  alt="첨부파일있음"
                  className={styles.pinIconImg}
                  width={10}
                  height={9}
                />
              )}
              {message.subject}
            </span>
             {!message.isRead && <span className={styles.newBadge}>N</span>}
          </div>
      </div>
    </div>
  );
};

export default MessageItem;
