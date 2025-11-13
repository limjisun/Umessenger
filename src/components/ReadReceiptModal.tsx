import common from '@/styles/Common.module.css';
import styles from '../styles/ReadReceiptModal.module.css';
import { Button } from './common';

interface ReadReceiptData {
  name: string;
  username: string;
  readAt?: string; // 읽은 시간 (undefined면 안읽음)
}

interface ReadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: ReadReceiptData[];
  cc?: ReadReceiptData[];
}

const ReadReceiptModal = ({ isOpen, onClose, recipients, cc }: ReadReceiptModalProps) => {
  if (!isOpen) return null;

  const formatReadTime = (readAt?: string) => {
    if (!readAt) return '안읽음';
    return new Date(readAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={common.overlay} onClick={onClose}>
      <div className={styles.readContainer} onClick={(e) => e.stopPropagation()}>
        <div className={common.modalheader}>
          <h3>수신확인</h3>
          <button className={common.modalcloseButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.readbody}>
          <h4>수신인 목록</h4>
          <table className={styles.readtable}>
            <thead>
              <tr>
                <th>순서</th>
                <th>받는사람</th>
                <th>최초 열람 일시</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient, index) => (
                <tr key={`recipient-${index}`}>
                  <td>{index + 1}</td>
                  <td>{recipient.name} ({recipient.username})</td>
                  <td>{formatReadTime(recipient.readAt)}</td>
                </tr>
              ))}
              {cc && cc.map((person, index) => (
                <tr key={`cc-${index}`}>
                  <td>{recipients.length + index + 1}</td>
                  <td>{person.name} ({person.username})</td>
                  <td>{formatReadTime(person.readAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={common.modalFooter}>
           <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ReadReceiptModal;
