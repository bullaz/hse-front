import type { AxiosInstance } from "axios";
import type { Question } from "../data/Toko5";
import type { Task, TaskDto } from "../data/task";
import type { TaskDetail, TaskDetailDto } from "../data/TaskDetail";


//maybe better pattern for the axiosinstance use, create a service class with axiosInstance field,


// change this, the questions that can vary depending on task are maybe the epi only
export async function getAllQuestionsWithPicto(axiosInstance: AxiosInstance): Promise<Question[]>{
    const response = await axiosInstance.get("/toko5s/questions_with_picto");
    return response.data as Question[];
}


export async function addNewTask(axiosInstance: AxiosInstance, taskDto: TaskDto): Promise<Task>{
    const response = await axiosInstance.post("/toko5s/tasks",taskDto);
    return response.data as Task;
}


//SUIVI DES TACHES

export async function addFutureTask(axiosInstance: AxiosInstance, dto: TaskDetailDto): Promise<TaskDetail>{
    const response = await axiosInstance.post("/toko5s/tasks",dto);
    return response.data as TaskDetail;   
}


export async function getListTaskDetail(axiosInstance: AxiosInstance, date: string): Promise<TaskDetail[]>{
    const response = await axiosInstance.get("/toko5s/tasks",{params: {date: date}});
    return response.data as TaskDetail[];
} 