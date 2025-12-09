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
  GridEventListener,
  GridCellParams,
} from '@mui/x-data-grid';
//import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  deleteOne as deleteToko5,
  getMany as getToko5s,
  type Toko5,
} from '../data/Toko5';
import PageContainer from './PageContainer';
import Link from '@mui/material/Link';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const INITIAL_PAGE_SIZE = 10;

export default function ListMesure() {

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
  );

  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : [],
  );

  const [rowsState, setRowsState] = React.useState<{
    rows: Toko5[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

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

    try {
      const listData = await getToko5s({
        paginationModel,
        sortModel,
        filterModel,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
    ({ row }) => {
      navigate(`/employees/${row.id}`);
    },
    [navigate],
  );

  // const handleCreateClick = React.useCallback(() => {
  //   navigate('/employees/new');
  // }, [navigate]);

  const handleRowEdit = React.useCallback(
    (toko5: Toko5) => () => {
      navigate(`/toko5s/${toko5.toko5Id}/edit`);
    },
    [navigate],
  );

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
          await deleteToko5((toko5.toko5Id));

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
        type: 'date',
        valueGetter: (value) => value && new Date(value),
        width: 140,
      },
      // {
      //   field: 'role',
      //   headerName: 'Department',
      //   type: 'singleSelect',
      //   valueOptions: ['Market', 'Finance', 'Development'],
      //   width: 160,
      // },
      { field: 'etat', headerName: 'État', type: 'boolean' },
      {
        field: 'listMesureControle',
        headerName: 'Mesures de controle',
        width: 190,
        align: 'center',
        //valueGetter: (value: unknown[]) => value.length
        renderCell: (params: GridCellParams) => {
          const onClick = () => {
            alert(`Row test`);
          };
          if (Array.isArray(params.value)) {
            return <Link href="#" onClick={onClick} variant="body2" color="inherit">{params.value.length} mesure(s)</Link>
          }
          // return <Button variant="contained" color="primary" onClick={onClick}>{params.value.length}</Button>;
          return <Link href="#" onClick={onClick} variant="body2" color="inherit">0 mesure(s)</Link>
        },
      },
      {
        field: 'listCommentaire',
        headerName: 'Commentaires',
        width: 190,
        align: 'center',
        //valueGetter: (value: unknown[]) => value.length
        renderCell: (params: GridCellParams) => {
          const onClick = () => {
            alert(`Row test`);
          };
          if (Array.isArray(params.value)) {
            return <Link href="#" onClick={onClick} variant="body2" color="inherit">{params.value.length} commentaire(s)</Link>
          }
          // return <Button variant="contained" color="primary" onClick={onClick}>{params.value.length}</Button>;
          return <Link href="#" onClick={onClick} variant="body2" color="inherit">0 commentaire</Link>
        },
      },
      {
        field: 'actions',
        type: 'actions',
        flex: 1,
        align: 'right',
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete],
  );

  const pageTitle1 = 'TOKO 5';
  const pageTitle2 = '';

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
            <DesktopDatePicker defaultValue={dayjs()} />
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
            onRowClick={handleRowClick}
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
