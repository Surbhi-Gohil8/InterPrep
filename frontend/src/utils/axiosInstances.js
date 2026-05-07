import axios from 'axios';
import  {BASE_URL} from "./apiPaths"
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 120000, // 2 minutes timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }, 
});
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
//response interceptor to handle global errors
axiosInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        // You can handle specific status codes here
        if (error.response.status === 401) {
            window.location.href = '/'; // Redirect to login on 401 Unauthorized
        }else if (error.response.status === 429) {
            console.error("API rate limit exceeded")
            error.userMessage = "AI service rate limit exceeded. Please try again later.";
        }else if (error.response.status === 500) {
            console.error("Server error")
        }
    }else if(error.code === 'ECONNABORTED'){
        error.userMessage = "Request timed out. The server may be starting up (cold start). Please try again in a few seconds.";
        console.error("Request timeout. Please try again.")
        console.log(error);
    }else{
        error.userMessage = "Network error: unable to reach the server. Please check the API URL and your internet connection.";
    }
    return Promise.reject(error);
});

export default axiosInstance;