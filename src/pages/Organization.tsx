import { useState, useMemo } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { Tabs } from '../components/common';
import type { TabItem } from '../components/common/Tabs';
import OrgDetailView from '../components/OrgDetailView';
import MyListDetailView from '../components/MyListDetailView';
import { useOrganizationStore, type OrgTreeNode, type OrgUser } from '../store/organizationStore';
import common from '@/styles/Common.module.css';
import styles from '../styles/Organization.module.css';
import searchIcon from '../assets/images/icon-search.png';
import centerIcon from '../assets/images/icon-center.png';
import tenantIcon from '../assets/images/icon-tenant.png';
import groupIcon from '../assets/images/icon-group.png';
import teamIcon from '../assets/images/icon-team.png';
import personIcon from '../assets/images/person-icon.png';
import arrowDown from '../assets/images/tree_on.png';
import arrowRight from '../assets/images/tree_off.png';

// 조직도 노드 정보
interface OrgNodeInfo {
  id: string;
  name: string;
  users: OrgUser[];
  path: string[];
  teamGroups?: TeamGroup[]; // 팀별 그룹 정보
}

// 팀별 그룹 정보
interface TeamGroup {
  teamId: string;
  teamName: string;
  path: string[];
  users: OrgUser[];
}

// 조직 레벨에 따른 아이콘 이미지 선택
const getOrgIcon = (level?: 'center' | 'tenant' | 'group' | 'team'): string | null => {
  switch (level) {
    case 'center':
      return centerIcon; // 센터 아이콘 
    case 'tenant':
       return tenantIcon; // 테넌트 아이콘 
    case 'group':
       return groupIcon; // 그룹 아이콘
    case 'team':
      return teamIcon; // 팀 아이콘 
    default:
      return null;
  }
};

// organizationStore의 데이터를 Ant Design Tree 형식으로 변환 (팀원 제외)
const convertToTreeData = (node: OrgTreeNode, nodeMap: Map<string, OrgNodeInfo>, path: string[] = []): DataNode => {
  const currentPath = [...path, node.name];
  const children: DataNode[] = [];

  // 현재 노드의 모든 사용자 수집 (하위 노드 포함)
  const collectAllUsers = (n: OrgTreeNode): OrgUser[] => {
    let allUsers = [...(n.users || [])];
    if (n.children) {
      n.children.forEach(child => {
        allUsers = [...allUsers, ...collectAllUsers(child)];
      });
    }
    return allUsers;
  };

  // 팀별로 그룹화된 정보 수집 (리프 노드만)
  const collectTeamGroups = (n: OrgTreeNode, basePath: string[]): TeamGroup[] => {
    const teams: TeamGroup[] = [];
    const nodePath = [...basePath, n.name];

    // 리프 노드(자식이 없는 노드)면 팀으로 간주
    if (!n.children || n.children.length === 0) {
      if (n.users && n.users.length > 0) {
        teams.push({
          teamId: n.id,
          teamName: n.name,
          path: nodePath,
          users: n.users,
        });
      }
    } else {
      // 자식이 있으면 재귀적으로 팀 수집
      n.children.forEach(child => {
        teams.push(...collectTeamGroups(child, nodePath));
      });
    }

    return teams;
  };

  const allUsers = collectAllUsers(node);
  const teamGroups = collectTeamGroups(node, path);

  // 노드 정보를 Map에 저장
  nodeMap.set(node.id, {
    id: node.id,
    name: node.name,
    users: allUsers,
    path: currentPath,
    teamGroups: teamGroups.length > 0 ? teamGroups : undefined,
  });

  // 하위 조직만 자식 노드로 추가 (사용자는 제외)
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      children.push(convertToTreeData(child, nodeMap, currentPath));
    });
  }

  const iconSrc = getOrgIcon(node.level);

  return {
    title: iconSrc ? (
      <span className={styles.treetitle}>
        <img src={iconSrc} alt="" style={{ width: '14px', height: '12px' }} />
        {node.name}
      </span>
    ) : node.name,
    key: node.id,
    children: children.length > 0 ? children : undefined,
    isLeaf: !node.children || node.children.length === 0,
  };
};

