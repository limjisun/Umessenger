import { useState } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import locale from 'antd/locale/ko_KR';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import OrganizationPicker from './OrganizationPicker';
import TipTapEditor from './TipTapEditor';
import Button from './common/Button';
import Checkbox from './common/Checkbox';
import NoticePreview from './NoticePreview';
import common from '@/styles/Common.module.css';
import styles from '../styles/ComposeMessage.module.css';
import { useOrganizationStore, type OrgGroup } from '../store/organizationStore';
import groupIcon from '../assets/images/icon-group.png';
import checkOn from '../assets/images/check_on.png';
import checkOff from '../assets/images/check_off.png';

interface ComposeNoticeProps {
  onCancel: () => void;
  onSubmit: (data: NoticeData) => void;
  editingNotice?: {
    id: string;
    title: string;
    content: string;
    targets?: Array<{ id: string; name: string; username: string }>;
    attachments?: Array<{ name: string; size: number; url: string }>;
    period?: { startAt: string; endAt: string };
  };
}

interface NoticeData {
  id?: string;
  subject: string;
  content: string;
  targets: string[];
  attachments: File[];
  startDate?: string;
  endDate?: string;
  status?: '임시저장' | '공지중' | '공지예정';
}

interface User {
  name: string;
  username: string;
}

