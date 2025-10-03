import axios from 'axios';
import  {BASE_URL} from "./apiPaths"
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 50000, // 30 seconds timeout
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
        }else if (error.response.status === 500) {
            console.error("Server error")
        }
    }else if(error.code === 'ECONNABORTED'){
        console.error("Request timeout. Please try again.")
        console.log(error);
    }
    return Promise.reject(error);
});

export default axiosInstance;