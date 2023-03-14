import axios, { AxiosError, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = "https://screeps.com/api";

export interface IFetchUserResponse {
    ok: number,
    username: string,
}

// get the axios.get('endpoint') return value
export async function getMe(): Promise<AxiosResponse<IFetchUserResponse>> {
    /* return await axios.get<IFetchUserResponse>('auth/me'); */
    return await toast.promise(
        axios.get<IFetchUserResponse>('auth/me'),
        {
            loading: 'Loading',
            success: 'User loaded succesfully',
            error: (error) => (error as AxiosError).message
    });
}

export function setTokenHeader(token: string): void {
    axios.defaults.headers.common['X-Token'] = token;
}

