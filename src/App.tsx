// import React from 'react';
// import CssBaseline from '@mui/material/CssBaseline';
// import { createHashRouter, RouterProvider } from 'react-router-dom';
// import DashboardLayout from './components/DashboardLayout';
// import EmployeeShow from './components/EmployeeShow';
// import EmployeeCreate from './components/EmployeeCreate';
// import EmployeeEdit from './components/EmployeeEdit';
// import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
// import DialogsProvider from './hooks/useDialogs/DialogsProvider';
// import Toko5List from './components/Toko5List';
// import AppTheme from './theme/AppTheme';
// import {
//   dataGridCustomizations,
//   datePickersCustomizations,
//   sidebarCustomizations,
//   formInputCustomizations,
// } from './theme/customizations';
// import { AuthProvider } from './contexts/AuthContext';
// import Login from './components/Login';
// import ProtectedRoute from './components/ProtectedRoute';
// import SignIn from './components/SignIn';

// const themeComponents = {
//   ...dataGridCustomizations,
//   ...datePickersCustomizations,
//   ...sidebarCustomizations,
//   ...formInputCustomizations,
// };

// // Create protected layout
// const ProtectedLayout = () => (
//   <ProtectedRoute>
//     <DashboardLayout />
//   </ProtectedRoute>
// );

// const router = createHashRouter([
//   {
//     path: '/login',
//     element: <Login />,
//   },
//   {
//     path: '/',
//     element: <ProtectedLayout />,
//     children: [
//       {
//         path: '/',
//         element: <Toko5List />, // Default route
//       },
//       {
//         path: '/toko5s',
//         element: <Toko5List />,
//       },
//       {
//         path: '/toko5s/:employeeId',
//         element: <EmployeeShow />,
//       },
//       {
//         path: '/toko5s/new',
//         element: <EmployeeCreate />,
//       },
//       {
//         path: '/toko5s/:employeeId/edit',
//         element: <EmployeeEdit />,
//       },
//       // Fallback route
//       {
//         path: '*',
//         element: <Toko5List />,
//       },
//     ],
//   },
// ]);

// export default function App(props: { disableCustomTheme?: boolean }) {
//   return (
//     <AuthProvider>
//       <AppTheme {...props} themeComponents={themeComponents}>
//         <CssBaseline enableColorScheme />
//         <NotificationsProvider>
//           <DialogsProvider>
//             <RouterProvider router={router} />
//           </DialogsProvider>
//         </NotificationsProvider>
//       </AppTheme>
//     </AuthProvider>
//   );
// }