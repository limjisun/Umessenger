import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import styles from '../styles/Organization.module.css';

const treeData: DataNode[] = [
  {
    title: '회사',
    key: '0',
    children: [
      {
        title: '경영진',
        key: '0-0',
        children: [
          { title: 'CEO', key: '0-0-0' },
          { title: 'CTO', key: '0-0-1' },
        ],
      },
      {
        title: '개발팀',
        key: '0-1',
        children: [
          { title: '프론트엔드', key: '0-1-0' },
          { title: '백엔드', key: '0-1-1' },
        ],
      },
    ],
  },
];

const Organization = () => {
  return (
    <div className={styles.organizationContainer}>
      <div className={styles.header}>
        <h1>조직도</h1>
      </div>

      <div className={styles.treeContainer}>
        <Tree
          showLine
          defaultExpandAll
          treeData={treeData}
        />
      </div>
    </div>
  );
};

export default Organization;
