import React from 'react';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
  isCategory?: boolean;
}

export const menuItems: SidebarMenuItem[] = [
  {
    id: 'home',
    label: '홈',
    icon: <HomeIcon />,
    path: '/',
    onClick: () => {
      window.location.href = 'http://localhost:3000/';
    },
  },
  {
    id: 'developer-management',
    label: '개발자 관리',
    icon: <PeopleIcon />,
    isCategory: true,
    children: [
      {
        id: 'developer-list',
        label: '개발자 관리',
        icon: <PersonAddIcon />,
        path: '/developers',
        onClick: () => {
          window.location.href = '/developers';
        },
      },
      {
        id: 'developer-resumes-list',
        label: '이력서 관리',
        icon: <AttachFileIcon />,
        path: '/resumes',
        onClick: () => {
          window.location.href = '/resumes';
        },
      },
    ],
  },
  {
    id: 'project-management',
    label: '프로젝트 관리',
    icon: <WorkIcon />,
    isCategory: true,
    children: [
      {
        id: 'project-list',
        label: '프로젝트 관리',
        icon: <AssignmentIcon />,
        path: '/projects',
        onClick: () => {
          window.location.href = '/projects';
        },
      },
    ],
  },
];

export default menuItems; 