import { useState, useMemo } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useOrganizationStore, type OrgTreeNode, type OrgUser, type MyList } from '../store/organizationStore';
import styles from '../styles/Organization.module.css';
import Button from './common/Button';
import common from '@/styles/Common.module.css';
import searchIcon from '../assets/images/icon-search.png';
import arrowDown from '../assets/images/tree_on.png';
import arrowRight from '../assets/images/tree_off.png';
import moveIcon from '../assets/images/icon_right.png';
import editSave from '../assets/images/icon-editSave.png';
import editCancel from '../assets/images/icon-editCancel.png'

interface MyListDetailViewProps {
  isSettings: boolean;
  onClose: () => void;
}

// organizationStore의 데이터를 Ant Design Tree 형식으로 변환
const convertToTreeData = (node: OrgTreeNode, path: string[] = []): DataNode => {
  const currentPath = [...path, node.name];
  const children: DataNode[] = [];

  // 하위 조직만 자식 노드로 추가
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      children.push(convertToTreeData(child, currentPath));
    });
  }

  // 팀원도 자식 노드로 추가
  if (node.users && node.users.length > 0) {
    node.users.forEach((user) => {
      children.push({
        title: `${user.name} (${user.username})`,
        key: `user-${user.id}`,
        isLeaf: true,
      });
    });
  }

  return {
    title: node.name,
    key: node.id,
    children: children.length > 0 ? children : undefined,
    isLeaf: children.length === 0,
  };
};

