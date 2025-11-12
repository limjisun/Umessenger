import { useState } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { Tabs, Button } from './common';
import type { TabItem } from './common';
import common from '@/styles/Common.module.css';
import styles from '../styles/OrganizationPicker.module.css';
import { useOrganizationStore, type OrgUser, type OrgTreeNode } from '../store/organizationStore';
import searchIcon from '../assets/images/icon-search.png';
import arrowDown from '../assets/images/tree_on.png';
import arrowRight from '../assets/images/tree_off.png';

interface OrganizationPickerProps {
  onClose: () => void;
  onSelect: (users: OrgUser[]) => void;
  multiple?: boolean;
}

// organizationStore의 데이터를 Ant Design Tree 형식으로 변환
const convertToTreeData = (node: OrgTreeNode, allUsers: Map<string, OrgUser>, searchQuery?: string): DataNode | null => {
  const children: DataNode[] = [];

  // 사용자들을 자식 노드로 추가
  if (node.users && node.users.length > 0) {
    node.users.forEach((user) => {
      // 검색어가 있으면 필터링
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesUsername = user.username.toLowerCase().includes(query);
        if (!matchesName && !matchesUsername) {
          return; // 검색어와 매치되지 않으면 스킵
        }
      }

      // Map에 사용자 정보 저장
      allUsers.set(`user-${user.id}`, user);
      children.push({
        title: `${user.name} (${user.username})`,
        key: `user-${user.id}`,
        isLeaf: true,
      });
    });
  }

  // 하위 조직을 자식 노드로 추가
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const childNode = convertToTreeData(child, allUsers, searchQuery);
      if (childNode) {
        children.push(childNode);
      }
    });
  }

  // 검색어가 있을 때 자식이 없으면 이 노드는 표시하지 않음
  if (searchQuery && children.length === 0) {
    return null;
  }

  return {
    title: node.name,
    key: node.id,
    children: children.length > 0 ? children : undefined,
  };
};

const OrganizationPicker = ({ onClose, onSelect, multiple = true }: OrganizationPickerProps) => {
  const orgTree = useOrganizationStore((state) => state.orgTree);
  const myLists = useOrganizationStore((state) => state.myLists);
  const [activeTab, setActiveTab] = useState<string>('org');
  const [selectedUsers, setSelectedUsers] = useState<OrgUser[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 트리 데이터 생성 및 사용자 맵 구성
  const userMap = new Map<string, OrgUser>();
  const rootNode = convertToTreeData(orgTree, userMap, searchQuery);
  const treeData = rootNode ? [rootNode] : [];

  const handleCheck = (checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    setCheckedKeys(keys);

    // 체크된 키에서 사용자만 필터링
    const users: OrgUser[] = [];
    keys.forEach((key) => {
      const keyStr = String(key);
      if (keyStr.startsWith('user-')) {
        const user = userMap.get(keyStr);
        if (user) {
          users.push(user);
        }
      }
    });
    setSelectedUsers(users);
  };

  const handleConfirm = () => {
    onSelect(selectedUsers);
    onClose();
  };

  const removeSelectedUser = (userId: string) => {
    const userKey = `user-${userId}`;
    const newKeys = checkedKeys.filter(key => key !== userKey);
    setCheckedKeys(newKeys);
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  // 마이리스트를 트리 형식으로 변환
  const convertMyListsToTree = (): DataNode[] => {
    const result: DataNode[] = [];

    myLists.forEach((list) => {
      const listChildren: DataNode[] = list.users
        .filter((user) => {
          // 검색어가 있으면 필터링
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = user.name.toLowerCase().includes(query);
            const matchesUsername = user.username.toLowerCase().includes(query);
            return matchesName || matchesUsername;
          }
          return true;
        })
        .map((user) => {
          userMap.set(`user-${user.id}`, user);
          return {
            title: `${user.name} (${user.username})`,
            key: `user-${user.id}`,
            isLeaf: true,
          };
        });

      // 검색어가 있을 때 자식이 없으면 이 그룹은 표시하지 않음
      if (searchQuery && listChildren.length === 0) {
        return;
      }

      result.push({
        title: list.name,
        key: `list-${list.id}`,
        children: listChildren,
      });
    });

    return result;
  };

  const tabItems: TabItem[] = [
    { key: 'org', label: '전체 조직도' },
    { key: 'mylist', label: '마이리스트' },
  ];

  const myListTreeData = convertMyListsToTree();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.pickerContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.pickerHeader}>
          <h3>사용자 검색</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

       <div className={styles.tabwrap}>
          
          <div className={styles.searchWrap}>
            <h2>사용자 검색</h2>
            <div className={common.searchWrapper}>
              <img
                src={searchIcon}
                alt="검색"
                className={common.searchIcon}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 또는 아이디로 검색"
                className={common.searchInput}
              />
            </div>
          </div>
          <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

          <div className={styles.pickerBody}>
            <Tree
              checkable={multiple}
              showLine
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={handleCheck}
              treeData={activeTab === 'org' ? treeData : myListTreeData}
              selectable={!multiple}
              onSelect={(selectedKeys) => {
                if (!multiple && selectedKeys.length > 0) {
                  const key = String(selectedKeys[0]);
                  if (key.startsWith('user-')) {
                    const user = userMap.get(key);
                    if (user) {
                      setSelectedUsers([user]);
                      setCheckedKeys([key]);
                    }
                  }
                }
              }}
              switcherIcon={({ expanded, isLeaf }: { expanded?: boolean; isLeaf?: boolean }) => {
              if (isLeaf) {
                return null; // 리프 노드는 아이콘 없음
              }
              // 펼쳐진 상태면 ▼, 닫힌 상태면 ▶
              return (
                <img
                  src={expanded ? arrowDown : arrowRight}
                  alt=""
                  style={{ width: '12px', height: '11px' }}
                />
              );
            }}
            />
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
                  onClick={() => removeSelectedUser(user.id)}
                  className={styles.removeUser}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
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
