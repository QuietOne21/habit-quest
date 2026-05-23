import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL;

const client = axios.create({
    baseURL: `${API_BASE}/api`,
    headers: { 'content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('hq_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('hq_token');
            localStorage.removeItem('hq_user');
            window.local.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (email, password) => 
    client.post('/auth/login', { email, password });

export const register = (username, email, password) => 
    client.post('/auth/register', { username, email, password });

// Habits
export const getHabits = () => 
    client.get('/habits');

export const createHabit = (data) =>
    client.post('/habits', data);

export const updateHabit = (id, data) =>
    client.put(`/habits/${id}`, data);

export const deleteHabit = (id) => 
    client.delete(`/habits/${id}`);

export const toggleEntry = (habitId, date, completed) => 
    client.post('/habits/toggle', {habitId, date, completed });

export const getMonthEntries = (year, month) =>
    client.get(`/habits/entries/${year}/${month}`);

export const resetMonth = (year, month) =>
    client.delete(`/habits/entries/${year}/${month}`);

// Stats
export const getDashboard = (year, month) => 
    client.get(`/stats/dashboard/${year}/${month}`);

export default client;