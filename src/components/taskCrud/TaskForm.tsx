import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// import Checkbox from "@mui/material/Checkbox";
// import FormControl from "@mui/material/FormControl";
// import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
// import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
// import type { SelectChangeEvent, SelectProps } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
// import dayjs, { Dayjs } from "dayjs";
import type { Task } from "../../data/task";
import Select from "react-select";
import permitToWork from "../../assets/pictogram/organise/permit-to-work.png";
import mask from "../../assets/pictogram/epi/mask.png";

const options = [
    {
        value: "chocolate",
        label: (
            <Grid container spacing={1}>
                <Grid>
                    <img
                        src={permitToWork}
                        alt="Custom PNG Icon"
                        style={{ width: 30, height: 30 }}
                    />
                </Grid>
                <Grid>
                    <span>permis de travail</span>

                </Grid>
            </Grid>
        ),
    },
    {
        value: "strawberry",
        label: (
            <Grid container spacing={1}>
                <Grid>
                    <img
                        src={mask}
                        alt="Custom PNG Icon"
                        style={{ width: 30, height: 30 }}
                    />
                </Grid>
                <Grid>
                    <span>mask</span>

                </Grid>
            </Grid>
        ),
    },
];

export interface TaskFormState {
    values: Partial<Omit<Task, "id">>;
    errors: Partial<Record<keyof TaskFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface TaskFormProps {
    formState: TaskFormState;
    onFieldChange: (
        name: keyof TaskFormState["values"],
        value: FormFieldValue
    ) => void;
    onSubmit: (formValues: Partial<TaskFormState["values"]>) => Promise<void>;
    onReset?: (formValues: Partial<TaskFormState["values"]>) => void;
    submitButtonLabel: string;
    backButtonPath?: string;
}

export default function TaskForm(props: TaskFormProps) {
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
                event.target.name as keyof TaskFormState["values"],
                event.target.value
            );
        },
        [onFieldChange]
    );

    //   const handleNumberFieldChange = React.useCallback(
    //     (event: React.ChangeEvent<HTMLInputElement>) => {
    //       onFieldChange(
    //         event.target.name as keyof TaskFormState["values"],
    //         Number(event.target.value)
    //       );
    //     },
    //     [onFieldChange]
    //   );

    //   const handleCheckboxFieldChange = React.useCallback(
    //     (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    //       onFieldChange(
    //         event.target.name as keyof TaskFormState["values"],
    //         checked
    //       );
    //     },
    //     [onFieldChange]
    //   );

    //   const handleDateFieldChange = React.useCallback(
    //     (fieldName: keyof TaskFormState["values"]) => (value: Dayjs | null) => {
    //       if (value?.isValid()) {
    //         onFieldChange(fieldName, value.toISOString() ?? null);
    //       } else if (formValues[fieldName]) {
    //         onFieldChange(fieldName, null);
    //       }
    //     },
    //     [formValues, onFieldChange]
    //   );

    //   const handleSelectFieldChange = React.useCallback(
    //     (event: SelectChangeEvent) => {
    //       onFieldChange(
    //         event.target.name as keyof TaskFormState["values"],
    //         event.target.value
    //       );
    //     },
    //     [onFieldChange]
    //   );

    const handleReset = React.useCallback(() => {
        if (onReset) {
            onReset(formValues);
        }
    }, [formValues, onReset]);

    const handleBack = React.useCallback(() => {
        navigate(backButtonPath ?? "/tasks");
    }, [navigate, backButtonPath]);

    // const imageName = "permit-to-work";
    // const imageUrl = new URL(
    //     `../../assets/pictogram/organise/${imageName}.png`,
    //     import.meta.url
    // ).href;

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
                <Grid container spacing={2} sx={{ mb: 2, width: "100%" }} direction="column">
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
                        <TextField
                            value={formValues.nom ?? ""}
                            onChange={handleTextFieldChange}
                            name="nom"
                            label="Nom"
                            error={!!formErrors.nom}
                            helperText={formErrors.nom ?? " "}
                            fullWidth
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
                        <label htmlFor="question-select" style={{ marginBottom: '8px', fontSize: '12px' }}>
                            Selectionner
                        </label>
                        <Select
                            options={options}
                            isMulti={true}
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    width: '100%',
                                    minHeight: '45px'
                                }),
                                menu: (baseStyles, state) => ({
                                    ...baseStyles,
                                    width: '100%',
                                }),
                                container: (baseStyles, state) => ({
                                    ...baseStyles,
                                    width: '100%',
                                }),
                            }}
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="number"
              value={formValues.age ?? ""}
              onChange={handleNumberFieldChange}
              name="age"
              label="Age"
              error={!!formErrors.age}
              helperText={formErrors.age ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={formValues.joinDate ? dayjs(formValues.joinDate) : null}
                onChange={handleDateFieldChange("joinDate")}
                name="joinDate"
                label="Join date"
                slotProps={{
                  textField: {
                    error: !!formErrors.joinDate,
                    helperText: formErrors.joinDate ?? " ",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.role} fullWidth>
              <InputLabel id="employee-role-label">Department</InputLabel>
              <Select
                value={formValues.role ?? ""}
                onChange={handleSelectFieldChange as SelectProps["onChange"]}
                labelId="employee-role-label"
                name="role"
                label="Department"
                defaultValue=""
                fullWidth
              >
                <MenuItem value="Market">Market</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Development">Development</MenuItem>
              </Select>
              <FormHelperText>{formErrors.role ?? " "}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl>
              <FormControlLabel
                name="isFullTime"
                control={
                  <Checkbox
                    size="large"
                    checked={formValues.isFullTime ?? false}
                    onChange={handleCheckboxFieldChange}
                  />
                }
                label="Full-time"
              />
              <FormHelperText error={!!formErrors.isFullTime}>
                {formErrors.isFullTime ?? " "}
              </FormHelperText>
            </FormControl>
          </Grid> */}
                </Grid>
            </FormGroup>
            <Stack direction="row" spacing={2} justifyContent="space-between" style={{marginTop:'35px'}}>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    retour
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
