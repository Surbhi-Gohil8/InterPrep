import React,{createContext,useState,useEffect} from "react";
import axiosInstance from "../utils/axiosInstances";
import { API_PATHS } from "../utils/apiPaths";
export const UserContext = createContext();
const UserProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    useEffect(()=>{
        if(user ) return;
        const accessToken = localStorage.getItem('token');
        if(!accessToken){
            setLoading(false);
            return;
        }
        const fetchUser = async()=>{
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data?.user || null);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                clearUser()
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const updateUser = async (userData) => {
        // Accept token string or object with token
        const token = typeof userData === 'string' ? userData : userData?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
            setUser(response.data?.user || null);
        } catch (error) {
            console.error("Failed to refresh user profile:", error);
            clearUser();
        } finally {
            setLoading(false);
        }
    };


    const clearUser = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return(
        <UserContext.Provider value={{user,loading,updateUser,clearUser}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider;