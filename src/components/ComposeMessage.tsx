import { useState } from 'react';
import OrganizationPicker from './OrganizationPicker';
import TipTapEditor from './TipTapEditor';
import Button from './common/Button';
import common from '@/styles/Common.module.css';
import styles from '../styles/ComposeMessage.module.css';
import { useOrganizationStore } from '../store/organizationStore';
import groupIcon from '../assets/images/icon-group.png';
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

interface User {
  name: string;
  username: string;
}

const ComposeMessage = ({ onCancel, onSend }: ComposeMessageProps) => {
  const searchUsers = useOrganizationStore((state) => state.searchUsers);

  const [recipients, setRecipients] = useState<User[]>([]);
  const [cc, setCc] = useState<User[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'recipients' | 'cc'>('recipients');

  const [recipientInput, setRecipientInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [recipientSuggestions, setRecipientSuggestions] = useState<User[]>([]);
  const [ccSuggestions, setCcSuggestions] = useState<User[]>([]);

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
    if (pickerMode === 'recipients') {
      setRecipients([...recipients, ...users]);
    } else {
      setCc([...cc, ...users]);
    }
    setShowOrgPicker(false);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleRemoveCC = (index: number) => {
    setCc(cc.filter((_, i) => i !== index));
  };

  // 받는사람 검색
  const handleRecipientInputChange = (value: string) => {
    setRecipientInput(value);
    if (value.trim()) {
      const results = searchUsers(value);
      // 이미 선택된 사용자는 제외
      const filtered = results.filter(
        (user) => !recipients.some((r) => r.username === user.username)
      );
      setRecipientSuggestions(filtered);
    } else {
      setRecipientSuggestions([]);
    }
  };

  // 참조 검색
  const handleCcInputChange = (value: string) => {
    setCcInput(value);
    if (value.trim()) {
      const results = searchUsers(value);
      // 이미 선택된 사용자는 제외
      const filtered = results.filter(
        (user) => !cc.some((c) => c.username === user.username)
      );
      setCcSuggestions(filtered);
    } else {
      setCcSuggestions([]);
    }
  };

  // 받는사람 선택
  const handleSelectRecipient = (user: User) => {
    setRecipients([...recipients, user]);
    setRecipientInput('');
    setRecipientSuggestions([]);
  };

  // 참조 선택
  const handleSelectCC = (user: User) => {
    setCc([...cc, user]);
    setCcInput('');
    setCcSuggestions([]);
  };

  const handleSend = () => {
    // 유효성 검사
    if (recipients.length === 0) {
      alert('받는 사람을 선택해주세요.');
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
      recipients: recipients.map(u => `${u.name} (${u.username})`),
      cc: cc.map(u => `${u.name} (${u.username})`),
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
        {/* <button className={styles.closeButton} onClick={onCancel}>
          ✕
        </button> */}
      </div>

      <div className={styles.composeBody}>
       <div className={styles.titleWrap}>
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>받는사람</label>
              <div className={styles.searchInputWrapper}>
                <div className={styles.chipInputContainer}>
                  {recipients.map((user, index) => (
                    <div key={index} className={styles.userChip}>
                      <span>{user.name} ({user.username})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(index)}
                        className={styles.chipRemoveButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="이름 또는 아이디 입력"
                    value={recipientInput}
                    onChange={(e) => handleRecipientInputChange(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                {recipientSuggestions.length > 0 && (
                  <div className={styles.suggestionList}>
                    {recipientSuggestions.map((user, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectRecipient(user)}
                      >
                        {user.name} ({user.username})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.orgButton}
                onClick={() => {
                  setPickerMode('recipients');
                  setShowOrgPicker(true);
                }}
              >
                <img
                  src={groupIcon}
                  alt="조직도"
                />
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>참조</label>
              <div className={styles.searchInputWrapper}>
                <div className={styles.chipInputContainer}>
                  {cc.map((user, index) => (
                    <div key={index} className={styles.userChip}>
                      <span>{user.name} ({user.username})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCC(index)}
                        className={styles.chipRemoveButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="참조 (선택사항)"
                    value={ccInput}
                    onChange={(e) => handleCcInputChange(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                {ccSuggestions.length > 0 && (
                  <div className={styles.suggestionList}>
                    {ccSuggestions.map((user, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectCC(user)}
                      >
                        {user.name} ({user.username})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.orgButton}
                onClick={() => {
                  setPickerMode('cc');
                  setShowOrgPicker(true);
                }}
              >
                 <img
                  src={groupIcon}
                  alt="조직도"
                />
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
                 내 PC
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
