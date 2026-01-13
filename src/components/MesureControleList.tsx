import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
//import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
// import Stack from '@mui/material/Stack';
// import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  // GridActionsCellItem,
  gridClasses
} from '@mui/x-data-grid';
import type {
  GridCellParams,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel
} from '@mui/x-data-grid';
//import AddIcon from '@mui/icons-material/Add';
// import RefreshIcon from '@mui/icons-material/Refresh';
//import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
// import { useDialogs } from '../hooks/useDialogs/useDialogs';
// import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  getManyMesureControle as getMesures,
  type MesureControle,
  type Question
} from '../data/Toko5';
import PageContainer from './PageContainer';
// import Link from '@mui/material/Link';
// import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import dayjs, { Dayjs } from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
//import { flushSync } from 'react-dom';
//import { useAuth } from '../context/AuthContext';
import { frFR } from '@mui/x-data-grid/locales';


const INITIAL_PAGE_SIZE = 10;

interface ComsParams {
  [key: string]: string | undefined;
  toko5Id: string;
}

export default function MesureControleList() {

  //const {axiosInstance} = useAuth();

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  const { toko5Id } = useParams<ComsParams>();
  //const [listToko5, setListToko5] = useState<Toko5[]>([]);

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

  // const dialogs = useDialogs();
  // const notifications = useNotifications();

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
    rows: MesureControle[];
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

    //console.log('date', date.toISOString().split('T')[0]);

    const mesureReponse = await axiosInstance.get(`/toko5s/toko5/${toko5Id}/mesures`, { params: {} });
    const list = mesureReponse.data as MesureControle[];
    //console.log("list toko5 from api", list);
    //setListToko5(list);

    try {
      const listData = await getMesures({
        paginationModel,
        sortModel,
        filterModel,
        listMesureControle: list,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel, axiosInstance, toko5Id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // const handleRefresh = React.useCallback(() => {
  //   if (!isLoading) {
  //     loadData();
  //   }
  // }, [isLoading, loadData]);

  // const handleCreateClick = React.useCallback(() => {
  //   navigate('/employees/new');
  // }, [navigate]);

  // const handleRowEdit = React.useCallback(
  //   (toko5: MesureControle) => () => {
  //     navigate(`/toko5s/${toko5.toko5Id}/edit`);
  //   },
  //   [navigate],
  // );

  // const handleRowDelete = React.useCallback(
  //   () => async () => {
  //     const confirmed = await dialogs.confirm(
  //       `Voulez-vous vraiment supprimer cette mesure de controle?`,
  //       {
  //         title: `Delete employee?`,
  //         severity: 'error',
  //         okText: 'Delete',
  //         cancelText: 'Cancel',
  //       },
  //     );

  //     if (confirmed) {
  //       setIsLoading(true);
  //       try {
  //         //await deleteToko5((toko5.toko5Id));

  //         notifications.show('toko5 deleted successfully.', {
  //           severity: 'success',
  //           autoHideDuration: 3000,
  //         });
  //         loadData();
  //       } catch (deleteError) {
  //         notifications.show(
  //           `Failed to delete toko5. Reason:' ${(deleteError as Error).message}`,
  //           {
  //             severity: 'error',
  //             autoHideDuration: 3000,
  //           },
  //         );
  //       }
  //       setIsLoading(false);
  //     }
  //   },
  //   [dialogs, notifications, loadData],
  // );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      // { field: 'toko5Id', headerName: 'ID' },
      {
        field: 'question', headerName: 'danger/risque', width: 200,
        renderCell: (params: GridCellParams) => {
          {/*color="inherit"*/ }
          const question = params.value as Question;
          //return <Link href={`/#/toko5s/toko5/${id}/comments`} onClick={onClick} variant="body2" color={"#4876ee"} >{params.value.length} commentaire(s)</Link>
          return <>{question.nom}</>
        },
      },
      { field: 'implemented', headerName: 'mise en place', width: 190, type: 'boolean' },
      { field: 'mesurePrise', headerName: 'Mesure prise', width: 600 },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: () => [
          // <GridActionsCellItem
          //   key="delete-item"
          //   icon={<DeleteIcon />}
          //   label="Delete"
          //   onClick={handleRowDelete()}
          // />,
        ],
      },
    ],
    [],
  );

  const pageTitle1 = 'MESURES DE CONTROLE PRISES SUR TOKO5 DE ?';
  //const pageTitle2 = '';


  return (
    <PageContainer
      title={pageTitle1}
      breadcrumbs={[
        { title: 'liste des toko 5', path: '/toko5s' },
        { title: 'Comments' }
      ]}
    // actions={
    //   <Stack direction="row" alignItems="center" spacing={1}>
    //     <Tooltip title="Reload data" placement="right" enterDelay={1000}>
    //       <div>
    //         <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
    //           <RefreshIcon />
    //         </IconButton>
    //       </div>
    //     </Tooltip>
    //     {/* <Button
    //       variant="contained"
    //       onClick={handleCreateClick}
    //       startIcon={<AddIcon />}
    //     >
    //       Date
    //     </Button> */}
    //     {/* <DemoItem label="Desktop variant">
    //     </DemoItem> */}
    //     <LocalizationProvider dateAdapter={AdapterDayjs}>
    //       <DesktopDatePicker value={date} onChange={handleDateChange}/>
    //     </LocalizationProvider>
    //   </Stack>
    // }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            getRowId={(row) => row.mesureControleId}
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
    </PageContainer>
  );
}
