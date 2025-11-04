// Auth Types
export type UserStatus = 'online' | 'offline';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  status: UserStatus;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// Organization Types
export interface OrgNode {
  id: string;
  name: string;
  title?: string;
  children?: OrgNode[];
}

// Notice Types
export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isImportant: boolean;
}

// Navigation Types
export type NavRoute = 'messages' | 'organization' | 'notice' | 'settings';
