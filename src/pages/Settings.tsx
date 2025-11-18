// src\pages\Settings.tsx

/*
  설정 페이지 (Settings)
  - 알림 설정: 쪽지/공지사항 토글
  - 개인정보: 이름, 이메일 입력
  - 저장 시 콘솔 로그(민감 데이터 직접 출력은 지양)
*/
import { useState } from 'react';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import common from '@/styles/Common.module.css';
import styles from '../styles/Settings.module.css';
import composeStyles from '../styles/ComposeMessage.module.css';
import arrowIcon from '../assets/images/icon-arrow.png';
import checkOn from '../assets/images/check_on.png';
import checkOff from '../assets/images/check_off.png';
// 설정 항목 타입 정의
type SettingType = 'password' | 'notification';

interface SettingItem {
  id: SettingType;
  label: string;
}

// 설정 메뉴 항목
const SETTING_ITEMS: SettingItem[] = [
  { id: 'password', label: '비밀번호 설정' },
  { id: 'notification', label: '알림 설정' },
];

const Settings = () => {
  console.log('[Settings] 렌더링');
  const [selectedSetting, setSelectedSetting] = useState<SettingType>('password');

  // 알림 설정 상태
  const [messageNotification, setMessageNotification] = useState(true); // 쪽지 알림
  const [noticeNotification, setNoticeNotification] = useState(true); // 공지 알림

  // 전체 토글 상태는 쪽지, 공지 둘 다 체크된 경우에만 true
  const notificationEnabled = messageNotification && noticeNotification;

  // 설정 항목 클릭 핸들러
  const handleSettingClick = (settingId: SettingType) => {
    console.log('[Settings] 항목 선택:', settingId);
    setSelectedSetting(settingId);
  };

  // 전체 토글 핸들러
  const handleNotificationToggle = (checked: boolean) => {
    console.log('[Settings] 전체 알림 토글', checked);
    setMessageNotification(checked);
    setNoticeNotification(checked);
  };

  // 개별 알림 핸들러
  const handleMessageNotification = (checked: boolean) => {
    console.log('[Settings] 쪽지 알림', checked);
    setMessageNotification(checked);
  };

  const handleNoticeNotification = (checked: boolean) => {
    console.log('[Settings] 공지 알림', checked);
    setNoticeNotification(checked);
  };

  // 선택된 설정에 따른 컨텐츠 렌더링
  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'password':
        return (
          <div className={composeStyles.composeContainer}>
            <div className={composeStyles.composeHeader}>
              <h2>비밀번호 설정</h2>
            </div>
            <div className={composeStyles.composeBody}>
              <div className={composeStyles.titleWrap}>
                <div className={composeStyles.formGroup}>
                  <div className={composeStyles.inputWithButton}>
                    <label className={composeStyles.label} style={{ minWidth:'85px'}}>기존 비밀번호</label>
                    <input
                      type="password"
                      placeholder="기존 비밀번호"
                      className={composeStyles.input}
                    />
                  </div>
                </div>
                <div className={composeStyles.formGroup}>
                  <div className={composeStyles.inputWithButton}>
                    <label className={composeStyles.label}  style={{ minWidth:'85px'}}>새 비밀번호</label>
                    <input
                      type="password"
                      placeholder="새 비밀번호"
                      className={composeStyles.input}
                    />
                  </div>
                </div>
                <div className={composeStyles.formGroup}>
                  <div className={composeStyles.inputWithButton}>
                    <label className={composeStyles.label}  style={{ minWidth:'85px'}}>새 비밀번호 확인</label>
                    <input
                      type="password"
                      placeholder="새 비밀번호 확인"
                      className={composeStyles.input}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.setnotice}>
                <div className={styles.setnoticeTitle}>*비밀번호 유의사항</div>
                <ul className={styles.setnoticeUl}>
                  <li>비밀번호는 9-16글자로 구성해야 합니다.</li>
                  <li>영어 대문자가 한 글자 이상 반드시 포함되어 있어야 합니다. (A-Z)</li>
                  <li>영어 소문자가 한 글자 이상 반드시 포함되어 있어야 합니다. (a-z)</li>
                  <li>숫자가 한 글자 이상 반드시 포함되어 있어야 합니다. (0-9)</li>
                  <li>특수문자가 한 글자 이상 반드시 포함되어 있어야 합니다 ! @ # $ % ^ & . * ( )</li>
                  <li>연속된 문자를 3개 이상 사용할 수 없습니다. (abc, 123)</li>
                  <li>동일한 문자를 연속으로 3개 이상 사용할 수 없습니다. (aaa, 111)</li>
                  <li>비밀번호에 아이디를 포함할 수 없습니다.</li>
                  <li>비밀번호 변경시 상담사 전화(CTI), 어드민 공통 적용됩니다.</li>
                </ul>
              </div>
            </div>
            <div className={composeStyles.composeFooter}>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="primary"
                  onClick={() => console.log('[Settings] 비밀번호 변경')}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        );

      case 'notification':
        return (
          <div className={composeStyles.composeContainer}>
            <div className={composeStyles.composeHeader}>
              <h2>알림 설정</h2>
            </div>
            <div className={composeStyles.composeBody}>
              <div className={styles.setCheckWRap}>
                  {/* 전체 토글 */}
                  <div className={styles.setCheckCon}>
                    <div className={composeStyles.inputWithButton}>
                      <label>전체</label>
                      <Checkbox
                        type="toggle"
                        checked={notificationEnabled}
                        onChange={handleNotificationToggle}
                      />
                    </div>
                    <div className={composeStyles.inputWithButton}>
                      <div className={composeStyles.inputWithButton}>
                        <Checkbox
                          type="checkbox"
                            checkedIcon={checkOn}
                          uncheckedIcon={checkOff}
                          checked={messageNotification}
                          onChange={handleMessageNotification}
                        />
                        <label>쪽지</label>
                      </div>
                      <div className={composeStyles.inputWithButton}>
                        <Checkbox
                          type="checkbox"
                          checkedIcon={checkOn}
                          uncheckedIcon={checkOff}
                          checked={noticeNotification}
                          onChange={handleNoticeNotification}
                        />
                        <label >공지</label>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div className={composeStyles.composeFooter}>
              <div style={{ marginLeft: 'auto' }}>
                <Button
                  variant="primary"
                  onClick={() => console.log('[Settings] 알림 설정 저장', {
                    전체: notificationEnabled,
                    쪽지: messageNotification,
                    공지: noticeNotification
                  })}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={common.containerWrap}>

      {/* 좌측 - 목록 */}
      <div className={`${common.listLeft} ${styles.setLeft}`}>
        <div className={common.listHeader}  style={{ height: '39px' }}>
          <div className={common.headerActions}>
            <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
              <h2>설정</h2>
            </div>

          </div>
        </div>

        <div className={`${common.listItems}  ${styles.listsetting}`}>
          <div>
            {SETTING_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`${styles.setItem} ${selectedSetting === item.id ? styles.selected : ''}`}
                onClick={() => handleSettingClick(item.id)}
              >
                <div className={styles.setItemHeaderWrap}>
                  {item.label}
                </div>
                <div className={styles.seticon}>
                  <img src={arrowIcon} alt={item.label} className={styles.composeIcon} style={{ width: '12px', height: '12px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.setbottom}>
                <span className={styles.setbottomTitle}>U Messenger</span>
                <span className={styles.setbottomVer}>© 2025 NEXUS COMMUNITY All rights reserved</span>
          </div>
        </div>
      </div>
      <div className={common.listDetail}>
        {renderSettingContent()}
      </div>
    </div>
  );
};

export default Settings;

