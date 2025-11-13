import { create } from 'zustand';

export interface OrgUser {
  id: string;
  name: string;
  username: string;
  department?: string;
  isOnline?: boolean; // 온라인 상태 추가
}

export interface OrgGroup {
  id: string;
  name: string;
  userIds: string[]; // 그룹에 속한 사용자 ID들
}

export interface OrgUserWithPath extends OrgUser {
  path: string[]; // 조직 경로 (예: ['서울센터', 'A 테넌트', '경영지원 그룹', '인사팀'])
}

export interface OrgTreeNode {
  id: string;
  name: string;
  users: OrgUser[];
  children?: OrgTreeNode[];
  expanded?: boolean;
  level?: 'center' | 'tenant' | 'group' | 'team'; // 조직 레벨 추가
}

export interface MyList {
  id: string;
  name: string;
  users: OrgUser[];
}

interface OrganizationState {
  orgTree: OrgTreeNode;
  myLists: MyList[];
  allUsers: OrgUser[]; // 전체 사용자 평면 목록 (검색용)
  allUsersWithPath: OrgUserWithPath[]; // 경로 정보 포함 사용자 목록
  searchUsers: (query: string) => OrgUserWithPath[];
  getUserById: (id: string) => OrgUser | undefined;
  setMyLists: (lists: MyList[]) => void; // 마이리스트 저장 함수
}

// 조직도 데이터 (센터 > 테넌트 > 그룹 > 팀 > 팀원)
const orgTreeData: OrgTreeNode = {
  id: 'center1',
  name: '서울센터',
  level: 'center',
  users: [],
  children: [
    {
      id: 'tenant1',
      name: 'A 테넌트',
      level: 'tenant',
      users: [],
      children: [
        {
          id: 'group1',
          name: '경영지원 그룹',
          level: 'group',
          users: [],
          children: [
            {
              id: 'team1',
              name: '인사팀',
              level: 'team',
              users: [
                { id: 'u1', name: '홍길동', username: 'NEXT0001', department: '인사팀', isOnline: true },
                { id: 'u2', name: '김철수', username: 'NEXT0002', department: '인사팀', isOnline: false },
              ],
            },
            {
              id: 'team2',
              name: '총무팀',
              level: 'team',
              users: [
                { id: 'u3', name: '이영희', username: 'NEXT0003', department: '총무팀', isOnline: true },
                { id: 'u4', name: '박민수', username: 'NEXT0004', department: '총무팀', isOnline: false },
              ],
            },
          ],
        },
        {
          id: 'group2',
          name: '개발 그룹',
          level: 'group',
          users: [],
          children: [
            {
              id: 'team3',
              name: '프론트엔드팀',
              level: 'team',
              users: [
                { id: 'u5', name: '홍길상', username: 'NEXT01024', department: '프론트엔드팀', isOnline: true },
                { id: 'u6', name: '정서연', username: 'NEXT0005', department: '프론트엔드팀', isOnline: true },
                { id: 'u7', name: '최민준', username: 'NEXT0006', department: '프론트엔드팀', isOnline: false },
              ],
            },
            {
              id: 'team4',
              name: '백엔드팀',
              level: 'team',
              users: [
                { id: 'u8', name: '강민지', username: 'NEXT0007', department: '백엔드팀', isOnline: true },
                { id: 'u9', name: '윤서준', username: 'NEXT0008', department: '백엔드팀', isOnline: false },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tenant2',
      name: 'B 테넌트',
      level: 'tenant',
      users: [],
      children: [
        {
          id: 'group3',
          name: '마케팅 그룹',
          level: 'group',
          users: [],
          children: [
            {
              id: 'team5',
              name: '디지털마케팅팀',
              level: 'team',
              users: [
                { id: 'u10', name: '클라우드', username: 'NEXT0017', department: '디지털마케팅팀', isOnline: true },
                { id: 'u11', name: '송지훈', username: 'NEXT0009', department: '디지털마케팅팀', isOnline: false },
              ],
            },
            {
              id: 'team6',
              name: '브랜드팀',
              level: 'team',
              users: [
                { id: 'u12', name: '한지민', username: 'NEXT0010', department: '브랜드팀', isOnline: true },
                { id: 'u13', name: '김태희', username: 'NEXT0011', department: '브랜드팀', isOnline: false },
                { id: 'u14', name: '홍길동', username: 'NEXT0099', department: '브랜드팀', isOnline: true }, // 중복 이름 테스트용
              ],
            },
          ],
        },
      ],
    },
  ],
};

// 마이리스트 데이터 (기본값: 빈 새그룹)
const myListsData: MyList[] = [
  {
    id: 'list-default',
    name: '새그룹',
    users: [],
  },
];

// 조직도 트리에서 모든 사용자를 평면 배열로 추출
const flattenOrgTree = (node: OrgTreeNode): OrgUser[] => {
  let users: OrgUser[] = [...node.users];
  if (node.children) {
    node.children.forEach((child) => {
      users = [...users, ...flattenOrgTree(child)];
    });
  }
  return users;
};

// 조직도 트리에서 경로 정보를 포함한 모든 사용자 추출
const flattenOrgTreeWithPath = (node: OrgTreeNode, path: string[] = []): OrgUserWithPath[] => {
  const currentPath = [...path, node.name];
  let usersWithPath: OrgUserWithPath[] = node.users.map(user => ({
    ...user,
    path: currentPath,
  }));

  if (node.children) {
    node.children.forEach((child) => {
      usersWithPath = [...usersWithPath, ...flattenOrgTreeWithPath(child, currentPath)];
    });
  }

  return usersWithPath;
};

export const useOrganizationStore = create<OrganizationState>((set) => ({
  orgTree: orgTreeData,
  myLists: myListsData,
  allUsers: flattenOrgTree(orgTreeData),
  allUsersWithPath: flattenOrgTreeWithPath(orgTreeData),

  // 사용자 검색 (이름 또는 username으로, 경로 정보 포함)
  searchUsers: (query: string) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const allUsersWithPath = flattenOrgTreeWithPath(orgTreeData);
    return allUsersWithPath.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery)
    );
  },

  // ID로 사용자 찾기
  getUserById: (id: string) => {
    const allUsers = flattenOrgTree(orgTreeData);
    return allUsers.find((user) => user.id === id);
  },

  // 마이리스트 저장
  setMyLists: (lists: MyList[]) => {
    set({ myLists: lists });
  },
}));
