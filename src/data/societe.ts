import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import type { AxiosInstance } from 'axios';

export interface Societe {
    societeId: number,
    nom: string
}

export async function getManySociete({
    paginationModel,
    filterModel,
    sortModel,
    listSociete
}: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
    listSociete: Societe[];
}): Promise<{ items: Societe[]; itemCount: number }> {

    let filteredSocietes = [...listSociete];

    // Apply filters
    if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
                return;
            }

            filteredSocietes = filteredSocietes.filter((societe) => {
                const societeValue = societe[field as keyof Societe];

                switch (operator) {
                    case 'contains':
                        return String(societeValue).toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                        return societeValue === value;
                    case 'startsWith':
                        return String(societeValue).toLowerCase().startsWith(String(value).toLowerCase());
                    case 'endsWith':
                        return String(societeValue).toLowerCase().endsWith(String(value).toLowerCase());
                    case '>':
                        return societeValue > value;
                    case '<':
                        return societeValue < value;
                    default:
                        return true;
                }
            });
        });
    }

    // Apply sorting
    if (sortModel?.length) {
        filteredSocietes.sort((a, b) => {
            for (const { field, sort } of sortModel) {
                if (a[field as keyof Societe] < b[field as keyof Societe]) {
                    return sort === 'asc' ? -1 : 1;
                }
                if (a[field as keyof Societe] > b[field as keyof Societe]) {
                    return sort === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedSocietes = filteredSocietes.slice(start, end);

    return {
        items: paginatedSocietes,
        itemCount: filteredSocietes.length,
    };
}


export async function createOne(data: Omit<Societe, 'societeId'>, axiosInstance: AxiosInstance): Promise<Societe> {

    const newEmployee = {
        societeId: null,
        ...data,
    };

    const response = await axiosInstance.post(`/societes`, newEmployee);

    return response.data as Societe;
}


export async function getOne(societeId: number, axiosInstance: AxiosInstance): Promise<Societe> {
    const response = await axiosInstance.get(`/societes/${societeId}`);
    return response.data as Societe;
}

export async function updateOne(societeId: number, data: Partial<Omit<Societe, 'id'>>, axiosInstance: AxiosInstance): Promise<Societe> {
    const response = await axiosInstance.put(`/societes/${societeId}`,data);
    return response.data as Societe;
}


// export async function deleteOne(employeeId: number) {
//   const employeesStore = getEmployeesStore();

//   setEmployeesStore(employeesStore.filter((employee) => employee.id !== employeeId));
// }



type ValidationResult = { issues: { message: string; path: (keyof Societe)[] }[] };

export function validate(societe: Partial<Societe>): ValidationResult {
    let issues: ValidationResult['issues'] = [];

    if (!societe.nom) {
        issues = [...issues, { message: 'Le nom est requis', path: ['nom'] }];
    }
    return { issues };
}