const MyListDetailView = ({ onClose }: MyListDetailViewProps) => {
  const orgTree = useOrganizationStore((state) => state.orgTree);
  const myLists = useOrganizationStore((state) => state.myLists);
  const searchUsers = useOrganizationStore((state) => state.searchUsers);
  const setMyLists = useOrganizationStore((state) => state.setMyLists);

  const [orgSearchQuery, setOrgSearchQuery] = useState<string>('');
  const [selectedOrgKeys, setSelectedOrgKeys] = useState<React.Key[]>([]);
  const [selectedMyListKeys, setSelectedMyListKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [myListExpandedKeys, setMyListExpandedKeys] = useState<React.Key[]>([]);

  // 임시 저장용 state (실제 저장 전까지 변경사항 보관)
  const [tempMyLists, setTempMyLists] = useState<MyList[]>(JSON.parse(JSON.stringify(myLists)));

  // 이름 수정 관련 state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');

  // 전체 조직도 트리 데이터 (센터 > 테넌트까지만 자동 펼침)
  const orgTreeData = useMemo(() => {
    // 검색 중인 경우
    if (orgSearchQuery.trim()) {
      const searchResults = searchUsers(orgSearchQuery);
      if (searchResults.length === 0) {
        return [];
      }

      // 검색 결과를 팀별로 그룹화하여 트리 형태로 표시
      const resultNodes: DataNode[] = [];
      const pathMap = new Map<string, DataNode>();

      searchResults.forEach((user) => {
        const pathKey = user.path.join('|');

        if (!pathMap.has(pathKey)) {
          // 팀 노드 생성
          const teamName = user.path[user.path.length - 1];
          const teamNode: DataNode = {
            title: teamName,
            key: pathKey,
            children: [],
            isLeaf: false,
          };
          pathMap.set(pathKey, teamNode);
          resultNodes.push(teamNode);
        }

        // 사용자 노드 추가
        const teamNode = pathMap.get(pathKey)!;
        if (!teamNode.children) {
          teamNode.children = [];
        }
        teamNode.children.push({
          title: `${user.name} (${user.username})`,
          key: `user-${user.id}`,
          isLeaf: true,
        });
      });

      // 검색 시 모든 노드 펼침
      setExpandedKeys(resultNodes.map(node => node.key));

      return resultNodes;
    }

    // 일반 트리 데이터
    const treeData = [convertToTreeData(orgTree)];

    // 초기 펼침 상태: 센터와 테넌트만
    if (expandedKeys.length === 0) {
      const initialExpanded: React.Key[] = [orgTree.id];
      if (orgTree.children) {
        orgTree.children.forEach(tenant => {
          initialExpanded.push(tenant.id);
        });
      }
      setExpandedKeys(initialExpanded);
    }

    return treeData;
  }, [orgTree, expandedKeys.length, orgSearchQuery, searchUsers]);

  // 노드에서 모든 하위 사용자 찾기 (재귀)
  const findAllUsersInNode = (nodeKey: string): OrgUser[] => {
    const allUsers = useOrganizationStore.getState().allUsers;
    const orgTree = useOrganizationStore.getState().orgTree;

    // user- 키인 경우 해당 사용자만 반환
    if (nodeKey.startsWith('user-')) {
      const userId = nodeKey.replace('user-', '');
      const user = allUsers.find(u => u.id === userId);
      return user ? [user] : [];
    }

    // 조직 노드인 경우 해당 노드와 하위 노드의 모든 사용자 찾기
    const findUsersRecursive = (node: OrgTreeNode): OrgUser[] => {
      let users: OrgUser[] = [];

      // 현재 노드의 사용자 추가
      if (node.users) {
        users = [...users, ...node.users];
      }

      // 하위 노드의 사용자 재귀 탐색
      if (node.children) {
        node.children.forEach(child => {
          users = [...users, ...findUsersRecursive(child)];
        });
      }

      return users;
    };

    // orgTree에서 해당 노드 찾기
    const findNode = (node: OrgTreeNode): OrgTreeNode | null => {
      if (node.id === nodeKey) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    if (orgTree) {
      const targetNode = findNode(orgTree);
      if (targetNode) {
        return findUsersRecursive(targetNode);
      }
    }

    return [];
  };

  // 드롭 핸들러
  const handleDropToGroup = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const nodeKey = e.dataTransfer.getData('text/plain');
    if (!nodeKey) return;

    console.log('Dropped node:', nodeKey, 'to group:', listId);

    // 드래그한 노드의 모든 사용자 찾기
    const usersToAdd = findAllUsersInNode(nodeKey);

    if (usersToAdd.length === 0) {
      console.log('No users found in node');
      return;
    }

    console.log('Adding users:', usersToAdd.map(u => u.name));

    // 중복 확인
    const targetList = tempMyLists.find(list => list.id === listId);
    if (targetList) {
      const existingUserIds = targetList.users.map(u => u.id);
      const hasDuplicate = usersToAdd.some(u => existingUserIds.includes(u.id));

      // 중복된 사용자가 있는 경우 중단
      if (hasDuplicate) {
        alert('그룹에 동일한 사용자가 존재합니다');
        return;
      }
    }

    // 그룹에 사용자 추가
    const newMyLists = tempMyLists.map(list => {
      if (list.id === listId) {
        return { ...list, users: [...list.users, ...usersToAdd] };
      }
      return list;
    });

    setTempMyLists(newMyLists);
  };

  // 내 그룹 트리 데이터 변환
  const myListTreeData = useMemo((): DataNode[] => {
    return tempMyLists.map((list) => {
      const isEditing = editingGroupId === list.id;

      return {
        title: isEditing ? (
          <div className={styles.groupEditWrapper} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editingGroupName}
              onChange={(e) => setEditingGroupName(e.target.value)}
              className={styles.groupNameInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveGroupName();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className={styles.editSaveButton}
              onClick={(e) => {
                e.stopPropagation();
                handleSaveGroupName();
              }}
              title="저장"
            >
             <img
                src={editSave}
                alt="저장"
              />
            </button>
            <button
              className={styles.editCancelButton}
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
              title="취소"
            >
                <img
                src={editCancel}
                alt="저장"
              />
            </button>
          </div>
        ) : (
          <div
            className={styles.groupNameWrapper}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleEditGroupName(list.id, list.name);
            }}
            onClick={(e) => e.stopPropagation()}
            onDragOver={(e) => {
              // 수정 중이면 드롭 비활성화
              if (editingGroupId !== null) {
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.backgroundColor = '#e6f7ff';
              console.log('onDragOver group:', list.name);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.backgroundColor = '';
            }}
            onDrop={(e) => {
              // 수정 중이면 드롭 비활성화
              if (editingGroupId !== null) {
                e.currentTarget.style.backgroundColor = '';
                return;
              }
              console.log('onDrop group:', list.name);
              e.currentTarget.style.backgroundColor = '';
              handleDropToGroup(e, list.id);
            }}
          >
            <span className={styles.groupNameText}>
              {list.name} ({list.users.length})
            </span>
          </div>
        ),
        key: `list-${list.id}`,
        children: list.users.length > 0 ? list.users.map((user) => ({
          title: `${user.name} (${user.username})`,
          key: `mylist-${list.id}-user-${user.id}`,
          isLeaf: true,
        })) : undefined,
        isLeaf: false,
      };
    });
  }, [tempMyLists, editingGroupId, editingGroupName]);

  const handleAddGroup = () => {
    // 기존 "새그룹" 패턴의 그룹들 찾기
    const newGroupPattern = /^새그룹(?:\((\d+)\))?$/;
    const existingNumbers = tempMyLists
      .map(list => {
        const match = list.name.match(newGroupPattern);
        if (match) {
          return match[1] ? parseInt(match[1]) : 0; // "새그룹"은 0으로 처리
        }
        return null;
      })
      .filter((num): num is number => num !== null);

    // 다음 번호 계산
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const newGroupName = `새그룹(${nextNumber})`;

    const newGroupId = `list-${Date.now()}`;
    const newGroup: MyList = {
      id: newGroupId,
      name: newGroupName,
      users: [],
    };
    setTempMyLists([...tempMyLists, newGroup]);
  };

  const handleEditGroupName = (groupId: string, currentName: string) => {
    setEditingGroupId(groupId);
    setEditingGroupName(currentName);
  };

  const handleSaveGroupName = () => {
    if (!editingGroupId) return;

    const trimmedName = editingGroupName.trim();
    if (!trimmedName) {
      alert('그룹 이름을 입력해주세요');
      return;
    }

    const newMyLists = tempMyLists.map(list => {
      if (list.id === editingGroupId) {
        return { ...list, name: trimmedName };
      }
      return list;
    });

    setTempMyLists(newMyLists);
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleCancelEdit = () => {
    // 수정 모드 종료 (원래 이름으로 돌아감)
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleDeleteGroup = () => {
    if (selectedMyListKeys.length === 0) {
      alert('삭제할 그룹 또는 사용자를 선택해주세요');
      return;
    }

    const newMyLists = tempMyLists.map(list => {
      const listKey = `list-${list.id}`;

      // 그룹 자체가 선택된 경우
      if (selectedMyListKeys.includes(listKey)) {
        return null; // 그룹 삭제
      }

      // 그룹 내 사용자가 선택된 경우
      const updatedUsers = list.users.filter(user => {
        const userKey = `mylist-${list.id}-user-${user.id}`;
        return !selectedMyListKeys.includes(userKey);
      });

      return { ...list, users: updatedUsers };
    }).filter(Boolean) as MyList[];

    setTempMyLists(newMyLists);
    setSelectedMyListKeys([]);
  };

  const handleMoveToGroup = () => {
    if (selectedOrgKeys.length === 0) {
      alert('이동할 사용자를 선택해주세요');
      return;
    }

    // 선택된 그룹 찾기 (내 그룹에서 list- 로 시작하는 키)
    const selectedListKey = selectedMyListKeys.find(key =>
      typeof key === 'string' && key.startsWith('list-')
    );

    if (!selectedListKey) {
      alert('그룹을 선택해주세요');
      return;
    }

    const listId = (selectedListKey as string).replace('list-', '');

    // 선택된 사용자 ID 추출
    const userIds = selectedOrgKeys
      .filter(key => typeof key === 'string' && key.startsWith('user-'))
      .map(key => (key as string).replace('user-', ''));

    // 사용자 정보 가져오기
    const allUsers = useOrganizationStore.getState().allUsers;
    const usersToAdd = userIds
      .map(id => allUsers.find(u => u.id === id))
      .filter(Boolean) as OrgUser[];

    // 중복 확인
    const targetList = tempMyLists.find(list => list.id === listId);
    if (targetList) {
      const existingUserIds = targetList.users.map(u => u.id);
      const hasDuplicate = usersToAdd.some(u => existingUserIds.includes(u.id));

      // 중복된 사용자가 있는 경우 중단
      if (hasDuplicate) {
        alert('그룹에 동일한 사용자가 존재합니다');
        return;
      }
    }

    // 그룹에 사용자 추가
    const newMyLists = tempMyLists.map(list => {
      if (list.id === listId) {
        return { ...list, users: [...list.users, ...usersToAdd] };
      }
      return list;
    });

    setTempMyLists(newMyLists);
    setSelectedOrgKeys([]);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    // Zustand store에 저장
    setMyLists(tempMyLists);
    alert('저장되었습니다');
    onClose();
  };

  return (
    <div className={styles.detailContainer}>
      <div className={styles.settingsHeader}>
        <h2 className={styles.settingsTitle}>마이리스트 설정</h2>
      </div>

      <div className={styles.settingsBody}>
        {/* 좌측: 전체 조직도 영역 */}
        <div className={styles.settingsLeftPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>조직도</h3>
          </div>
          <div className={styles.treeWrap}>
            <div className={styles.searchWrapper}>
              <img
                src={searchIcon}
                alt="검색"
                className={styles.searchIcon}
              />
              <input
                type="text"
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
                placeholder="이름 또는 아이디로 검색"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.treeWrapper}>
              <Tree
                showLine
                checkable
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                checkedKeys={selectedOrgKeys}
                onCheck={(keys) => {
                  if (Array.isArray(keys)) {
                    setSelectedOrgKeys(keys);
                  } else {
                    setSelectedOrgKeys(keys.checked);
                  }
                }}
                treeData={orgTreeData}
                titleRender={(node) => {
                  const key = node.key.toString();
                  const isDraggable = editingGroupId === null; // 수정 중이 아닐 때만 드래그 가능

                  return (
                    <span
                      draggable={isDraggable}
                      onDragStart={(e) => {
                        if (!isDraggable) {
                          e.preventDefault();
                          return;
                        }
                        // 노드 키 정보 저장
                        e.dataTransfer.setData('text/plain', key);
                        e.dataTransfer.effectAllowed = 'copy';
                        console.log('Dragging node:', key);
                      }}
                      style={{ cursor: isDraggable ? 'grab' : 'default' }}
                    >
                      {node.title as string}
                    </span>
                  );
                }}
                switcherIcon={({ expanded, isLeaf }: { expanded?: boolean; isLeaf?: boolean }) => {
                  if (isLeaf) {
                    return null;
                  }
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
          </div>
        </div>

        {/* 중앙: 이동 버튼 */}
        <div className={styles.settingsCenterPanel}>
          <button
            className={styles.moveButton}
            onClick={handleMoveToGroup}
            disabled={editingGroupId !== null}
            title="선택한 사용자를 그룹으로 이동"
          >
             <img
                src={moveIcon}
                alt="이동"
              />
          </button>
        </div>

        {/* 우측: 내 그룹 영역 */}
        <div className={styles.settingsRightPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>내 그룹</h3>
            <div className={styles.groupActions}>
              <button className={styles.actionButton} onClick={handleAddGroup}>
                그룹 추가
              </button>
              <button className={styles.actionButton} onClick={handleDeleteGroup}>
                삭제
              </button>
            </div>
          </div>
          <div className={styles.myListTreeWrapper}>
            <Tree
              showLine
              checkable
              checkStrictly={true}
              expandedKeys={myListExpandedKeys}
              onExpand={(keys) => setMyListExpandedKeys(keys)}
              checkedKeys={selectedMyListKeys}
              onCheck={(keys) => {
                if (Array.isArray(keys)) {
                  setSelectedMyListKeys(keys);
                } else {
                  setSelectedMyListKeys(keys.checked);
                }
              }}
              treeData={myListTreeData}
              switcherIcon={({ expanded, isLeaf }: { expanded?: boolean; isLeaf?: boolean }) => {
                if (isLeaf) {
                  return null;
                }
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
        </div>
      </div>
      <div className={styles.settingsFooter}>
           <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
            <Button variant="secondary" onClick={handleCancel}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장
            </Button>
          </div>
      </div>
    </div>
  );
};

export default MyListDetailView;
