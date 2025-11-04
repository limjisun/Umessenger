import { useState } from 'react';
import { Tabs, Button } from './common';
import type { TabItem } from './common';
import styles from '../styles/OrganizationPicker.module.css';

interface OrgUser {
  id: string;
  name: string;
  username: string;
  position?: string;
  department?: string;
}

interface OrgTreeNode {
  id: string;
  name: string;
  users: OrgUser[];
  children?: OrgTreeNode[];
  expanded?: boolean;
}

interface OrganizationPickerProps {
  onClose: () => void;
  onSelect: (users: OrgUser[]) => void;
  multiple?: boolean;
}

// Mock 조직도 데이터
const mockOrgTree: OrgTreeNode = {
  id: '1',
  name: '전체',
  users: [],
  children: [
    {
      id: '2',
      name: '경영지원팀',
      users: [
        { id: 'u1', name: '홍길동', username: 'hong123', position: '팀장', department: '경영지원팀' },
        { id: 'u2', name: '김철수', username: 'kim123', position: '대리', department: '경영지원팀' },
      ],
      children: [],
    },
    {
      id: '3',
      name: '개발팀',
      users: [
        { id: 'u3', name: '이영희', username: 'lee123', position: '팀장', department: '개발팀' },
        { id: 'u4', name: '박민수', username: 'park123', position: '사원', department: '개발팀' },
      ],
      children: [
        {
          id: '4',
          name: '프론트엔드팀',
          users: [
            { id: 'u5', name: '최지훈', username: 'choi123', position: '주임', department: '프론트엔드팀' },
          ],
        },
        {
          id: '5',
          name: '백엔드팀',
          users: [
            { id: 'u6', name: '정서연', username: 'jung123', position: '주임', department: '백엔드팀' },
          ],
        },
      ],
    },
  ],
};

// Mock 마이리스트
const mockMyLists = [
  {
    id: 'list1',
    name: '자주 연락하는 사람',
    users: [
      { id: 'u1', name: '홍길동', username: 'hong123', position: '팀장' },
      { id: 'u3', name: '이영희', username: 'lee123', position: '팀장' },
    ],
  },
  {
    id: 'list2',
    name: '프로젝트 팀원',
    users: [
      { id: 'u4', name: '박민수', username: 'park123', position: '사원' },
      { id: 'u5', name: '최지훈', username: 'choi123', position: '주임' },
    ],
  },
];

const OrganizationPicker = ({ onClose, onSelect, multiple = true }: OrganizationPickerProps) => {
  const [activeTab, setActiveTab] = useState<string>('org');
  const [selectedUsers, setSelectedUsers] = useState<OrgUser[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleUserSelect = (user: OrgUser) => {
    if (multiple) {
      const isSelected = selectedUsers.some(u => u.id === user.id);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      setSelectedUsers([user]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedUsers);
    onClose();
  };

  const renderOrgTree = (node: OrgTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className={styles.treeNode}>
        <div
          className={styles.nodeHeader}
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
          )}
          <span className={styles.folderIcon}>📁</span>
          <span className={styles.nodeName}>{node.name}</span>
        </div>

        {isExpanded && (
          <>
            {node.users.map(user => (
              <div
                key={user.id}
                className={`${styles.userItem} ${selectedUsers.some(u => u.id === user.id) ? styles.selected : ''}`}
                style={{ paddingLeft: `${(level + 1) * 20 + 20}px` }}
                onClick={() => handleUserSelect(user)}
              >
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  checked={selectedUsers.some(u => u.id === user.id)}
                  readOnly
                />
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userInfo}>({user.username})</span>
                {user.position && <span className={styles.userPosition}>{user.position}</span>}
              </div>
            ))}
            {node.children?.map(child => renderOrgTree(child, level + 1))}
          </>
        )}
      </div>
    );
  };

  const renderMyList = () => {
    return (
      <div className={styles.myListContainer}>
        {mockMyLists.map(list => (
          <div key={list.id} className={styles.listGroup}>
            <div className={styles.listHeader}>{list.name}</div>
            {list.users.map(user => (
              <div
                key={user.id}
                className={`${styles.userItem} ${selectedUsers.some(u => u.id === user.id) ? styles.selected : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  checked={selectedUsers.some(u => u.id === user.id)}
                  readOnly
                />
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userInfo}>({user.username})</span>
                {user.position && <span className={styles.userPosition}>{user.position}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const tabItems: TabItem[] = [
    { key: 'org', label: '전체 조직도' },
    { key: 'mylist', label: '마이리스트' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.pickerContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerHeader}>
          <h3>사용자 검색</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

        <div className={styles.pickerBody}>
          {activeTab === 'org' ? renderOrgTree(mockOrgTree) : renderMyList()}
        </div>

        <div className={styles.selectedSection}>
          <div className={styles.selectedLabel}>
            선택된 사용자 ({selectedUsers.length}명)
          </div>
          <div className={styles.selectedList}>
            {selectedUsers.map(user => (
              <span key={user.id} className={styles.selectedUser}>
                {user.name}
                <button
                  onClick={() => handleUserSelect(user)}
                  className={styles.removeUser}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.pickerFooter}>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPicker;
