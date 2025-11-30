//import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StrictMode } from 'react'
//import { createRoot } from 'react-dom/client'
import './index.css'
//import CrudDashboard from './CrudDashboard';
import { StyledEngineProvider } from '@mui/material/styles';
import App from './CrudDashboard';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <StyledEngineProvider injectFirst>
//       <CrudDashboard/>
//     </StyledEngineProvider>
//   </StrictMode>
// )

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </StrictMode>
);
