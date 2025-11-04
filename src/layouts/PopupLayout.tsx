import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import styles from '../styles/PopupLayout.module.css';

interface PopupLayoutProps {
  children: ReactNode;
}

const PopupLayout = ({ children }: PopupLayoutProps) => {
  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupContent}>
        <Sidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PopupLayout;
