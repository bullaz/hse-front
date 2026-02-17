import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import type { TaskDto } from "../../data/task";
import Select, { type ActionMeta, type MultiValue } from "react-select";
// import permitToWork from "../../assets/pictogram/organise/permit-to-work.png";
// import mask from "../../assets/pictogram/epi/mask.png";
import { CircularProgress } from "@mui/material";
import { getAllEpi } from "../../services/toko5Services";
import { useEffect, useState } from "react";
import type { Question } from "../../data/Toko5";
import { useAuth } from "../../context/AuthContext";

export interface TaskFormState {
    values: Partial<Omit<TaskDto, "taskId">>;
    errors: Partial<Record<keyof TaskFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null | number[];

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

interface TaskOption {
    value: number,
    label: string,
    pictogramme: string,
    categorie: string
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


    const handleReactSelectChange = React.useCallback(
        (newValues: MultiValue<TaskOption>, actionMeta: ActionMeta<TaskOption>) => {
            console.log(newValues);
            const listId = newValues.map((taskOption) => {
                return taskOption.value;
            })
            onFieldChange(
                actionMeta.name as keyof TaskFormState["values"],
                listId
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
        navigate(backButtonPath ?? "/tasks");
    }, [navigate, backButtonPath]);

    const { axiosInstance } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);

    const [selectOptions, setSelectOptions] = useState<TaskOption[]>();

    useEffect(() => {
        const getListQuestion = async () => {
            const list: Question[] = await getAllEpi(axiosInstance);

            const options = list.map(question => ({
                value: question.questionId,
                label: question.nom,
                pictogramme: question.pictogramme,
                categorie: question.categorie
            }));

            setSelectOptions(options);
            setLoading(false);
        }
        getListQuestion();
    }, [axiosInstance])

    return (
        <>
            {
                loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        style={{ flex: 1, marginTop: "10px" }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        autoComplete="off"
                        onReset={handleReset}
                        sx={{ width: "100%" }}
                    >
                        <FormGroup>
                            <Grid container spacing={2} sx={{ mb: 2, width: "100%" }} direction="row">
                                <Grid container spacing={2} sx={{ mb: 2, width: "100%" }} direction="row">
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
                                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
                                        <TextField
                                            value={formValues.abbreviation ?? ""}
                                            onChange={handleTextFieldChange}
                                            name="abbreviation"
                                            label="Abréviation"
                                            error={!!formErrors.abbreviation}
                                            helperText={formErrors.abbreviation ?? " "}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", flexDirection: 'column', alignSelf: 'flex-start', gap: 0 }}>
                                    <label htmlFor="question-select" style={{ marginBottom: '8px', fontSize: '12px' }}>
                                        Selectionner
                                    </label>
                                    <Select
                                        options={selectOptions}
                                        isMulti={true}
                                        onChange={handleReactSelectChange}
                                        name="listQuestionId"
                                        formatOptionLabel={(option: TaskOption) => (
                                            <Grid container spacing={1}>
                                                <Grid>
                                                    <img
                                                        src={`/images/pictogram/${option.categorie}/${option.pictogramme}.png`}
                                                        alt={`${option.label}`}
                                                        style={{ width: 30, height: 30 }}
                                                    />
                                                </Grid>
                                                <Grid>
                                                    <span>{option.label}</span>
                                                </Grid>
                                            </Grid>
                                        )}
                                        styles={{
                                            control: (baseStyles /*,state*/) => ({
                                                ...baseStyles,
                                                width: '100%',
                                                minHeight: '45px'
                                            }),
                                            menu: (baseStyles /*,state*/) => ({
                                                ...baseStyles,
                                                width: '100%',
                                            }),
                                            container: (baseStyles /*,state*/) => ({
                                                ...baseStyles,
                                                width: '100%',
                                            }),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FormGroup>
                        <Stack direction="row" spacing={2} justifyContent="space-between" style={{ marginTop: '23px' }}>
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
                                // size="large"
                                loading={isSubmitting}
                            >
                                {submitButtonLabel}
                            </Button>
                        </Stack>
                    </Box >

                )
            }
        </>
    );
}
