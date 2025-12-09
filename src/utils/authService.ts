import axios from 'axios';

const API_BASE_URL = process.env.VITE_BACKEND_SERVER || 'http://localhost:8080';

export interface LoginCredentials {
    usernameOrEmail: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
}

export interface TokenRefreshResponse {
    access_token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signin`, credentials);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
        throw error;
    }
};


export const refreshAccessToken = async (): Promise<string> => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/refresh_token`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const { access_token } = response.data;
        //localStorage.setItem('token', access_token);
        return access_token;
    } catch (error: unknown) {
        //localStorage.removeItem('token');
        if (axios.isAxiosError(error)){
            throw new Error(error.response?.data?.message || 'Token refresh failed');
        }
        throw error;
    }
};



export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.valid;
    } catch (error) {
        console.log(error);
        return false;
    }
};



// export const logout = async (): Promise<void> => {
//     const token = localStorage.getItem('token');

//     try {
//         await axios.post(`${API_BASE_URL}/auth/logout`, {
//             refresh_token,
//         }, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//     } catch (error) {
//         console.warn('Logout API call failed, clearing local storage anyway');
//     } finally {
//         localStorage.removeItem('token');
//     }
// };



// export const getCurrentUser = async (token: string): Promise<any> => {
//     try {
//         const response = await axios.get(`${API_BASE_URL}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         return response.data;
//     } catch (error: any) {
//         throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
//     }
// };




export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        console.log(error);
        return true;
    }
};




export const getTokenExpiration = (token: string): Date | null => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return new Date(payload.exp * 1000);
    } catch (error) {
        console.log(error);
        return null;
    }
};



export const getUserFromToken = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            //id: payload.sub || payload.id,
            email: payload.email,
            name: payload.name,
            //roles: payload.roles || [],
            // Add other claims as needed
        };
    } catch (error) {
        console.log(error);
        return null;
    }
};



// export const hasRole = (token: string, requiredRole: string): boolean => {
//     const user = getUserFromToken(token);
//     return user?.roles?.includes(requiredRole) || false;
// };



// export const hasAnyRole = (token: string, requiredRoles: string[]): boolean => {
//     const user = getUserFromToken(token);
//     return requiredRoles.some(role => user?.roles?.includes(role)) || false;
// };