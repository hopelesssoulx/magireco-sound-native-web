import axios from 'axios'


axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8"
const baseURL = 'http://127.0.0.1:16167'


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
