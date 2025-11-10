import { type OrgUser } from '../store/organizationStore';
import styles from '../styles/Organization.module.css';

interface MyListDetailViewProps {
  selectedUser: OrgUser;
}

const MyListDetailView = ({ selectedUser }: MyListDetailViewProps) => {
  return (
    <div className={styles.detailContainer}>
      {/* 사용자 정보 헤더 */}
      <div className={styles.userDetailHeader}>
        <h2 className={styles.userDetailName}>{selectedUser.name}</h2>
        <span className={styles.userDetailId}>({selectedUser.username})</span>
      </div>

      {/* 사용자 상세 정보 */}
      <div className={styles.userDetailSection}>
        <div className={styles.userDetailRow}>
          <span className={styles.detailLabel}>이름</span>
          <span className={styles.detailValue}>{selectedUser.name}</span>
        </div>
        <div className={styles.userDetailRow}>
          <span className={styles.detailLabel}>아이디</span>
          <span className={styles.detailValue}>{selectedUser.username}</span>
        </div>
        {selectedUser.department && (
          <div className={styles.userDetailRow}>
            <span className={styles.detailLabel}>소속</span>
            <span className={styles.detailValue}>{selectedUser.department}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListDetailView;
