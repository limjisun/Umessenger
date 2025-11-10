import { useState } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { Tabs, Button } from './common';
import type { TabItem } from './common';
import styles from '../styles/OrganizationPicker.module.css';
import { useOrganizationStore, type OrgUser, type OrgTreeNode } from '../store/organizationStore';

interface OrganizationPickerProps {
  onClose: () => void;
  onSelect: (users: OrgUser[]) => void;
  multiple?: boolean;
}

// organizationStore의 데이터를 Ant Design Tree 형식으로 변환
const convertToTreeData = (node: OrgTreeNode, allUsers: Map<string, OrgUser>): DataNode => {
  const children: DataNode[] = [];

  // 사용자들을 자식 노드로 추가
  if (node.users && node.users.length > 0) {
    node.users.forEach((user) => {
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
      children.push(convertToTreeData(child, allUsers));
    });
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

  // 트리 데이터 생성 및 사용자 맵 구성
  const userMap = new Map<string, OrgUser>();
  const treeData = [convertToTreeData(orgTree, userMap)];

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
    return myLists.map((list) => {
      const listChildren: DataNode[] = list.users.map((user) => {
        userMap.set(`user-${user.id}`, user);
        return {
          title: `${user.name} (${user.username})`,
          key: `user-${user.id}`,
          isLeaf: true,
        };
      });

      return {
        title: list.name,
        key: `list-${list.id}`,
        children: listChildren,
      };
    });
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
