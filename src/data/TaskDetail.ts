import type { AxiosInstance } from "axios";
import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { addFutureTask, addNewTask, getListTaskDetail } from "../services/toko5Services";
import type { Task } from "./task";

export interface TaskDetail {
    taskDetailId: number,
    description: string,
    workersNumber: number,
    date: string,
    task: Task,
    codeSup: string,
    codeWorker: string
}

export interface TaskDetailDto{
    taskDetailId: number | null,
    description: string,
    workersNumber: number,
    date: string,
    taskId: number,
    codeSup: string,
    codeWorker: string
}


export async function getManyTaskDetail({
    paginationModel,
    filterModel,
    sortModel,
    axiosInstance,
    date
}: {
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    filterModel: GridFilterModel;
    axiosInstance: AxiosInstance;
    date: string;
}): Promise<{ items: TaskDetail[]; itemCount: number }> {

    const listTaskDetail = await getListTaskDetail(axiosInstance, date);

    let filteredTaskDetails = [...listTaskDetail];

    if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
                return;
            }

            filteredTaskDetails = filteredTaskDetails.filter((taskDetail) => {
                const taskDetailValue = taskDetail[field as keyof TaskDetail];

                switch (operator) {
                    case 'contains':
                        return String(taskDetailValue).toLowerCase().includes(String(value).toLowerCase());
                    case 'equals':
                        return taskDetailValue === value;
                    case 'startsWith':
                        return String(taskDetailValue).toLowerCase().startsWith(String(value).toLowerCase());
                    case 'endsWith':
                        return String(taskDetailValue).toLowerCase().endsWith(String(value).toLowerCase());
                    case '>':
                        return taskDetailValue > value;
                    case '<':
                        return taskDetailValue < value;
                    default:
                        return true;
                }
            });
        });
    }

    if (sortModel?.length) {
        filteredTaskDetails.sort((a, b) => {
            for (const { field, sort } of sortModel) {
                if (a[field as keyof TaskDetail] < b[field as keyof TaskDetail]) {
                    return sort === 'asc' ? -1 : 1;
                }
                if (a[field as keyof TaskDetail] > b[field as keyof TaskDetail]) {
                    return sort === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    }

    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedTaskDetails = filteredTaskDetails.slice(start, end);

    return {
        items: paginatedTaskDetails,
        itemCount: filteredTaskDetails.length,
    };
}


export async function createOne( axiosInstance: AxiosInstance,dto: Omit<TaskDetailDto,"taskDetailId">): Promise<TaskDetail | void> {
    console.log("taskdeatil dto", dto);
    // const task = await addFutureTask(axiosInstance, dto);
    // return task;
}


export async function getOne(taskDetailId: number, axiosInstance: AxiosInstance): Promise<TaskDetail> {
    const response = await axiosInstance.get(`/toko5s/task/${taskDetailId}`);
    return response.data as TaskDetail;
}

export async function updateOne(taskDetailId: number, data: Partial<Omit<TaskDetail, 'taskDetailId'>>, axiosInstance: AxiosInstance): Promise<TaskDetail> {
    const response = await axiosInstance.put(`/toko5s/taskDetails/${taskDetailId}`, data);
    return response.data as TaskDetail;
}


export async function deleteOne(taskDetailId: number, currentListTaskDetail: TaskDetail[], axiosInstance: AxiosInstance) {
    await axiosInstance.delete(`/toko5s/taskDetails/${taskDetailId}`);
    return currentListTaskDetail.filter((taskDetail) => taskDetail.taskDetailId !== taskDetailId);
}

type ValidationResult = { issues: { message: string; path: (keyof TaskDetailDto)[] }[] };

export function validate(taskDetail: Partial<TaskDetailDto>): ValidationResult {
    let issues: ValidationResult['issues'] = [];

    if (!taskDetail.taskId) {
        console.log('here');
        issues = [...issues, { message: 'La tâche est requis', path: ['taskId'] }];
    }
    return { issues };
}
