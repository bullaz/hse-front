import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  getOne as getSociete,
  updateOne as updateEmployee,
  validate as validateSociete,
  type Societe,
} from '../../data/societe';
import SocieteForm, {
  type FormFieldValue,
  type SocieteFormState,
} from './SocieteForm';
import PageContainer from '../PageContainer';
import { useAuth } from '../../context/AuthContext';

function SocieteEditForm({
  initialValues,
  onSubmit,
}: {
  initialValues: Partial<SocieteFormState['values']>;
  onSubmit: (formValues: Partial<SocieteFormState['values']>) => Promise<void>;
}) {
  // const { societeId } = useParams();
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<SocieteFormState>(() => ({
    values: initialValues,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<SocieteFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<SocieteFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof SocieteFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<SocieteFormState['values']>) => {
        const { issues } = validateSociete(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateSociete(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show('Societe edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/societes');
    } catch (editError) {
      notifications.show(
        `Failed to edit employee. Reason: ${(editError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors]);

  return (
    <SocieteForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="sauvegarder"
      backButtonPath={`/societes`}
    />
  );
}

export default function SocieteEdit() {
  const { societeId } = useParams();

  const { axiosInstance } = useAuth();

  const [societe, setSociete] = React.useState<Societe | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getSociete(Number(societeId),axiosInstance);
      setSociete(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [societeId, axiosInstance]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<SocieteFormState['values']>) => {
      const updatedData = await updateEmployee(Number(societeId), formValues, axiosInstance);
      setSociete(updatedData);
    },
    [societeId, axiosInstance],
  );

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return societe ? (
      <SocieteEditForm initialValues={societe} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, societe, handleSubmit]);

  return (
    <PageContainer
      title={`Modifier la société`}
      breadcrumbs={[
        { title: 'Liste des sociétés', path: '/societes' },
        { title: `Societe ${societeId}`, path: `/societes/${societeId}/edit` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
