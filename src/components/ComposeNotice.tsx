/*
  공지 작성/수정 컴포넌트 (ComposeNotice)
  - 공지 대상 선택(직접 입력 + 조직 선택기), 공지기간(즉시 등록/기간 지정), 제목/본문, 첨부파일 업로드
  - 임시저장/미리보기/등록(수정) 액션을 상위로 전달
*/
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
  id?: string;                                    // 아이디
  subject: string;                                // 제목
  content: string;                                // HTML 본문
  targets: string[];                              // 대상 표시 문자열 배열: "이름 (아이디)"
  attachments: File[];                            // 첨부파일
  startDate?: string;                             // ISO 또는 '즉시 등록'
  endDate?: string;                               // ISO
  status?: '임시저장' | '공개중' | '공개예정';      // 임시저장 시 '임시저장'로 전달
}

interface User { name: string; username: string }

const ComposeNotice = ({ onCancel, onSubmit, editingNotice }: ComposeNoticeProps) => {
  const searchUsers = useOrganizationStore((s) => s.searchUsers);
  const getUserById = useOrganizationStore.getState().getUserById;

  // 대상(개별/그룹)
  const [targets, setTargets] = useState<User[]>(() =>
    editingNotice?.targets ? editingNotice.targets.map((t) => ({ name: t.name, username: t.username })) : []
  );
  const [targetGroups, setTargetGroups] = useState<OrgGroup[]>([]);

  // 폼 입력
  const [subject, setSubject] = useState(editingNotice?.title || '');
  const [content, setContent] = useState(editingNotice?.content || '');
  const [attachments, setAttachments] = useState<File[]>([]);

  // 조직도
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  // 공지기간
  const [startDate, setStartDate] = useState<Dayjs | null>(
    editingNotice?.period?.startAt ? dayjs(editingNotice.period.startAt) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(editingNotice?.period?.endAt ? dayjs(editingNotice.period.endAt) : null);
  const [isImmediate, setIsImmediate] = useState(false);

  // 자동완성
  const [targetInput, setTargetInput] = useState('');
  const [targetSuggestions, setTargetSuggestions] = useState<User[]>([]);

  // 미리보기
  const [showPreview, setShowPreview] = useState(false);

  // 글자수 계산 (HTML 태그 제거)
  const getTextLength = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').length;
  const currentLength = getTextLength(content);
  const maxLength = 2000;

  // 첨부파일
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
    console.log('[ComposeNotice] 첨부 추가', { count: files.length, names: files.map((f) => f.name) });
  };
  const handleRemoveAttachment = (index: number) => {
    const f = attachments[index];
    setAttachments(attachments.filter((_, i) => i !== index));
    console.log('[ComposeNotice] 첨부 삭제', f?.name);
  };

  // 조직도
  const handleOrgPickerSelect = (users: Array<{ name: string; username: string }>, groups?: OrgGroup[]) => {
    const groupUserIds = new Set(groups?.flatMap((g) => g.userIds) || []);
    const individualUsers = users.filter((u) => !groupUserIds.has((u as any).id));
    setTargets((prev) => [...prev, ...individualUsers]);
    setTargetGroups((prev) => [...prev, ...(groups || [])]);
    setShowOrgPicker(false);
    console.log('[ComposeNotice] 조직도 적용', { users: users.length, groups: groups?.length ?? 0 });
  };
  const handleRemoveTarget = (index: number) => {
    const u = targets[index];
    setTargets(targets.filter((_, i) => i !== index));
    console.log('[ComposeNotice] 대상 제거', u?.username);
  };
  const handleRemoveTargetGroup = (index: number) => {
    const g = targetGroups[index];
    setTargetGroups(targetGroups.filter((_, i) => i !== index));
    console.log('[ComposeNotice] 대상 그룹 제거', g?.name);
  };

  // 자동완성
  const handleTargetInputChange = (value: string) => {
    setTargetInput(value);
    if (!value.trim()) {
      setTargetSuggestions([]);
      return;
    }
    const results = searchUsers(value);
    const filtered = results.filter((user) => !targets.some((r) => r.username === user.username));
    setTargetSuggestions(filtered);
    console.log('[ComposeNotice] 대상 검색', { q: value, results: filtered.length });
  };
  const handleSelectTarget = (user: User) => {
    setTargets([...targets, user]);
    setTargetInput('');
    setTargetSuggestions([]);
    console.log('[ComposeNotice] 대상 추가', user.username);
  };

  // 제출
  const handleSubmit = (isDraft = false) => {
    if (!isDraft) {
      if (targets.length === 0 && targetGroups.length === 0) {
        alert('공지 대상을 선택해 주세요.');
        console.log('[ComposeNotice] 제출 실패: 대상 없음');
        return;
      }
      if (!subject.trim()) {
        alert('제목을 입력해 주세요.');
        console.log('[ComposeNotice] 제출 실패: 제목 없음');
        return;
      }
      const text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (!text) {
        alert('내용을 입력해 주세요.');
        console.log('[ComposeNotice] 제출 실패: 본문 없음');
        return;
      }
    }

    const allTargetUsers: string[] = [];
    targetGroups.forEach((group) => {
      group.userIds.forEach((userId) => {
        const user = getUserById(userId);
        if (user) allTargetUsers.push(`${user.name} (${user.username})`);
      });
    });
    targets.forEach((u) => allTargetUsers.push(`${u.name} (${u.username})`));

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
    console.log('[ComposeNotice] 제출', { draft: isDraft, targets: allTargetUsers.length, attachments: attachments.length });
    onSubmit(noticeData);
  };

  return (
    <div className={styles.composeContainer}>
      <div className={styles.composeHeader}>
        <h2>{editingNotice ? '공지사항 수정' : '공지사항 등록'}</h2>
      </div>

      <div className={styles.composeBody}>
        <div className={styles.titleWrap}>
          {/* 공지 대상 */}
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>공지대상</label>
              <div className={styles.searchInputWrapper}>
                <div className={styles.chipInputContainer}>
                  {/* 그룹 표시 */}
                  {targetGroups.map((group, index) => (
                    <div key={`group-${index}`} className={styles.userChip}>
                      <span>{group.name}</span>
                      <button type="button" onClick={() => handleRemoveTargetGroup(index)} className={styles.chipRemoveButton}>
                        ×
                      </button>
                    </div>
                  ))}
                  {/* 개별 사용자 표시 */}
                  {targets.map((user, index) => (
                    <div key={`user-${index}`} className={styles.userChip} title={user.username}>
                      <span>
                        {user.name} ({user.username})
                      </span>
                      <button type="button" onClick={() => handleRemoveTarget(index)} className={styles.chipRemoveButton}>
                        ×
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
                      <div key={index} className={styles.suggestionItem} onClick={() => handleSelectTarget(user)}>
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
                  setShowOrgPicker(true);
                  console.log('[ComposeNotice] 조직 선택 열기');
                }}
              >
                <img src={groupIcon} alt="조직선택" />
              </button>
            </div>
          </div>

          {/* 공지기간 */}
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

          {/* 제목 */}
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton}>
              <label className={styles.label}>제목</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  console.log('[ComposeNotice] 제목 변경');
                }}
                className={styles.input}
              />
            </div>
          </div>

          {/* 첨부파일 */}
          <div className={styles.formGroup}>
            <div className={styles.inputWithButton2}>
              <label className={styles.label}>첨부파일</label>
              <div className={styles.attachmentArea}>
                <input type="file" multiple onChange={handleFileChange} className={styles.fileInput} id="file-upload-notice" />
                <label htmlFor="file-upload-notice" className={styles.fileLabel}>
                  내 PC
                </label>
                {attachments.length > 0 && (
                  <div className={styles.attachmentList}>
                    {attachments.map((file, index) => (
                      <div key={index} className={styles.attachmentItem}>
                        <span>{file.name}</span>
                        <button onClick={() => handleRemoveAttachment(index)} className={styles.removeButton}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className={styles.formGroup}>
          <TipTapEditor value={content} onChange={(v) => setContent(v)} />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className={styles.composeFooter}>
        <div className={styles.charCounter}>
          <span className={currentLength > maxLength ? styles.overLimit : ''}>{currentLength}</span>/<span>{maxLength}</span>
        </div>
        <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
          <Button
            variant="secondary"
            onClick={() => {
              console.log('[ComposeNotice] 취소 클릭');
              onCancel();
            }}
          >
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

      {/* 조직 선택기 */}
      {showOrgPicker && (
        <OrganizationPicker onClose={() => setShowOrgPicker(false)} onSelect={handleOrgPickerSelect} multiple={true} />
      )}

      {/* 미리보기 */}
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

