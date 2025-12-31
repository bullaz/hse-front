import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
import EmployeeShow from './components/EmployeeShow';
import EmployeeCreate from './components/EmployeeCreate';
import EmployeeEdit from './components/EmployeeEdit';
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

const router = createHashRouter([
  {
    path: '/login',
    element: <SignIn />
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '/toko5s',
        element: <ProtectedRoute><Toko5List /></ProtectedRoute>,
      },
      {
        path: '/toko5s/toko5/:toko5Id/comments',
        element: <ProtectedRoute><CommentaireList /></ProtectedRoute>,
      },
      {
        path: '/toko5s/toko5/:toko5Id/mesures',
        element: <ProtectedRoute><MesureControleList /></ProtectedRoute>,
      },
      {
        path: '/toko5s/:employeeId',
        Component: EmployeeShow,
      },
      {
        path: '/toko5s/new',
        Component: EmployeeCreate,
      },
      {
        path: '/toko5s/:employeeId/edit',
        Component: EmployeeEdit,
      },
      {
        path: '/societes',
        element: <ProtectedRoute><ListSociete /></ProtectedRoute>,
      },
      {
        path: '/societes/new',
        element: <ProtectedRoute><AddSociete/></ProtectedRoute>
      },
      {
        path: '/societes/:societeId/edit',
        element: <ProtectedRoute><EditSociete/></ProtectedRoute>
      },
      {
        path: '/tasks',
        element: <ProtectedRoute><ListTask/></ProtectedRoute>
      },
      {
        path: '/tasks/new',
        element: <ProtectedRoute><AddTask/></ProtectedRoute>
      },
      // Fallback route for the example routes in dashboard sidebar items
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
