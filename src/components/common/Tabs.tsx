import styles from './Tabs.module.css';

export interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

const Tabs = ({ items, activeKey, onChange, className }: TabsProps) => {
  return (
    <div className={`${styles.tabs} ${className || ''}`}>
      {items.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeKey === tab.key ? styles.activeTab : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