const ComposeNotice = ({ onCancel, onSubmit, editingNotice }: ComposeNoticeProps) => {
  const searchUsers = useOrganizationStore((state) => state.searchUsers);

  const [targets, setTargets] = useState<User[]>(() => {
    if (editingNotice?.targets) {
      return editingNotice.targets.map(t => ({ name: t.name, username: t.username }));
    }
    return [];
  });
  const [targetGroups, setTargetGroups] = useState<OrgGroup[]>([]);
  const [subject, setSubject] = useState(editingNotice?.title || '');
  const [content, setContent] = useState(editingNotice?.content || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(() => {
    if (editingNotice?.period?.startAt) {
      return dayjs(editingNotice.period.startAt);
    }
    return null;
  });
  const [endDate, setEndDate] = useState<Dayjs | null>(() => {
    if (editingNotice?.period?.endAt) {
      return dayjs(editingNotice.period.endAt);
    }
    return null;
  });
  const [isImmediate, setIsImmediate] = useState(false);

  const [targetInput, setTargetInput] = useState('');
  const [targetSuggestions, setTargetSuggestions] = useState<User[]>([]);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleOrgPickerSelect = (users: Array<{ name: string; username: string }>, groups?: OrgGroup[]) => {
    // 그룹에 속하지 않은 개별 사용자만 추가
    const groupUserIds = new Set(groups?.flatMap(g => g.userIds) || []);
    const individualUsers = users.filter(u => !groupUserIds.has((u as any).id));
    setTargets([...targets, ...individualUsers]);
    setTargetGroups([...targetGroups, ...(groups || [])]);
    setShowOrgPicker(false);
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleRemoveTargetGroup = (index: number) => {
    setTargetGroups(targetGroups.filter((_, i) => i !== index));
  };

  // 공지대상 검색
  const handleTargetInputChange = (value: string) => {
    setTargetInput(value);
    if (value.trim()) {
      const results = searchUsers(value);
      // 이미 선택된 사용자는 제외
      const filtered = results.filter(
        (user) => !targets.some((r) => r.username === user.username)
      );
      setTargetSuggestions(filtered);
    } else {
      setTargetSuggestions([]);
    }
  };

  // 공지대상 선택
  const handleSelectTarget = (user: User) => {
    setTargets([...targets, user]);
    setTargetInput('');
    setTargetSuggestions([]);
  };

  const handleSubmit = (isDraft = false) => {
    // 임시저장이 아닐 때만 유효성 검사
    if (!isDraft) {
      if (targets.length === 0 && targetGroups.length === 0) {
        alert('공지대상을 선택해주세요.');
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
    }

    // 그룹에 속한 모든 사용자를 실제로 펼쳐서 전송
    const getUserById = useOrganizationStore.getState().getUserById;

    const allTargetUsers: string[] = [];

    // 공지대상: 그룹의 모든 사용자 펼치기
    targetGroups.forEach(group => {
      group.userIds.forEach(userId => {
        const user = getUserById(userId);
        if (user) {
          allTargetUsers.push(`${user.name} (${user.username})`);
        }
      });
    });
    // 개별 사용자 추가
    targets.forEach(u => {
      allTargetUsers.push(`${u.name} (${u.username})`);
    });

    const noticeData: NoticeData = {
      id: editingNotice?.id,
      subject,
      content,
      targets: allTargetUsers,
      attachments,
      startDate: isImmediate ? '즉시 등록' : startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      status: isDraft ? '임시저장' : undefined,
    };
    onSubmit(noticeData);
  };

  return (
    <div className={styles.composeContainer}>
      <div className={styles.composeHeader}>
        <h2>{editingNotice ? '공지사항 수정' : '공지사항 등록'}</h2>
      </div>

      <div className={styles.composeBody}>
        <div className={styles.titleWrap}>
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>공지대상</label>
              <div className={styles.searchInputWrapper}>
                <div className={styles.chipInputContainer}>
                  {/* 그룹 표시 */}
                  {targetGroups.map((group, index) => (
                    <div key={`group-${index}`} className={styles.userChip}>
                      <span>{group.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTargetGroup(index)}
                        className={styles.chipRemoveButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {/* 개별 사용자 표시 */}
                  {targets.map((user, index) => (
                    <div key={`user-${index}`} className={styles.userChip} title={user.username}>
                      <span>{user.name} ({user.username})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTarget(index)}
                        className={styles.chipRemoveButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="이름 또는 아이디 입력"
                    value={targetInput}
                    onChange={(e) => handleTargetInputChange(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                {targetSuggestions.length > 0 && (
                  <div className={styles.suggestionList}>
                    {targetSuggestions.map((user, index) => (
                      <div
                        key={index}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectTarget(user)}
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
                onClick={() => setShowOrgPicker(true)}
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
              <label className={styles.label}>공지기간</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  {isImmediate ? (
                    <input
                      type="text"
                      value="즉시등록"
                      readOnly
                      className={styles.input}
                      style={{ width: '100%', cursor: 'pointer' }}
                      onClick={() => {
                        // 클릭 시 체크박스 해제 가능하도록
                        setIsImmediate(false);
                        setStartDate(null);
                      }}
                    />
                  ) : (
                    <ConfigProvider locale={locale}>
                      <DatePicker
                        showTime={{
                          format: 'HH:mm',
                          minuteStep: 5,
                        }}
                        format="YYYY년 MM월 DD일 HH:mm"
                        placeholder="시작일시"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        style={{ width: '100%' }}
                        showNow={false}
                        renderExtraFooter={() => (
                          <div style={{ padding: '3px' }}>
                            <Checkbox
                              type="checkbox"
                              checked={isImmediate}
                              checkedIcon={checkOn}
                              uncheckedIcon={checkOff}
                              onChange={(checked) => {
                                setIsImmediate(checked);
                                if (checked) {
                                  // 즉시 등록 체크 시 현재 날짜를 임시로 설정하여 확인 버튼 활성화
                                  setStartDate(dayjs());
                                } else {
                                  setStartDate(null);
                                }
                              }}
                              label="즉시 등록"
                            />
                          </div>
                        )}
                      />
                    </ConfigProvider>
                  )}
                </div>
                <span style={{ color: '#999' }}>~</span>
                <ConfigProvider locale={locale}>
                  <DatePicker
                    showTime={{
                      format: 'HH:mm',
                      minuteStep: 5,
                    }}
                    format="YYYY년 MM월 DD일 HH:mm"
                    placeholder="종료일시"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    style={{ flex: 1 }}
                    showNow={false}
                  />
                </ConfigProvider>
              </div>
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
                  id="file-upload-notice"
                />
                <label htmlFor="file-upload-notice" className={styles.fileLabel}>
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
          <Button variant="secondary" onClick={() => handleSubmit(true)}>
            임시저장
          </Button>
          <Button variant="secondary" onClick={() => setShowPreview(true)}>
            미리보기
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(false)} disabled={currentLength > maxLength}>
            {editingNotice ? '수정' : '등록'}
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

      {showPreview && (
        <NoticePreview
          title={subject}
          content={content}
          author="관리자"
          startDate={isImmediate ? '즉시 등록' : startDate?.toISOString()}
          endDate={endDate?.toISOString()}
          targets={targets}
          targetGroups={targetGroups}
          attachments={attachments}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ComposeNotice;
