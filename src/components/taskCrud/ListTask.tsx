import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses
} from '@mui/x-data-grid';
import type {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel
} from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  getManyTask as getTasks,
  deleteOne as deleteTask,
  type Task
} from '../../data/task';
import PageContainer from '../PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Button, Stack } from '@mui/material';

const INITIAL_PAGE_SIZE = 10;

export default function ListTask() {

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
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
    rows: Task[];
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
    try {
      const listData = await getTasks({
        paginationModel,
        sortModel,
        filterModel,
        axiosInstance
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError as Error);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel, axiosInstance]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateClick = React.useCallback(() => {
    navigate('/tasks/new');
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (task: Task) => () => {
      navigate(`/tasks/${task.taskId}/edit`);
    },
    [navigate],
  );

  const handleRowDelete = React.useCallback(
    (toDelete: Task) => async () => {
      const confirmed = await dialogs.confirm(
        `Voulez-vous vraiment supprimer la tâche ${toDelete.nom}?`,
        {
          title: `Supprimer la tâche?`,
          severity: 'error',
          okText: 'Supprimer',
          cancelText: 'Annuler',
        },
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          const newListTask: Task[] = await deleteTask(toDelete.taskId,rowsState.rows,axiosInstance);
          
          setRowsState(() => {
            return {
              rows: newListTask,
              rowCount: newListTask.length,
            };
          });

          notifications.show('suppression réussie.', {
            severity: 'success',
            autoHideDuration: 3000,
          });

        } catch (deleteError) {
          notifications.show(
            `échec de la suppression. Raison:' ${(deleteError as Error).message}`,
            {
              severity: 'error',
              autoHideDuration: 3000,
            },
          );
        }
        setIsLoading(false);
      }
    },
    [dialogs, notifications, axiosInstance, rowsState],
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
      { field: 'nom', headerName: 'Nom de la tâche', width: 200 },
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
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleRowEdit(row)}
          />
        ],
      },
    ],
    [handleRowDelete, handleRowEdit],
  );

  const pageTitle1 = 'Liste des tâches';
  //const pageTitle2 = '';


  return (
    <PageContainer
      title={pageTitle1}
      breadcrumbs={[
        { title: 'Liste des tâches' }
      ]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Créer
          </Button>
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
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            getRowId={(row) => row.societeId}
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
