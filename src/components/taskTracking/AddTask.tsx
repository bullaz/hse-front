import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import PageContainer from '../PageContainer';
import {
  createOne as createTask,
  validate as validateTask,
  type TaskDetailDto,
} from '../../data/TaskDetail';
import { useAuth } from '../../context/AuthContext';
import type { FormFieldValue, TaskDetailFormState } from './TaskDetailForm';
import TaskDetailForm from './TaskDetailForm';
import type { Task } from '../../data/task';
import { getListTask } from '../../services/toko5Services';

const INITIAL_FORM_VALUES: Partial<TaskDetailFormState['values']> = {
};

export default function AddNewTask() {

  const { axiosInstance } = useAuth();

  const [listTask, setListTask] = React.useState<Task[]>();

  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<TaskDetailFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<TaskDetailFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<TaskDetailFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    []
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof TaskDetailFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<TaskDetailFormState['values']>) => {
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
      return ;
    }
    setFormErrors({});

    try {
      await createTask(axiosInstance, formValues as Omit<TaskDetailDto, 'taskDetailId'>);
      notifications.show('Ajout de tâche reussi.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/societes');
    } catch (createError) {
      notifications.show(
        `Erreur durant l'ajout de la tâche. Raison: ${(createError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors, axiosInstance]);

  const initListTask = async () => {
    const list: Task[] = await getListTask(axiosInstance);
    setListTask(list);
  }
  React.useEffect(() => {
    initListTask();
  }, [])

  return (
    <PageContainer
      title="Planifier une tâche"
      breadcrumbs={[{ title: 'Les tâche planifiée', path: '/societes' }, { title: 'Ajouter' }]}
    >
      {listTask && (
        <TaskDetailForm
          formState={formState}
          onFieldChange={handleFormFieldChange}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          submitButtonLabel="Creer"
          listTask={listTask}
        />
      )}
    </PageContainer>
  );
}
