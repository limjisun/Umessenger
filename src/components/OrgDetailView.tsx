import { useState } from 'react';
import { type OrgUser } from '../store/organizationStore';
import { Checkbox } from './common';
import styles from '../styles/Organization.module.css';
import sendIcon from '../assets/images/icon-send.png';
import profileIcon from '../assets/images/icon-profile.png';
import checkedImg from '../assets/images/check_on.png';
import uncheckedImg from '../assets/images/check_off.png';
// 팀별 그룹 정보
interface TeamGroup {
  teamId: string;
  teamName: string;
  path: string[];
  users: OrgUser[];
}

interface OrgDetailViewProps {
  selectedNode: {
    name: string;
    users: OrgUser[];
    path: string[];
    teamGroups?: TeamGroup[];
  };
  onSendMessage?: (user: OrgUser) => void;
}

const OrgDetailView = ({ selectedNode, onSendMessage }: OrgDetailViewProps) => {
  // 오프라인 숨김 상태
  const [hideOffline, setHideOffline] = useState(false);

  // 팀별 그룹이 있으면 팀별로, 없으면 전체 사용자 표시
  const hasTeamGroups = selectedNode.teamGroups && selectedNode.teamGroups.length > 0;

  const handleSendMessage = (user: OrgUser) => {
    if (onSendMessage) {
      onSendMessage(user);
    }
  };

  // 사용자 필터링 함수
  const filterUsers = (users: OrgUser[]) => {
    if (hideOffline) {
      return users.filter(user => user.isOnline !== false); // 온라인이거나 상태가 undefined인 경우 표시
    }
    return users;
  };

  return (
    <div className={styles.detailContainer}>
      {/* 오프라인 숨김 체크박스 */}
      <div className={styles.filterSection}>
        <Checkbox
          checked={hideOffline}
          onChange={setHideOffline}
          label="오프라인 숨김"
          type="checkbox"
          checkedIcon={checkedImg}
          uncheckedIcon={uncheckedImg}
        />
      </div>

      {hasTeamGroups ? (
        // 팀별로 구분하여 표시
        <>
          {selectedNode.teamGroups!.map((team) => {
            const filteredUsers = filterUsers(team.users);
            if (filteredUsers.length === 0) return null; // 필터링 후 사용자가 없으면 팀 섹션 숨김

            return (
              <div key={team.teamId} className={styles.teamSection}>
                {/* 팀별 경로 띠 */}
                <div className={styles.breadcrumb}>
                  {team.path.map((pathItem, index) => (
                    <span key={index}>
                      {index > 0 && <span className={styles.separator}> &gt; </span>}
                      <span className={styles.pathItem}>{pathItem}</span>
                    </span>
                  ))}
                </div>

                {/* 팀원 목록 */}
                <div className={styles.membersSection}>
                  <div className={styles.membersList}>
                    {filteredUsers.map((user) => (
                    <div key={user.id} className={styles.memberCard}>
                      <div className={styles.memberHeader}>
                        <div className={styles.memberInfo}>
                          <span className={`${styles.profilecheck} ${user.isOnline ? styles.on : ''}`}>
                             <img src={profileIcon} alt="프로필"  />
                          </span>
                          <span className={styles.memberName}>{user.name} ({user.username})</span>
                        </div>
                        <button
                          className={styles.sendMessageBtn}
                          onClick={() => handleSendMessage(user)}
                          title="쪽지 보내기"
                        >
                          <img src={sendIcon} alt="쪽지 보내기"  />
                        </button>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        // 단일 팀 선택 시 기존 방식
        <>
          <div className={styles.breadcrumb}>
            {selectedNode.path.map((pathItem, index) => (
              <span key={index}>
                {index > 0 && <span className={styles.separator}> &gt; </span>}
                <span className={styles.pathItem}>{pathItem}</span>
              </span>
            ))}
          </div>

          <div className={styles.membersSection}>
            {filterUsers(selectedNode.users).length === 0 ? (
              <div className={styles.emptyMembers}>
                <p>{hideOffline ? '온라인 팀원이 없습니다' : '소속된 팀원이 없습니다'}</p>
              </div>
            ) : (
              <div className={styles.membersList}>
                {filterUsers(selectedNode.users).map((user) => (
                  <div key={user.id} className={styles.memberCard}>
                    <div className={styles.memberHeader}>
                      <div className={styles.memberInfo}>
                          <span className={`${styles.profilecheck} ${user.isOnline ? styles.on : ''}`}>
                             <img src={profileIcon} alt="프로필"  />
                          </span>
                          <span className={styles.memberName}>{user.name} ({user.username})</span>
                      </div>
                      <button
                        className={styles.sendMessageBtn}
                        onClick={() => handleSendMessage(user)}
                        title="쪽지 보내기"
                      >
                        <img src={sendIcon} alt="쪽지 보내기" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrgDetailView;
