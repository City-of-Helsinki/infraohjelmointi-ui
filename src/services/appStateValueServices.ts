import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

export const getAllAppStateValues = async (): Promise<any> => {
    try {
        const res = await axios.get(`${REACT_APP_API_URL}/app-state-value/`);
        return res.data;
    } catch (e) {
        return Promise.reject(e);
    }
}

export const postOrPatchAppStateValue = async (request: {name: string, value: boolean, id?: string}): Promise<any> => {
    try {
        // if value already exists we modify the existing one
        if (request.id) {
            const res = await axios.patch(`${REACT_APP_API_URL}/app-state-value/${request.id}/`, request);
            return res.data;
        // post a new value if there's no existing value
        } else {
            const res = await axios.post(`${REACT_APP_API_URL}/app-state-value/`, request);
            return res.data;
        }
      } catch (e) {
        return Promise.reject(e);
      }
}
