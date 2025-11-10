import { useState } from 'react';
import type { Message } from '../store/messageStore';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import styles from '../styles/Messages.module.css';
import composeIcon from '../assets/images/icon-compose.png';

interface MessageDetailProps {
  message: Message;
}

const MessageDetail = ({ message }: MessageDetailProps) => {
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [showAllCC, setShowAllCC] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);
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
            {new Date(message.timestamp).toLocaleString('ko-KR', {
              hour12: false,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.recipientSection}>
          <div className={styles.recipientRow}>
            <span className={styles.recipientLabel}>
              받은사람
            </span>
            <span className={styles.recipientList}>
              {showAllRecipients ? (
                <>
                  {message.recipients.map((r, i) => (
                    <span key={i}>
                      {r.name} ({r.username})
                      {i < message.recipients.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowAllRecipients(false)}
                  >
                    [접기]
                  </button>
                </>
              ) : message.recipients.length <= 2 ? (
                <>
                  {message.recipients.map((r, i) => (
                    <span key={i}>
                      {r.name} ({r.username})
                      {i < message.recipients.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {message.recipients[0].name} ({message.recipients[0].username}), {message.recipients[1].name} ({message.recipients[1].username})
                  <span className={styles.moreText}> 외 {message.recipients.length - 2}명</span>
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowAllRecipients(true)}
                  >
                    [모두보기]
                  </button>
                </>
              )}
            </span>
          </div>
          {message.cc && message.cc.length > 0 && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>
                참조
                </span>
              <span className={styles.recipientList}>
                {showAllCC ? (
                  <>
                    {message.cc.map((c, i) => (
                      <span key={i}>
                        {c.name} ({c.username})
                        {i < (message.cc?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowAllCC(false)}
                    >
                      [접기]
                    </button>
                  </>
                ) : message.cc.length <= 2 ? (
                  <>
                    {message.cc.map((c, i) => (
                      <span key={i}>
                        {c.name} ({c.username})
                        {i < (message.cc?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    {message.cc[0].name} ({message.cc[0].username}), {message.cc[1].name} ({message.cc[1].username})
                    <span className={styles.moreText}> 외 {message.cc.length - 2}명</span>
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowAllCC(true)}
                    >
                      [모두보기]
                    </button>
                  </>
                )}
              </span>
            </div>
          )}
           {message.attachments && message.attachments.length > 0 && (
          <div className={styles.recipientRow}>
            <span className={styles.recipientLabel}>
               첨부파일
              </span>
            <div className={styles.attachmentList}>
              {showAllAttachments ? (
                <>
                  {message.attachments.map((file, i) => (
                    <div key={i} className={styles.attachmentItem}>
                      <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                        <button className={styles.downloadButton}>
                          <span>{file.name}</span>
                        </button>
                      </Dropdown>
                    </div>
                  ))}
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowAllAttachments(false)}
                  >
                    [접기]
                  </button>
                </>
              ) : message.attachments.length <= 2 ? (
                <>
                  {message.attachments.map((file, i) => (
                    <div key={i} className={styles.attachmentItem}>
                      <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                        <button className={styles.downloadButton}>
                          <span>{file.name}</span>
                        </button>
                      </Dropdown>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {message.attachments.slice(0, 2).map((file, i) => (
                    <div key={i} className={styles.attachmentItem}>
                      <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                        <button className={styles.downloadButton}>
                          <span>{file.name}</span>
                        </button>
                      </Dropdown>
                    </div>
                  ))}
                  <div>
                    <span className={styles.moreText}>외 {message.attachments.length - 2}개</span>
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowAllAttachments(true)}
                    >
                      [모두보기]
                    </button>
                  </div>
                </>
              )}
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
