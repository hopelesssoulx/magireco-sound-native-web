import axios from 'axios'
import * as config from './config'


axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8"
const baseURL = config.baseUrl;


export const request = axios.create({
    baseURL: baseURL
})


request.interceptors.request.use((config) => {
    return config
})

request.interceptors.response.use(
    (res) => {
        return res
    },
    (err) => {
        console.log(err);
    }
)
