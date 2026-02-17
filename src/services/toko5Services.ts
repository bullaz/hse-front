import type { AxiosInstance } from "axios";
import type { Question } from "../data/Toko5";
import type { Task, TaskDto } from "../data/task";
import type { TaskDetail, TaskDetailDto } from "../data/TaskDetail";
import type { Location } from "../data/Location";
import { question_categories } from "../constants";


//Maybe better pattern for the axiosinstance use, create a service class with axiosInstance field,


//Change this, the questions that can vary depending on task are maybe the epi only
// export async function getAllQuestionsWithPicto(axiosInstance: AxiosInstance): Promise<Question[]>{
//     const response = await axiosInstance.get("/toko5s/questions_with_picto");
//     return response.data as Question[];
// }

export async function getAllEpi(axiosInstance: AxiosInstance): Promise<Question[]>{
    const response = await axiosInstance.get("/toko5s/questions",{params:{category: question_categories.epi}})
    return response.data as Question[];    
}


export async function addNewTask(axiosInstance: AxiosInstance, taskDto: TaskDto): Promise<Task>{
    const response = await axiosInstance.post("/toko5s/tasks",taskDto);
    return response.data as Task;
}


//SUIVI DES TACHES

export async function addFutureTask(axiosInstance: AxiosInstance, dto: Omit<TaskDetailDto,"taskDetailId">): Promise<TaskDetail>{ 
    const response = await axiosInstance.post("/toko5s/tasks_tracking",dto);
    return response.data as TaskDetail;   
}


export async function getListTaskDetail(axiosInstance: AxiosInstance, date: string): Promise<TaskDetail[]>{
    const response = await axiosInstance.get("/toko5s/tasks",{params: {date: date}});
    return response.data as TaskDetail[];
} 


export async function getListLocation(axiosInstance: AxiosInstance): Promise<Location[]>{
    const response = await axiosInstance.get("/locations");
    return response.data as Location[];
}

export async function getListTask(axiosInstance: AxiosInstance): Promise<Task[]> {
    const response = await axiosInstance.get("/toko5s/tasks");
    console.log(response.data);
    return response.data as Task[];
}