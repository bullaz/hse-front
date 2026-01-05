import type { AxiosInstance } from "axios";
import type { Question } from "../data/Toko5";
import type { Task, TaskDto } from "../data/task";

export async function getAllQuestionsWithPicto(axiosInstance: AxiosInstance): Promise<Question[]>{
    const response = await axiosInstance.get("/toko5s/questions_with_picto");
    return response.data as Question[];
}


export async function addNewTask(axiosInstance: AxiosInstance, taskDto: TaskDto): Promise<Task>{
    const response = await axiosInstance.post("/toko5s/tasks",taskDto);
    return response.data as Task;
}