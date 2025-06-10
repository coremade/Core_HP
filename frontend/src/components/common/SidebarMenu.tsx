import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import menuItems, { type SidebarMenuItem } from '../../config/sidebarMenuConfig';

interface SidebarProps {
  customMenuItems?: SidebarMenuItem[];
  onMenuItemClick?: (item: SidebarMenuItem) => void;
}

const SIDEBAR_WIDTH = 200;
const COLLAPSED_WIDTH = 40;

export default function SidebarMenu({ customMenuItems, onMenuItemClick }: SidebarProps) {
  // 기본 메뉴 또는 커스텀 메뉴 사용
  const currentMenuItems = customMenuItems || menuItems;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // 모든 카테고리를 기본적으로 열려있게 초기화
  const getInitialExpandedCategories = () => {
    const expanded: Record<string, boolean> = {};
    currentMenuItems.forEach(item => {
      if (item.isCategory && item.children) {
        expanded[item.id] = true;
      }
    });
    return expanded;
  };
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(getInitialExpandedCategories());
  const [mouseLeaveTimer, setMouseLeaveTimer] = useState<NodeJS.Timeout | null>(null);

  const shouldShowExpanded = isPinned || isHovering;

  const handleMouseEnter = () => {
    // 기존 타이머가 있다면 제거
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer);
      setMouseLeaveTimer(null);
    }
    
    if (!isPinned) {
      setIsHovering(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      // 약간의 지연을 주어 마우스가 완전히 벗어났는지 확인
      const timer = setTimeout(() => {
        setIsHovering(false);
        setIsExpanded(false);
        setMouseLeaveTimer(null);
      }, 100); // 100ms 지연
      
      setMouseLeaveTimer(timer);
    }
  };

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      setIsHovering(false);
    }
  };

  const handleMenuItemClick = (item: SidebarMenuItem) => {
    if (item.isCategory && item.children) {
      // 카테고리 메뉴의 경우 확장/축소 토글
      setExpandedCategories(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      // 일반 메뉴의 경우 클릭 이벤트 실행
      if (item.onClick) {
        item.onClick();
      }
      if (onMenuItemClick) {
        onMenuItemClick(item);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <>
      {/* 사이드바 전체 영역 (마우스 이벤트 처리용) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: shouldShowExpanded ? SIDEBAR_WIDTH + 8 : 50, // 마우스 이벤트 영역 축소
          height: '100vh',
          zIndex: 1300,
          pointerEvents: 'none', // 기본적으로 마우스 이벤트 차단
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 햄버거 메뉴 버튼 */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: shouldShowExpanded ? 'none' : 'block',
            pointerEvents: 'auto', // 버튼은 클릭 가능하게
          }}
        >
          <IconButton
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* 사이드바 */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={shouldShowExpanded}
          sx={{
            pointerEvents: shouldShowExpanded ? 'auto' : 'none',
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              transition: 'transform 0.3s ease-in-out',
              overflowX: 'hidden',
              pointerEvents: 'auto',
              position: 'fixed', // 고정 위치
              zIndex: 1200, // z-index 낮춤
            },
          }}
        >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" noWrap>
            메뉴
          </Typography>
          <Tooltip title={isPinned ? '사이드바 고정 해제' : '사이드바 고정'}>
            <IconButton onClick={handlePinToggle} size="small">
              {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <List>
          {currentMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item)}
                  sx={{
                    minHeight: 40,
                    justifyContent: 'initial',
                    px: 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      opacity: 1,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem', // 대메뉴 글자 크기
                        fontWeight: 500,
                      }
                    }} 
                  />
                  {item.isCategory && item.children && (
                    expandedCategories[item.id] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              
              {/* 하위 메뉴 */}
              {item.isCategory && item.children && (
                <Collapse in={expandedCategories[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((childItem) => (
                      <ListItem key={childItem.id} disablePadding>
                        <ListItemButton
                          onClick={() => handleMenuItemClick(childItem)}
                          sx={{
                            minHeight: 36,
                            pl: 4, // 들여쓰기
                            pr: 2,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 2,
                              justifyContent: 'center',
                            }}
                          >
                            {childItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={childItem.label}
                            sx={{ 
                              opacity: 1,
                              '& .MuiListItemText-primary': {
                                fontSize: '0.9rem', // 소메뉴 글자 크기 (대메뉴보다 작게)
                                fontWeight: 400,
                              }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>

        {/* 메뉴가 없을 때 안내 텍스트 */}
        {currentMenuItems.length === 0 && (
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              메뉴 항목이 없습니다
            </Typography>
          </Box>
        )}
        </Drawer>
      </Box>

    </>
  );
} 