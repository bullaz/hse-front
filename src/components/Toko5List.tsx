import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
//import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses
} from '@mui/x-data-grid';
import type {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  //GridEventListener,
  GridCellParams,
} from '@mui/x-data-grid';
//import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
//import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningIcon from '@mui/icons-material/Warning';

import QRCode from "react-qr-code";

import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  //deleteOne as deleteToko5,
  getMany as getToko5s,
  type Toko5,
  type Commentaire,
} from '../data/Toko5';
import PageContainer from './PageContainer';
import Link from '@mui/material/Link';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Modal, Typography } from '@mui/material';
//import { flushSync } from 'react-dom';
//import { useAuth } from '../context/AuthContext';
import SockJs from "sockjs-client";
import { Client } from '@stomp/stompjs';
import { Slide, toast } from 'react-toastify';

const INITIAL_PAGE_SIZE = 10;

const { VITE_BACKEND_SERVER } = import.meta.env;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  //border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const qrModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  borderRadius: 5,
  bgcolor: 'ghostwhite',
  //border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center'
};

export default function Toko5List() {

  //const {axiosInstance} = useAuth();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  //const [listToko5, setListToko5] = useState<Toko5[]>([]);

  const [date, setDate] = useState<Dayjs>(dayjs());

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const [currentQr, setCurrentQr] = useState<string>('');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleQrModalOpen = React.useCallback((uuid: string) => {
    setCurrentQr(uuid);
    setQrModalOpen(true);
  }, []);
  const handleQrModalClose = () => setQrModalOpen(false);

  // const handleDateChange = (newValue) => {
  //   setSelectedDate(newValue);

  //   // 3. Access and format the date value for use (e.g., send to an API).
  //   if (newValue) {
  //     // Format the dayjs object into a standard ISO string (YYYY-MM-DD)
  //     const dateISOString = newValue.toISOString(); 
  //     // Or format it into a specific string format for display
  //     const formattedDate = newValue.format('MM-DD-YYYY'); 

  //     console.log('Raw date object:', newValue);
  //     console.log('ISO String:', dateISOString);
  //     console.log('Formatted Date:', formattedDate);
  //   } else {
  //     console.log('Date cleared, value is null');
  //   }
  // };

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  const [filterModel, setFilterModel] = useState<GridFilterModel>(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
  );

  const [sortModel, setSortModel] = useState<GridSortModel>(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : [],
  );

  const [rowsState, setRowsState] = useState<{
    rows: Toko5[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set('filter', JSON.stringify(model));
      } else {
        searchParams.delete('filter');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleSortModelChange = React.useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set('sort', JSON.stringify(model));
      } else {
        searchParams.delete('sort');
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    console.log('date', date.toISOString().split('T')[0]);

    const toko5sReponse = await axiosInstance.get("/toko5s", { params: { date: date.toISOString().split('T')[0] } });
    const list = toko5sReponse.data as Toko5[];
    //console.log("list toko5 from api", list);
    //setListToko5(list);

    try {
      const listData = await getToko5s({
        paginationModel,
        sortModel,
        filterModel,
        listToko5: list,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel, axiosInstance, date]);


  const stompClientRef = React.useRef<Client>(null);

  React.useEffect(() => {
    loadData();


    const socket = new SockJs(`${VITE_BACKEND_SERVER}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        stompClient.subscribe('/topic/', (response) => {
          console.log('Received message:', response.body);
          //setMessage(JSON.parse(response.body).content);
        });
        stompClient.subscribe('/topic/toko5s/new', (message) => {
          const newToko5 = JSON.parse(message.body) as Toko5;
          //console.log(newToko5);

          setRowsState(prev => ({
            rows: [newToko5, ...prev.rows],
            rowCount: prev.rowCount + 1,
          }));
        });


        stompClient.subscribe('/topic/toko5s/invalid', (message) => {
          const toko5 = JSON.parse(message.body) as Toko5;
          //console.log(newToko5);

          setRowsState(prev => {
            const updatedRows = prev.rows.map(row =>
              row.toko5Id === toko5.toko5Id ? toko5 : row
            );

            return {
              rows: updatedRows,
              rowCount: prev.rowCount,
            };
          });

          toast.warn(`TOKO 5 DE ${toko5.nomContractant} ${toko5.prenomContractant} invalide!`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
          });
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };

  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  // const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
  //   ({ row }) => {
  //     navigate(`/employees/${row.id}`);
  //   },
  //   [navigate],
  // );

  // const handleCreateClick = React.useCallback(() => {
  //   navigate('/employees/new');
  // }, [navigate]);

  // const handleRowEdit = React.useCallback(
  //   (toko5: Toko5) => () => {
  //     navigate(`/toko5s/${toko5.toko5Id}/edit`);
  //   },
  //   [navigate],
  // );

  const handleRowDelete = React.useCallback(
    (toko5: Toko5) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${toko5.prenomContractant}?`,
        {
          title: `Delete employee?`,
          severity: 'error',
          okText: 'Delete',
          cancelText: 'Cancel',
        },
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          //await deleteToko5((toko5.toko5Id));

          notifications.show('toko5 deleted successfully.', {
            severity: 'success',
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            `Failed to delete toko5. Reason:' ${(deleteError as Error).message}`,
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
        setIsLoading(false);
      }
    },
    [dialogs, notifications, loadData],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      // { field: 'toko5Id', headerName: 'ID' },
      { field: 'nomContractant', headerName: 'Nom du Contractant', width: 180 },
      { field: 'prenomContractant', headerName: 'Prenom du Contractant', width: 180 },
      {
        field: 'dateHeure',
        headerName: 'Date et heure',
        //type: 'date',
        valueGetter: (value) => value && new Date(value).toLocaleString(),
        width: 190,
      },
      // {
      //   field: 'role',
      //   headerName: 'Department',
      //   type: 'singleSelect',
      //   valueOptions: ['Market', 'Finance', 'Development'],
      //   width: 160,
      // },
      {
        field: 'listMesureControle',
        headerName: 'Mesures de controle',
        width: 190,
        //align: 'center',
        //valueGetter: (value: unknown[]) => value.length
        renderCell: (params: GridCellParams) => {
          const onClick = () => {
            // alert(`Row test`);
          };
          if (Array.isArray(params.value) && params.value.length > 0) {
            {/*color="inherit"*/ }
            const listComs = params.value as Commentaire[];
            const id = listComs[0].toko5Id;
            return <Link href={`/#/toko5s/toko5/${id}/mesures`} onClick={onClick} variant="body2" color={"#4876ee"}>{params.value.length} mesure(s) prise(s)</Link>
          }
          // return <Button variant="contained" color="primary" onClick={onClick}>{params.value.length}</Button>;
          return <Link href="/#/toko5s" variant="body2" color="inherit" underline='none'>0 mesure prise</Link>
        },
      },
      {
        field: 'listCommentaire',
        headerName: 'Commentaires',
        width: 170,
        //align: 'center',
        //valueGetter: (value: unknown[]) => value.length
        renderCell: (params: GridCellParams) => {
          const onClick = () => {
            // alert(`Row test`);
          };
          if (Array.isArray(params.value) && params.value.length > 0) {
            {/*color="inherit"*/ }
            const listComs = params.value as Commentaire[];
            const id = listComs[0].toko5Id;
            return <Link href={`/#/toko5s/toko5/${id}/comments`} onClick={onClick} variant="body2" color={"#4876ee"} >{params.value.length} commentaire(s)</Link>
          }
          // return <Button variant="contained" color="primary" onClick={onClick}>{params.value.length}</Button>;
          return <Link href="#" onClick={onClick} variant="body2" color="inherit">0 commentaire</Link>
        },
      },
      {
        field: 'etat', headerName: 'État',
        width: 90,
        renderCell: (params: GridCellParams) => {
          switch (params.value) {
            case 'ongoing':
              return <IconButton aria-label="en cours" color="primary">
                <HourglassBottomIcon />
              </IconButton>;
            case 'valide':
              return <IconButton aria-label="valide" color="primary">
                <AssignmentTurnedInIcon />
              </IconButton>;
            case 'invalide':
              return <IconButton aria-label="invalide" color="primary" onClick={handleModalOpen}>
                <WarningIcon sx={{ color: 'rgba(239, 253, 43, 0.87)' }} />
              </IconButton>;
          }
        },
      },
      {
        field: 'toko5Id',
        headerName: 'QR',
        renderCell: (params: GridCellParams) => {
          return <IconButton aria-label="invalide" color="primary" onClick={() => { handleQrModalOpen(String(params.value)) }}>
            <QrCodeIcon />
          </IconButton>;
        }
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowDelete, handleQrModalOpen],
  );

  const pageTitle1 = 'LISTE DES TOKO 5';
  const pageTitle2 = 'liste des toko 5';

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue !== null) {
      setDate(newValue);
      console.log('new date', newValue.toISOString().split('T')[0]);
    }
  }


  return (
    <PageContainer
      title={pageTitle1}
      breadcrumbs={[{ title: pageTitle2 }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          {/* <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Date
          </Button> */}
          {/* <DemoItem label="Desktop variant">
          </DemoItem> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker value={date} onChange={handleDateChange} />
          </LocalizationProvider>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            getRowId={(row) => row.toko5Id}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            //onRowClick={handleRowClick}
            loading={isLoading}
            initialState={initialState}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
                paddingLeft: '30px'
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
              {
                outline: 'none',
              },
              [`& .${gridClasses.row}:hover`]: {
                cursor: 'pointer',
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'circular-progress',
                noRowsVariant: 'circular-progress',
              },
              baseIconButton: {
                size: 'small',
              },
            }}
          />
        )}
      </Box>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>

      <Modal
        open={qrModalOpen}
        onClose={handleQrModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={qrModalStyle}>
          <QRCode value={currentQr} />
        </Box>
      </Modal>
    </PageContainer>
  );
}
