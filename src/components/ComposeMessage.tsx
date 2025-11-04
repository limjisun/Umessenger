import { useState } from 'react';
import OrganizationPicker from './OrganizationPicker';
import TipTapEditor from './TipTapEditor';
import Button from './common/Button';
import common from '@/styles/Common.module.css';
import styles from '../styles/ComposeMessage.module.css';

interface ComposeMessageProps {
  onCancel: () => void;
  onSend: (data: MessageData) => void;
}

interface MessageData {
  recipients: string[];
  cc: string[];
  subject: string;
  content: string;
  attachments: File[];
}

const ComposeMessage = ({ onCancel, onSend }: ComposeMessageProps) => {
  const [recipients, setRecipients] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'recipients' | 'cc'>('recipients');

  // 글자 수 계산 (HTML 태그 제거)
  const getTextLength = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    return text.length;
  };

  const currentLength = getTextLength(content);
  const maxLength = 2000;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleOrgPickerSelect = (users: Array<{ name: string; username: string }>) => {
    const userNames = users.map(u => u.name).join(', ');
    if (pickerMode === 'recipients') {
      setRecipients(recipients ? `${recipients}, ${userNames}` : userNames);
    } else {
      setCc(cc ? `${cc}, ${userNames}` : userNames);
    }
    setShowOrgPicker(false);
  };

  const handleSend = () => {
    // 유효성 검사
    if (!recipients.trim()) {
      alert('받는 사람을 입력해주세요.');
      return;
    }

    if (!subject.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!textContent) {
      alert('내용을 입력해주세요.');
      return;
    }

    const messageData: MessageData = {
      recipients: recipients.split(',').map(r => r.trim()).filter(r => r),
      cc: cc.split(',').map(c => c.trim()).filter(c => c),
      subject,
      content,
      attachments,
    };
    onSend(messageData);
  };

  return (
    <div className={styles.composeContainer}>
      <div className={styles.composeHeader}>
        <h2>쪽지 보내기</h2>
        <button className={styles.closeButton} onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className={styles.composeBody}>
       <div className={styles.titleWrap}>
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>받는사람</label>
              <input
                type="text"
                placeholder="이름 또는 아이디 입력 (쉼표로 구분)"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.orgButton}
                onClick={() => {
                  setPickerMode('recipients');
                  setShowOrgPicker(true);
                }}
              >
                조직도
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>참조</label>
              <input
                type="text"
                placeholder="참조 (선택사항)"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.orgButton}
                onClick={() => {
                  setPickerMode('cc');
                  setShowOrgPicker(true);
                }}
              >
                조직도
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
          <div className={styles.inputWithButton2}>
            <label className={styles.label}>첨부파일</label>
            <div className={styles.attachmentArea}>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className={styles.fileInput}
                id="file-upload"
              />
              <label htmlFor="file-upload" className={styles.fileLabel}>
                 파일 선택
              </label>
              {attachments.length > 0 && (
                <div className={styles.attachmentList}>
                  {attachments.map((file, index) => (
                    <div key={index} className={styles.attachmentItem}>
                      <span>{file.name}</span>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className={styles.removeButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
      </div>

        <div className={styles.formGroup}>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

       
      </div>

      <div className={styles.composeFooter}>
        <div className={styles.charCounter}>
          <span className={currentLength > maxLength ? styles.overLimit : ''}>
            {currentLength}
          </span>
          /<span>{maxLength}</span>
        </div>
        <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
          <Button variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={currentLength > maxLength}>
            전송
          </Button>
        </div>
      </div>

      {showOrgPicker && (
        <OrganizationPicker
          onClose={() => setShowOrgPicker(false)}
          onSelect={handleOrgPickerSelect}
          multiple={true}
        />
      )}
    </div>
  );
};

export default ComposeMessage;