const Organization = () => {
  const orgTree = useOrganizationStore((state) => state.orgTree);
  const myLists = useOrganizationStore((state) => state.myLists);
  const searchUsers = useOrganizationStore((state) => state.searchUsers);

  const [activeTab, setActiveTab] = useState<string>('org');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<OrgNodeInfo | null>(null);
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null);

  // 조직도 노드 맵
  const orgNodeMap = useMemo(() => new Map<string, OrgNodeInfo>(), []);

  // 전체 조직도 트리 데이터 (팀원 제외)
  const orgTreeData = useMemo(() => {
    orgNodeMap.clear();
    return [convertToTreeData(orgTree, orgNodeMap)];
  }, [orgTree, orgNodeMap]);

  // 마이리스트 트리 데이터
  const myListTreeData = useMemo(() => {
    return myLists.map((list) => ({
      title: `⭐ ${list.name}`,
      key: `list-${list.id}`,
      children: list.users.map((user) => ({
        title: (
          <span className={styles.treetitle}>
            <img src={personIcon} alt="" style={{ width: '14px', height: '12px' }} />
            {`${user.name} (${user.username})`}
          </span>
        ),
        key: `user-${user.id}`,
        isLeaf: true,
      })),
    }));
  }, [myLists]);

  // 트리 노드 선택 핸들러
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) {
      setSelectedNode(null);
      setSelectedUser(null);
      return;
    }

    const key = String(selectedKeys[0]);

    // 전체 조직도 탭일 때
    if (activeTab === 'org') {
      const nodeInfo = orgNodeMap.get(key);
      if (nodeInfo) {
        setSelectedNode(nodeInfo);
        setSelectedUser(null);
      }
    }
    // 마이리스트 탭일 때
    else if (activeTab === 'mylist') {
      if (key.startsWith('user-')) {
        const userId = key.replace('user-', '');
        const allUsers = myLists.flatMap(list => list.users);
        const user = allUsers.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setSelectedNode(null);
        }
      } else {
        setSelectedUser(null);
        setSelectedNode(null);
      }
    }
  };

  // 검색 기능
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return searchUsers(searchQuery);
  }, [searchQuery, searchUsers]);

  // 검색 결과를 OrgDetailView 형식으로 변환
  const searchResultsAsNodeInfo = useMemo((): OrgNodeInfo | null => {
    if (!searchQuery.trim() || searchResults.length === 0) {
      return null;
    }

    // 검색 결과를 팀별로 그룹화
    const teamGroups: TeamGroup[] = [];
    const groupMap = new Map<string, { path: string[]; users: OrgUser[] }>();

    searchResults.forEach((user) => {
      const pathKey = user.path.join('|');
      if (!groupMap.has(pathKey)) {
        groupMap.set(pathKey, {
          path: user.path,
          users: [],
        });
      }
      groupMap.get(pathKey)!.users.push(user);
    });

    groupMap.forEach((group, pathKey) => {
      const teamName = group.path[group.path.length - 1];
      teamGroups.push({
        teamId: pathKey,
        teamName: teamName,
        path: group.path,
        users: group.users,
      });
    });

    return {
      id: 'search-results',
      name: '검색 결과',
      users: searchResults,
      path: ['검색 결과'],
      teamGroups: teamGroups,
    };
  }, [searchResults, searchQuery]);

  const tabItems: TabItem[] = [
    { key: 'org', label: '전체 조직도' },
    { key: 'mylist', label: '마이리스트' },
  ];

  return (
    <div className={common.containerWrap}>
      <div className={common.listLeft}>
        <div className={common.listHeader}>
          <div className={common.headerActions}>
            <div className={`${common.flex} ${common.alignCenter} ${common.gap5}`}>
              <h2>사용자목록</h2>
            </div>
          </div>

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

        <div className={`${common.listItems} ${styles.listItems}`}>
          <Tree
            showLine
            defaultExpandAll
            treeData={activeTab === 'org' ? orgTreeData : (myListTreeData as DataNode[])}
            onSelect={handleTreeSelect}
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
      </div>

      <div className={`${common.listDetail} ${styles.listDetail}`}>
        {searchQuery.trim() ? (
          // 검색 모드: 검색 결과 표시
          searchResultsAsNodeInfo ? (
            <OrgDetailView selectedNode={searchResultsAsNodeInfo} />
          ) : (
            <div className={styles.emptyState}>
              <p>검색 결과가 없습니다</p>
            </div>
          )
        ) : selectedNode ? (
          <OrgDetailView selectedNode={selectedNode} />
        ) : selectedUser ? (
          <MyListDetailView selectedUser={selectedUser} />
        ) : (
          <div className={styles.emptyState}>
            <p>{activeTab === 'org' ? '조직을 선택해주세요' : '사용자를 선택해주세요'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;
