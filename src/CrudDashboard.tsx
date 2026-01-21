import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import Toko5List from './components/Toko5List';
import AppTheme from './theme/AppTheme';
import SignIn from './components/SignIn';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CommentaireList from './components/CommentaireList';
import MesureControleList from './components/MesureControleList';
import ListSociete from './components/societeCrud/ListSociete';
import AddSociete from './components/societeCrud/AddSociete';
import EditSociete from './components/societeCrud/EditSociete';
import ListTask from './components/taskCrud/ListTask';
import AddTask from './components/taskCrud/AddTask';
import Stat from './components/Stat';
import AddNewTask from './components/taskTracking/AddTask';

const router = createHashRouter([
  {
    path: '/login',
    element: <SignIn />
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      //TAKE 5
      {
        path: '/toko5s',
        element: <Toko5List/>,
      },
      {
        path: '/toko5s/toko5/:toko5Id/comments',
        element: <CommentaireList />,
      },
      {
        path: '/toko5s/toko5/:toko5Id/mesures',
        element: <MesureControleList />,
      },

      //TASK TRACKING
      {
        path: '/task_tracking/add_task',
        element: <AddNewTask />
      },

      //CRUD SOCIETE
      {
        path: '/societes',
        element: <ListSociete />,
      },
      {
        path: '/societes/new',
        element: <AddSociete/>
      },
      {
        path: '/societes/:societeId/edit',
        element: <EditSociete/>,
      },

      //CRUD TASK
      {
        path: '/tasks',
        element: <ListTask/>
      },
      {
        path: '/tasks/new',
        element: <AddTask/>
      },
      {
        path: '/stats',
        element: <Stat />
      },

      // Fallback route for other routes
      {
        path: '*',
        Component: Toko5List,
      },
    ],
  },
]);

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AuthProvider>
      <AppTheme {...props} themeComponents={themeComponents}>
        <CssBaseline enableColorScheme />
        <NotificationsProvider>
          <DialogsProvider>
            <RouterProvider router={router} />
          </DialogsProvider>
        </NotificationsProvider>
      </AppTheme>
    </AuthProvider>
  );
}
