import axios from "axios";


export const  axiosInstance  = axios.create({
        baseURL : "http://localhost:4000",
        withCredentials : true
        // baseURL : "https://www.something.com"
    })
