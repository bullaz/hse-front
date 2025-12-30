import type { AxiosInstance } from "axios";
import type { Question } from "./Toko5";
import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

export interface Task {
    taskId: number,
    nom: string,
    listQuestion: Question[]
}

export async function getListTask(axiosInstance: AxiosInstance): Promise<Task[]> {
    const response = await axiosInstance.get("/toko5s/tasks");
    return response.data as Task[];
}


export async function getManyTask({
    paginationModel,
    filterModel,
    sortModel,
    axiosInstance
}: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
    axiosInstance: AxiosInstance;
}): Promise<{ items: Task[]; itemCount: number }> {

    const listTask: Task[] = await getListTask(axiosInstance);

    let filteredTasks = [...listTask];

    // Apply filters
    if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
                return;
            }

            filteredTasks = filteredTasks.filter((task) => {
                const taskValue = task[field as keyof Task];

                switch (operator) {
                    case 'contains':
                        return String(taskValue).toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                        return taskValue === value;
                    case 'startsWith':
                        return String(taskValue).toLowerCase().startsWith(String(value).toLowerCase());
                    case 'endsWith':
                        return String(taskValue).toLowerCase().endsWith(String(value).toLowerCase());
                    case '>':
                        return taskValue > value;
                    case '<':
                        return taskValue < value;
                    default:
                        return true;
                }
            });
        });
    }

    // Apply sorting
    if (sortModel?.length) {
        filteredTasks.sort((a, b) => {
            for (const { field, sort } of sortModel) {
                if (a[field as keyof Task] < b[field as keyof Task]) {
                    return sort === 'asc' ? -1 : 1;
                }
                if (a[field as keyof Task] > b[field as keyof Task]) {
                    return sort === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedTasks = filteredTasks.slice(start, end);

    return {
        items: paginatedTasks,
        itemCount: filteredTasks.length,
    };
}


export async function createOne(data: Omit<Task, 'societeId'>, axiosInstance: AxiosInstance): Promise<Task> {

    const newTask = {
        societeId: null,
        ...data,
    };

    const response = await axiosInstance.post(`/toko5s/tasks`, newTask);

    return response.data as Task;
}


export async function getOne(taskId: number, axiosInstance: AxiosInstance): Promise<Task> {
    const response = await axiosInstance.get(`/toko5s/tasks/${taskId}`);
    return response.data as Task;
}

export async function updateOne(taskId: number, data: Partial<Omit<Task, 'id'>>, axiosInstance: AxiosInstance): Promise<Task> {
    const response = await axiosInstance.put(`/toko5s/tasks/${taskId}`, data);
    return response.data as Task;
}


export async function deleteOne(taskId: number, currentListTask: Task[], axiosInstance: AxiosInstance) {
    await axiosInstance.delete(`/toko5s/tasks/${taskId}`);
    return currentListTask.filter((task) => task.taskId !== taskId);
}