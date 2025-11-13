// src\components\NoticeItem.tsx

import type { Notice } from '../store/noticeStore';
import styles from '../styles/NoticeItem.module.css';
import arrowIcon from '../assets/images/icon-arrow.png';
interface NoticeItemProps {
  notice: Notice;
  isSelected: boolean;
  isUnread: boolean;
  formatDateTime: (value: Date | string) => string;
  onClick: () => void;
}

const NoticeItem = ({
  notice,
  isSelected,
  isUnread,
  formatDateTime,
  onClick,
}: NoticeItemProps) => {
  const status = notice.status;

  return (
    <div
      className={`${styles.noticeItem} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.noticeItemHeaderWrap}>
          <div className={styles.noticeItemHeader}>
              <span className={`${styles.subject} ${isUnread ? styles.unread : ''}`}>
                <span>{notice.title}</span>
              </span>
          </div>
          <div className={styles.noticeItemContent}>
            <span className={styles.timestamp}>
              <span>   {formatDateTime(notice.createdAt)}</span>
            </span>
          </div>
      </div>
      <div className={styles.noticeicon}>
            {status === '임시저장' && (
              <span className={`${styles.noticestate} ${styles.temporary}`}>
                임시저장
              </span>
            )}
            {status === '공지예정' && (
              <span className={`${styles.noticestate} ${styles.soon}`}>
                공지예정
              </span>
            )}
            {status === '공지종료' && (
              <span className={`${styles.noticestate} ${styles.end}`}>
                공지종료
              </span>
            )}
            {isUnread && status === '공지중' && (
              <span className={styles.newBadge}>N</span>
            )}
          <img
            src={arrowIcon}
            alt="공지사항보기"
            className={styles.composeIcon}
            style={{ width: '12px', height: '12px' }}
          />
      </div>

    </div>
  );
};

export default NoticeItem;
