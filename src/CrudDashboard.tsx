import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
// import EmployeeList from './components/EmployeeList';
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
