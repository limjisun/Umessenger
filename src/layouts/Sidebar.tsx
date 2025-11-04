import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useMessageStore } from '../store/messageStore';
import UserStatusPopup from '../components/UserStatusPopup';
import styles from '../styles/Sidebar.module.css';

interface NavItem {
  key: string;
  title: string;
  iconOn: string;
  iconOff: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    key: 'messages',
    title: '쪽지',
    iconOn: '/src/assets/images/message-on.png',
    iconOff: '/src/assets/images/message-off.png',
    path: '/messages'
  },
  {
    key: 'organization',
    title: '조직도',
    iconOn: '/src/assets/images/organization-on.png',
    iconOff: '/src/assets/images/organization-off.png',
    path: '/organization'
  },
  {
    key: 'notice',
    title: '공지사항',
    iconOn: '/src/assets/images/notice-on.png',
    iconOff: '/src/assets/images/notice-off.png',
    path: '/notice'
  },
];

const settingsItem: NavItem = {
  key: 'settings',
  title: '설정',
  iconOn: '/src/assets/images/settings-on.png',
  iconOff: '/src/assets/images/settings-off.png',
  path: '/settings'
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { hasNewNotice, markNoticeAsRead } = useNotificationStore();
  const messages = useMessageStore((state) => state.messages);

  // 읽지 않은 메시지가 있는지 실시간으로 체크
  const hasUnreadMessages = messages.some((msg) => !msg.isRead);

  const handleNavClick = (path: string, key: string) => {
    navigate(path);

    // 공지사항 페이지 이동 시 N 마크 제거
    if (key === 'notice') {
      markNoticeAsRead();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/src/assets/images/logo.png"
          alt="메신저 로고"
          className={styles.logoImage}
          onError={(e) => {
            // 이미지 로드 실패 시 텍스트로 대체
            e.currentTarget.style.display = 'none';
            const h2 = document.createElement('h2');
            h2.textContent = '메신저';
            e.currentTarget.parentElement?.appendChild(h2);
          }}
        />
      </div>
      {user && (
        <UserStatusPopup>
          <div className={styles.userProfile}>
            <div className={styles.avatarWrapper}>
              <Avatar
                size={20}
                src="/src/assets/images/default-avatar.png"
                icon={<UserOutlined />}
                className={styles.avatar}
              />
              <span className={`${styles.statusIndicator} ${styles[user.status]}`} />
            </div>
            <div className={styles.userName}>{user.name}</div>
          </div>
        </UserStatusPopup>
      )}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge =
            (item.key === 'messages' && hasUnreadMessages) ||
            (item.key === 'notice' && hasNewNotice);

          return (
            <button
              key={item.key}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleNavClick(item.path, item.key)}
              title={item.title}
            >
              <div className={styles.iconWrapper}>
                <img
                  src={isActive ? item.iconOn : item.iconOff}
                  alt={item.title}
                  className={styles.navIcon}
                />
                {showBadge && (
                  <span className={styles.newBadge}>N</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
      <div className={styles.settingsSection}>
        <button
          className={`${styles.navItem} ${location.pathname === settingsItem.path ? styles.active : ''}`}
          onClick={() => navigate(settingsItem.path)}
          title={settingsItem.title}
        >
          <img
            src={location.pathname === settingsItem.path ? settingsItem.iconOn : settingsItem.iconOff}
            alt={settingsItem.title}
            className={styles.navIconset}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
