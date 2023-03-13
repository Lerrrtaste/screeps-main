import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = "https://screeps.com/api";
axios.defaults.headers.common['X-Token'] = "ab153a6a-e386-45fe-8e38-2ae70a26fc9e";

interface IFetchUserResponse {
    ok: number,
    username: string,
}

// get the axios.get('endpoint') return value
export async function getMe(): Promise<AxiosResponse> {
    return await axios.get<IFetchUserResponse>('/auth/me');
}
