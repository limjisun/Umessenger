import { useState } from 'react';
import type { Notice } from '../store/noticeStore';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import common from '@/styles/Common.module.css';
import styles from '../styles/Messages.module.css';
import noticeEditIcon from '../assets/images/icon_noticeEdit.png';

interface NoticeDetailProps {
  notice: Notice;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const NoticeDetail = ({ notice, isAdmin, onEdit }: NoticeDetailProps) => {
  const [showAllTargets, setShowAllTargets] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);

  console.log('[NoticeDetail] isAdmin:', isAdmin, 'onEdit:', !!onEdit);

  // 파일 다운로드 처리
  const handleDownload = (file: { name: string; size: number; url: string }) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`${file.name} 파일을 다운로드합니다.`);
  };

  // 뷰어로 열기 처리
  const handleOpenViewer = (file: { name: string; size: number; url: string }) => {
    alert(`${file.name} 파일을 뷰어로 엽니다.`);
  };

  // 드롭다운 메뉴 아이템
  const getMenuItems = (file: { name: string; size: number; url: string }): MenuProps['items'] => [
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
        <div className={styles.subjectSection}>
          <h2>{notice.title}</h2>
          <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
            <p className={styles.receivedDate}>
              {new Date(notice.createdAt).toLocaleString('ko-KR', {
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            {isAdmin && onEdit && (
              <button
                className={styles.replyButton}
                onClick={onEdit}
              >
                <img
                  src={noticeEditIcon}
                  alt="공지사항수정"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.recipientSection}>
          {/* 공지기간 */}
          {notice.period && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>
                공지기간
              </span>
              <span className={styles.recipientList}>
                {new Date(notice.period.startAt).toLocaleString('ko-KR', {
                  hour12: false,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' ~ '}
                {notice.period.endAt
                  ? new Date(notice.period.endAt).toLocaleString('ko-KR', {
                      hour12: false,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '즉시 등록'}
              </span>
            </div>
          )}

          {/* 공지대상 (관리자 전용) */}
          {isAdmin && notice.targets && notice.targets.length > 0 && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>
                공지대상
              </span>
              <span className={styles.recipientList}>
                {showAllTargets ? (
                  <>
                    {notice.targets.map((t, i) => (
                      <span key={i}>
                        {t.name}
                        {i < notice.targets!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowAllTargets(false)}
                    >
                      [접기]
                    </button>
                  </>
                ) : notice.targets.length <= 3 ? (
                  <>
                    {notice.targets.map((t, i) => (
                      <span key={i}>
                        {t.name}
                        {i < notice.targets!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    {notice.targets.slice(0, 3).map((t, i) => (
                      <span key={i}>
                        {t.name}
                        {i < 2 ? ', ' : ''}
                      </span>
                    ))}
                    <span className={styles.moreText}> 외 {notice.targets.length - 3}명</span>
                    <button
                      className={styles.toggleButton}
                      onClick={() => setShowAllTargets(true)}
                    >
                      [모두보기]
                    </button>
                  </>
                )}
              </span>
            </div>
          )}

          {/* 첨부파일 */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className={styles.recipientRow}>
              <span className={styles.recipientLabel}>
                첨부파일
              </span>
              <div className={styles.attachmentList}>
                {showAllAttachments ? (
                  <>
                    {notice.attachments.map((file, i) => (
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
                ) : notice.attachments.length <= 2 ? (
                  <>
                    {notice.attachments.map((file, i) => (
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
                    {notice.attachments.slice(0, 2).map((file, i) => (
                      <div key={i} className={styles.attachmentItem}>
                        <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                          <button className={styles.downloadButton}>
                            <span>{file.name}</span>
                          </button>
                        </Dropdown>
                      </div>
                    ))}
                    <div>
                      <span className={styles.moreText}>외 {notice.attachments.length - 2}개</span>
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
          <div dangerouslySetInnerHTML={{ __html: notice.content }} />
        </div>
      </div>
    </>
  );
};

export default NoticeDetail;
