import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, type SelectChangeEvent, type SelectProps } from "@mui/material";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { TaskDetailDto } from "../../data/TaskDetail";
import type { Task } from "../../data/task";
import { useAuth } from "../../context/AuthContext";

export interface TaskDetailFormState {
  values: Partial<Omit<TaskDetailDto, "taskDetailId">>;
  errors: Partial<Record<keyof TaskDetailFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface TaskDetailFormProps {
  formState: TaskDetailFormState;
  onFieldChange: (
    name: keyof TaskDetailFormState["values"],
    value: FormFieldValue
  ) => void;
  onSubmit: (formValues: Partial<TaskDetailFormState["values"]>) => Promise<void>;
  onReset?: (formValues: Partial<TaskDetailFormState["values"]>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  listTask: Task[];
}

export default function TaskDetailForm(props: TaskDetailFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
    listTask
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const { axiosInstance } = useAuth();

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit]
  );

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof TaskDetailFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof TaskDetailFormState["values"],
        Number(event.target.value)
      );
    },
    [onFieldChange]
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof TaskDetailFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleDateFieldChange = React.useCallback(
    (fieldName: keyof TaskDetailFormState["values"]) => (value: Dayjs | null) => {
      if (value?.isValid()) {
        onFieldChange(fieldName, value.toISOString() ?? null);
      } else if (formValues[fieldName]) {
        onFieldChange(fieldName, null);
      }
    },
    [formValues, onFieldChange]
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? "/task_tracking");
  }, [navigate, backButtonPath]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.description ?? ""}
              onChange={handleTextFieldChange}
              name="description"
              label="Description"
              error={!!formErrors.description}
              helperText={formErrors.description ?? " "}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.workersNumber ?? 1}
              onChange={handleNumberFieldChange}
              name="workersNumber"
              label="Nombre d'intervenants"
              type="number"
              error={!!formErrors.workersNumber}
              helperText={formErrors.workersNumber ?? " "}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                defaultValue={dayjs()}
                value={formValues.date ? dayjs(formValues.date) : null}
                onChange={ handleDateFieldChange('date') }
                name="date"
                label="Date et heure"
                slotProps={{
                  textField: {
                    error: !!formErrors.date,
                    helperText: formErrors.date ?? " ",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.taskId} fullWidth>
              <InputLabel id="task-label">Tâche</InputLabel>
              <Select
                value={formValues.taskId}
                //onChange={handleSelectFieldChange as SelectProps["onChange"]}
                labelId="task-label"
                name="tâche"
                label="Tâche"
                fullWidth
                defaultValue={listTask[0].taskId}
              >
                {listTask && (listTask.map((task: Task) => (
                  <MenuItem key={task.taskId} value={task.taskId}>{task.nom}</MenuItem>
                ))
                )}
              </Select>
              {/* <FormHelperText>{formErrors.taskId ?? " "}</FormHelperText> */}
            </FormControl>
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Retour
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
