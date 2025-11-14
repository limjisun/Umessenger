import { useState } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import common from '@/styles/Common.module.css';
import styles from '../styles/Messages.module.css';
import Button from './common/Button';

interface NoticePreviewProps {
  title: string;
  content: string;
  author: string;
  startDate?: string;
  endDate?: string;
  targets: Array<{ name: string; username: string }>;
  targetGroups: Array<{ name: string }>;
  attachments: File[];
  onClose: () => void;
}

const NoticePreview = ({
  title,
  content,
  author,
  startDate,
  endDate,
  targets,
  targetGroups,
  attachments,
  onClose,
}: NoticePreviewProps) => {
  const [showAllTargets, setShowAllTargets] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);

  // 모든 대상 (그룹 + 개별 사용자)
  const allTargets = [
    ...targetGroups.map(g => ({ name: g.name, username: '' })),
    ...targets
  ];

  // 파일 다운로드 처리 (미리보기용)
  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 파일 뷰어 처리 (미리보기용)
  const handleOpenViewer = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  // 드롭다운 메뉴 아이템
  const getMenuItems = (file: File): MenuProps['items'] => [
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
    <div
      className={common.overlay} 
      onClick={onClose}
      >
      <div
        className={styles.noticemodalContent}
        onClick={(e) => e.stopPropagation()}
      >

         <div className={common.modalheader}>
          <h3>공지사항등록</h3>
          <button className={common.modalcloseButton} onClick={onClose}>✕</button>
        </div>

       <div className={styles.noticepreviewWrap}>
        <div className={styles.detailHeader}>
          <div className={styles.subjectSection}>
            <h2>{title || '(제목 없음)'}</h2>
            <div className={`${common.flex} ${common.alignCenter} ${common.gap18}`}>
              <p className={styles.receivedDate}>
                {new Date().toLocaleString('ko-KR', {
                  hour12: false,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.detailBody}>
          <div className={styles.recipientSection}>
            {/* 공지기간 */}
            {(startDate || endDate) && (
              <div className={styles.recipientRow}>
                <span className={styles.recipientLabel}>공지기간</span>
                <span className={styles.recipientList}>
                  {startDate === '즉시 등록' ? (
                    '즉시 등록'
                  ) : startDate ? (
                    new Date(startDate).toLocaleString('ko-KR', {
                      hour12: false,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  ) : (
                    '미설정'
                  )}
                  {' ~ '}
                  {endDate
                    ? new Date(endDate).toLocaleString('ko-KR', {
                        hour12: false,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '미설정'}
                </span>
              </div>
            )}

            {/* 공지대상 */}
            {allTargets.length > 0 && (
              <div className={styles.recipientRow}>
                <span className={styles.recipientLabel}>공지대상</span>
                <span className={styles.recipientList}>
                  {showAllTargets ? (
                    <>
                      {allTargets.map((t, i) => (
                        <span key={i}>
                          {t.username ? `${t.name} (${t.username})` : t.name}
                          {i < allTargets.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      <button
                        className={styles.toggleButton}
                        onClick={() => setShowAllTargets(false)}
                      >
                        [접기]
                      </button>
                    </>
                  ) : allTargets.length <= 3 ? (
                    <>
                      {allTargets.map((t, i) => (
                        <span key={i}>
                          {t.username ? `${t.name} (${t.username})` : t.name}
                          {i < allTargets.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </>
                  ) : (
                    <>
                      {allTargets.slice(0, 3).map((t, i) => (
                        <span key={i}>
                          {t.username ? `${t.name} (${t.username})` : t.name}
                          {i < 2 ? ', ' : ''}
                        </span>
                      ))}
                      <span className={styles.moreText}> 외 {allTargets.length - 3}명</span>
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
            {attachments.length > 0 && (
              <div className={styles.recipientRow}>
                <span className={styles.recipientLabel}>첨부파일</span>
                <div className={styles.attachmentList}>
                  {showAllAttachments ? (
                    <>
                      {attachments.map((file, i) => (
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
                  ) : attachments.length <= 2 ? (
                    <>
                      {attachments.map((file, i) => (
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
                      {attachments.slice(0, 2).map((file, i) => (
                        <div key={i} className={styles.attachmentItem}>
                          <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                            <button className={styles.downloadButton}>
                              <span>{file.name}</span>
                            </button>
                          </Dropdown>
                        </div>
                      ))}
                      <div>
                        <span className={styles.moreText}>외 {attachments.length - 2}개</span>
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
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p style={{ color: '#999' }}>(내용 없음)</p>
            )}
          </div>
        </div>
      </div>
        {/* 푸터 버튼 */}
        <div
          className={common.modalFooter}
        >
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoticePreview;
