import axios from 'axios'

/** Base axios instance — all requests go through /api which Vite proxies to port 5000 */
export const api = axios.create({ baseURL: '/api' })
