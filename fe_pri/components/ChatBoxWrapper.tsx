'use client';
import { useAuth } from '@/context/AuthContext';
import ChatBox from './ChatBox';

export default function ChatBoxWrapper() {
  const { user } = useAuth();
  if (user?.roleName !== 'ROLE_INTERNAL_READER' && user?.roleName !== 'ROLE_EXTERNAL_READER') return null;
  return <ChatBox />;
}