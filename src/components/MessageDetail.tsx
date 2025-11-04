import type { Message } from '../store/messageStore';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import styles from '../styles/Messages.module.css';
import profile1 from '../assets/images/profile-1.png';
import composeIcon from '../assets/images/icon-compose.png';
import personIcon from '../assets/images/person-icon.png';
import attachmentImg from '../assets/images/attachmentImg.png';

interface MessageDetailProps {
  message: Message;
}

const MessageDetail = ({ message }: MessageDetailProps) => {
  // 파일 다운로드 처리
  const handleDownload = (file: { name: string; size: number }) => {
    // 실제 파일 다운로드 로직 (브라우저 다운로드)
    const link = document.createElement('a');
    link.href = '#'; // 실제 파일 URL로 변경 필요
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`${file.name} 파일을 다운로드합니다.`);
  };

  // 뷰어로 열기 처리
  const handleOpenViewer = (file: { name: string; size: number }) => {
    // 실제 뷰어 열기 로직
    alert(`${file.name} 파일을 뷰어로 엽니다.`);
    // 여기에 뷰어 모달이나 새 창을 여는 로직 추가
  };

  // 드롭다운 메뉴 아이템
  const getMenuItems = (file: { name: string; size: number }): MenuProps['items'] => [
    {
      key: 'download',
      label: 'PC저장',
      onClick: () => handleDownload(file),
    },
    {
      key: 'viewer',
      label: '뷰어열기',
      onClick: () => handleOpenViewer(file),
    },
  ];

  return (
    <>
      <div className={styles.detailHeader}>
        <div className={styles.senderSection}>
          <span className={styles.senderAvatar}>
            <img
                  src={profile1}
                  alt="프로필"
                  width={24}
                  height={24}
                />
          </span>
          <div className={styles.senderDetails}>
            <h3>
              {message.type === 'sent'
                ? '임지선 (joy)' // 보낸쪽지함에서는 나를 표시
                : Array.isArray(message.sender)
                ? message.sender.map((s, i) => {
                    const senders = message.sender as Array<typeof s>;
                    return (
                      <span key={i}>
                        {s.name} ({s.username})
                        {i < senders.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })
                : `${message.sender.name} (${message.sender.username})`
              }
            </h3>
          </div>
          <button className={styles.replyButton}> 
            <img
                src={composeIcon}
                alt="답장보내기"
                className={styles.composeIcon}
              />
          </button>
        </div>
        <div className={styles.subjectSection}>
          <h2>{message.subject}</h2>
          <p className={styles.receivedDate}>
            {new Date(message.timestamp).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.recipientSection}>
          <div className={styles.recipientRow}>
            <span className={styles.recipientLabel}>
              <img
                src={personIcon}
                alt="사람아이콘"
                width={11}
                height={10}
              />
              받은사람
            </span>
            <span className={styles.recipientList}>
              {message.recipients.map((r, i) => (
                <span key={i}>
                  {r.name} ({r.username})
                  {i < message.recipients.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </div>
          {message.cc && message.cc.length > 0 && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>
                <img
                src={personIcon}
                alt="사람아이콘"
                width={11}
                height={10}
              />
                참조
                </span>
              <span className={styles.recipientList}>
                {message.cc.map((c, i) => (
                  <span key={i}>
                    {c.name} ({c.username})
                    {i < (message.cc?.length || 0) - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </div>
          )}
           {message.attachments && message.attachments.length > 0 && (
          <div className={styles.recipientRow}>
            <span className={styles.recipientLabel}>
             <img
                  src={attachmentImg}
                  alt="첨부파일있음"
                  className={styles.pinIconImg}
                  width={10}
                  height={9}
                /> 첨부파일
              </span>
            <div className={styles.attachmentList}>
              {message.attachments.map((file, i) => (
                <div key={i} className={styles.attachmentItem}>
                  <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                    <button className={styles.downloadButton}>
                      <span>{file.name}</span>
                    </button>
                  </Dropdown>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

       

        <div className={styles.contentSection}>
          <div dangerouslySetInnerHTML={{ __html: message.content }} />
        </div>
      </div>
    </>
  );
};

export default MessageDetail;
