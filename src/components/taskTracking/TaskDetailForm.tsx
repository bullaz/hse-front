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
import dayjs from "dayjs";
import type { TaskDetailDto } from "../../data/TaskDetail";

export interface TaskDetailDtoFormState {
  values: TaskDetailDto;
  errors: Partial<Record<keyof TaskDetailDtoFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface TaskDetailDtoFormProps {
  formState: TaskDetailDtoFormState;
  onFieldChange: (
    name: keyof TaskDetailDtoFormState["values"],
    value: FormFieldValue
  ) => void;
  onSubmit: (formValues: Partial<TaskDetailDtoFormState["values"]>) => Promise<void>;
  onReset?: (formValues: Partial<TaskDetailDtoFormState["values"]>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function TaskDetailDtoForm(props: TaskDetailDtoFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

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
        event.target.name as keyof TaskDetailDtoFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof TaskDetailDtoFormState["values"],
        Number(event.target.value)
      );
    },
    [onFieldChange]
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof TaskDetailDtoFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
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
              value={formValues.description ?? ""}
              onChange={handleNumberFieldChange}
              name="workersNumber"
              label="Nombre d'intervenanta"
              type="number"
              error={!!formErrors.workersNumber}
              helperText={formErrors.workersNumber ?? " "}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={formValues.date ? dayjs(formValues.date) : null}
                onChange={handleDateFieldChange("joinDateTime")}
                name="joinDateTime"
                label="Join date & time"
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
                value={formValues.taskId ?? 0}
                onChange={handleSelectFieldChange as SelectProps["onChange"]}
                labelId="task-label"
                name="tâche"
                label="Tâche"
                defaultValue={0}
                fullWidth
              >
                <MenuItem value={0}>Market</MenuItem>
                <MenuItem value={0}>Finance</MenuItem>
                <MenuItem value={0}>Development</MenuItem>
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
