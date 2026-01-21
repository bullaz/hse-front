import * as React from 'react';
import { useNavigate } from 'react-router';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import SocieteForm, {
  type FormFieldValue,
  type SocieteFormState,
} from './SocieteForm';
import PageContainer from '../PageContainer';
import {
  createOne as createSociete,
  validate as validateSociete,
  type Societe,
} from '../../data/societe';
import { useAuth } from '../../context/AuthContext';

const INITIAL_FORM_VALUES: Partial<SocieteFormState['values']> = {
};

export default function AddNewTask() {

  const { axiosInstance } = useAuth();

  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<SocieteFormState>(() => ({
    values: INITIAL_FORM_VALUES,
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
    []
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
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

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
      await createSociete(formValues as Omit<Societe, 'societeId'>,axiosInstance);
      notifications.show('Ajout de societe reussie.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/societes');
    } catch (createError) {
      notifications.show(
        `Erreur durant l'ajout du societe. Raison: ${(createError as Error).message}`,
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
      title="Planifier une tâche"
      breadcrumbs={[{ title: 'Liste des sociétés', path: '/societes' }, { title: 'Ajouter' }]}
    >
      <SocieteForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Creer"
      />
    </PageContainer>
  );
}
