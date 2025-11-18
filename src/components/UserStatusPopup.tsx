import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/UserStatusPopup.module.css';
import { useState } from 'react';

interface UserStatusPopupProps {
  children: React.ReactElement;
}

const UserStatusPopup = ({ children }: UserStatusPopupProps) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.popupContainer}>
             
            <div className={styles.popupContent}>

             <div className={styles.popwrap}>
              <div className={styles.popupCon}>
                <span>이름</span>
                <span>(NEX10001)</span>
              </div>
                <span className={styles.online}>온라인</span>
            </div> 
              <Button
                type="primary"
                danger
                onClick={handleLogout}
                block
              >
                로그아웃
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserStatusPopup;
