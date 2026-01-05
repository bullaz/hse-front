import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import TaskForm, {
  type FormFieldValue,
  type TaskFormState,
} from './TaskForm';
import PageContainer from '../PageContainer';
import {
  createOne as createTask,
  validate as validateTask,
  type TaskDto,
} from '../../data/task';
import { useAuth } from '../../context/AuthContext';

const INITIAL_FORM_VALUES: Partial<TaskFormState['values']> = {
};

export default function TaskCreate() {

  const { axiosInstance } = useAuth();

  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<TaskFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<TaskFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<TaskFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    []
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof TaskFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<TaskFormState['values']>) => {
        const { issues } = validateTask(values);
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
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateTask(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      console.log(formValues);
      await createTask(formValues as Omit<TaskDto, 'taskId'>,axiosInstance);
      notifications.show('Ajout de tâche reussie.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/tasks');
    } catch (createError) {
      notifications.show(
        `Erreur durant l'ajout du tâche. Raison: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors,axiosInstance]);

  return (
    <PageContainer
      title="Ajouter une tâche"
      breadcrumbs={[{ title: 'Liste des tâches', path: '/tasks' }, { title: 'Ajouter' }]}
    >
      <TaskForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Enregistrer"
      />
    </PageContainer>
  );
}
