import axios from 'axios';

// API 기본 URL - 환경변수에서 가져오기
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 기본 axios 인스턴스 (공개 API용)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 관리자용 axios 인스턴스 (JWT 토큰 포함)
const adminApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 관리자용 요청 인터셉터 - JWT 토큰 자동 첨부
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('managerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 공통 응답 인터셉터 - IP 차단 및 인증 오류 처리
const responseInterceptor = (response) => response;
const errorInterceptor = (error) => {
    if (error.response?.status === 403) {
        // IP 차단된 경우
        window.location.href = '/access-denied';
        return Promise.reject(new Error('Access denied from this IP address'));
    }

    if (error.response?.status === 401) {
        // 관리자 인증 오류 - 토큰 제거 및 로그인 페이지로
        localStorage.removeItem('managerToken');
        localStorage.removeItem('manager');
        window.location.reload();
        return Promise.reject(new Error('Authentication failed'));
    }

    return Promise.reject(error);
};

// 인터셉터 적용
api.interceptors.response.use(responseInterceptor, errorInterceptor);
adminApi.interceptors.response.use(responseInterceptor, errorInterceptor);

// 🔒 관리자용 디바이스 API (JWT 토큰 필요)
export const deviceAPI = {
    // ✅ 모든 디바이스 조회 (관리자용 - 상세 정보 포함)
    getAllDevices: () => adminApi.get('/devices/admin/all'),

    // 대여 가능한 디바이스 조회 (공개 API 사용)
    getAvailableDevices: () => api.get('/devices/available'),

    // 대여 중인 디바이스 조회 (관리자용)
    getRentedDevices: () => adminApi.get('/devices/admin/rented'),

    // 특정 디바이스 조회 (공개 API 사용)
    getDevice: (id) => api.get(`/devices/${id}`),

    // ✅ 디바이스 생성 (관리자용)
    createDevice: (deviceData) => adminApi.post('/devices/admin/create', deviceData),

    // ✅ 디바이스 수정 (관리자용)
    updateDevice: (id, deviceData) => adminApi.patch(`/devices/admin/${id}`, deviceData),

    // ✅ 디바이스 삭제 (관리자용)
    deleteDevice: (id) => adminApi.delete(`/devices/admin/${id}`),

    // 디바이스 대여 (공개 API 사용)
    rentDevices: (rentData) => api.post('/devices/rent', rentData),

    // ✅ 관리자용 디바이스 반납 (JWT + QA 비밀번호 필요)
    returnDevice: (id, renterName, password) =>
        adminApi.post(`/devices/admin/return/${id}`, { renterName, password }),
};

// 🔓 대여 관련 API (공개 - 이력 조회는 누구나 가능)
export const rentalAPI = {
    // ✅ 모든 대여 기록 조회 (공개)
    getAllRentals: () => api.get('/rentals'),

    // ✅ 활성 대여 기록 조회 (공개)
    getActiveRentals: () => api.get('/rentals/active'),

    // ✅ 반납된 대여 기록 조회 (공개)
    getReturnedRentals: () => api.get('/rentals/returned'),

    // ✅ 대여 통계 조회 (공개)
    getRentalStats: () => api.get('/rentals/stats'),

    // ✅ 플랫폼별 대여 통계 (공개)
    getRentalStatsByPlatform: () => api.get('/rentals/stats/platform'),

    // ✅ 특정 사용자의 대여 기록 (공개)
    getRentalsByUser: (renterName) => api.get(`/rentals/renter/${renterName}`),

    // ✅ 특정 디바이스의 대여 기록 (공개)
    getRentalsByDevice: (deviceId) => api.get(`/rentals/device/${deviceId}`),

    // 🔒 대여 기록 삭제 (관리자 전용)
    deleteRental: (id) => adminApi.delete(`/rentals/${id}`),
};

// 🔒 인증 관련 API
export const authAPI = {
    // 관리자 로그인
    login: (loginData) => api.post('/auth/login', loginData),

    // 토큰 검증
    verifyToken: (token) => api.post('/auth/verify', { token }),
};

export default api;