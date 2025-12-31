import type { AxiosInstance } from "axios";
import type { Question } from "../data/Toko5";

export async function getAllQuestions(axiosInstance: AxiosInstance): Promise<Question[]>{
    const response = await axiosInstance.get("/toko5s/questions");
    return response.data as Question[];
}