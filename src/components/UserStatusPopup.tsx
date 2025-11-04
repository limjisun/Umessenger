import { Select, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { UserStatus } from '../types';
import styles from '../styles/UserStatusPopup.module.css';
import { useState } from 'react';

interface UserStatusPopupProps {
  children: React.ReactElement;
}

const UserStatusPopup = ({ children }: UserStatusPopupProps) => {
  const { user, updateStatus, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: UserStatus) => {
    updateStatus(status);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusOptions = [
    {
      value: 'online',
      label: (
        <div className={styles.statusOption}>
          <span className={`${styles.statusDot} ${styles.online}`} />
          <span>온라인</span>
        </div>
      ),
    },
    {
      value: 'offline',
      label: (
        <div className={styles.statusOption}>
          <span className={`${styles.statusDot} ${styles.offline}`} />
          <span>오프라인</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.popupContainer}>
            <div className={styles.popupHeader}>
              <h3>내 상태 설정</h3>
            </div>
            <div className={styles.popupContent}>
              <div className={styles.statusSection}>
                <label className={styles.label}>상태</label>
                <Select
                  value={user?.status}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  className={styles.statusSelect}
                  style={{ width: '100%' }}
                />
              </div>
              <div className={styles.actionSection}>
                <Button
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  block
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserStatusPopup;
