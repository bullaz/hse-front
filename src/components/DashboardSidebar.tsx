import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import type { } from '@mui/material/themeCssVarsAugmentation';
import SafetyCheckIcon from '@mui/icons-material/SafetyCheck';
import BusinessIcon from '@mui/icons-material/Business';
import { matchPath, useLocation } from 'react-router';
import DashboardSidebarContext from '../context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants';
import DashboardSidebarPageItem from './DashboardSidebarPageItem';
import DashboardSidebarHeaderItem from './DashboardSidebarHeaderItem';
import DashboardSidebarDividerItem from './DashboardSidebarDividerItem';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EngineeringIcon from '@mui/icons-material/Engineering';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from '../mixins';
import { Avatar, Stack, Typography } from '@mui/material';
import OptionsMenu from './OptionsMenu';
import PersonIcon from '@mui/icons-material/Person';
import { jwtDecode } from "jwt-decode";

export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
}

interface JwtPayload {
  sub: string;
  nom: string;
  prenom: string;
  // Add other fields if necessary
}

export default function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const [expandedItemIds, setExpandedItemIds] = React.useState<string[]>([]);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  const [nom, setNom] = React.useState<string>("");
  const [prenom, setPrenom] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyExpanded(false);

    return () => { };
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyCollapsed(false);

    return () => { };
  }, [expanded, theme.transitions.duration.leavingScreen]);

  React.useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    console.log("token sidebar:", token);
    if (token) {
      setNom(jwtDecode<JwtPayload>(token).nom);
      setPrenom(jwtDecode<JwtPayload>(token).prenom);
      setEmail(jwtDecode<JwtPayload>(token).sub);
    }
  }, []);


  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded(newExpanded);
    },
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(
    (itemId: string, hasNestedNavigation: boolean) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter(
              (previousValueItemId) => previousValueItemId !== itemId,
            )
            : [...previousValue, itemId],
        );
      } else if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [mini, setExpanded, isOverSmViewport],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            scrollbarGutter: mini ? 'stable' : 'auto',
            overflowX: 'hidden',
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding')
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
            }}
          >
            {/* <DashboardSidebarHeaderItem>Taches principals</DashboardSidebarHeaderItem> */}
            <DashboardSidebarHeaderItem>TAKE 5</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="toko5s"
              title="Take 5"
              icon={<SafetyCheckIcon />}
              href="/toko5s"
              selected={!!matchPath('/toko5s/*', pathname) || pathname === '/'}
            />

            <DashboardSidebarPageItem
              id="task_tracking"
              title="Suivi de tâches"
              icon={< TrendingUpIcon />}
              href="/task_tracking"
              selected={!!matchPath('/task_tracking', pathname)}
              defaultExpanded={!!matchPath('/task_tracking', pathname)}
              expanded={expandedItemIds.includes('task_tracking')}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <DashboardSidebarPageItem
                    id="tasks"
                    title="Ajouter une nouvelle tâche"
                    icon={<EngineeringIcon />}
                    href="/task_tracking/tasks"
                    selected={!!matchPath('/tasks/*', pathname) || pathname === '/'}
                  />

                  <DashboardSidebarPageItem
                    id="societes"
                    title="Suivi des tâches"
                    icon={<BusinessIcon />}
                    href="/task_tracking/add_task"
                    selected={!!matchPath('/societes/*', pathname) || pathname === '/'}
                  />
                </List>
              }
            />


            <DashboardSidebarPageItem
              id="stats"
              title="Statistiques"
              icon={<TrendingUpIcon />}
              href="/stats"
              selected={!!matchPath('/stats/*', pathname) || pathname === '/'}
            />

            <DashboardSidebarPageItem
              id="crud_take5"
              title="Gestion de contenu"
              icon={< TrendingUpIcon />}
              href="/crud_take5"
              selected={!!matchPath('/crud_take5', pathname)}
              defaultExpanded={!!matchPath('/crud_take5', pathname)}
              expanded={expandedItemIds.includes('crud_take5')}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <DashboardSidebarPageItem
                    id="tasks"
                    title="Tâches"
                    icon={<EngineeringIcon />}
                    href="/tasks"
                    selected={!!matchPath('/tasks/*', pathname) || pathname === '/'}
                  />

                  <DashboardSidebarPageItem
                    id="societes"
                    title="Sociétés"
                    icon={<BusinessIcon />}
                    href="/societes"
                    selected={!!matchPath('/societes/*', pathname) || pathname === '/'}
                  />
                </List>
              }
            />

            <DashboardSidebarDividerItem />

            <DashboardSidebarHeaderItem>Autres tâches</DashboardSidebarHeaderItem>
          </List>
        </Box>
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            sizes="small"
            alt="avatar"
            src=""
            sx={{ width: 36, height: 36 }}
          >
            <PersonIcon />
          </Avatar>
          <Box sx={{ mr: 'auto' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {prenom} {nom}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {email}
            </Typography>
          </Box>
          <OptionsMenu />
        </Stack>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, expandedItemIds, pathname, prenom, nom, email],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: 'absolute',
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    };
  }, [
    handlePageItemClick,
    mini,
    isFullyExpanded,
    isFullyCollapsed,
    hasDrawerTransitions,
  ]);

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: {
            xs: 'block',
            sm: disableCollapsibleSidebar ? 'block' : 'none',
            md: 'none',
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: 'none',
            sm: disableCollapsibleSidebar ? 'none' : 'block',
            md: 'none',
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('desktop')}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}
