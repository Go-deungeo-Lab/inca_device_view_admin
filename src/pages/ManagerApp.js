import React, { useEffect, useState } from 'react';
import { deviceAPI, rentalAPI, authAPI, systemAPI } from '../services/api'; // 🆕 systemAPI 추가
import { useDarkMode } from '../contexts/DarkModeContext';
import StatsCards from '../components/StatsCards';
import DeviceTable from '../components/DeviceTable';
import DeviceModal from '../components/DeviceModal';
import ReturnModal from '../components/ReturnModal';
import AdminRentalHistoryModal from '../components/AdminRentalHistoryModal';
import SystemConfigModal from '../components/SystemConfigModal'; // 🆕 추가
import SystemStatusBanner from '../components/SystemStatusBanner'; // 🆕 추가

function ManagerApp() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [devices, setDevices] = useState([]);
    const [stats, setStats] = useState(null);
    const [systemStatus, setSystemStatus] = useState(null); // 🆕 시스템 상태
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // 모달 상태
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSystemConfigModal, setShowSystemConfigModal] = useState(false); // 🆕 시스템 설정 모달
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // 필터 상태
    const [filter, setFilter] = useState('all'); // 'all', 'available', 'rented'
    const [platformFilter, setPlatformFilter] = useState('all'); // 'all', 'Android', 'iOS'

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            fetchSystemStatus(); // 🆕 시스템 상태 조회
        }
    }, [isAuthenticated]);

    // 🆕 시스템 상태 조회
    const fetchSystemStatus = async () => {
        try {
            const response = await systemAPI.getSystemStatus();
            setSystemStatus(response.data);
        } catch (error) {
            console.error('시스템 상태 조회 실패:', error);
        }
    };

    // 인증 확인
    const checkAuthentication = () => {
        const token = localStorage.getItem('managerToken');
        if (token) {
            // 토큰 검증
            authAPI.verifyToken(token)
                .then(() => {
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem('managerToken');
                    localStorage.removeItem('manager');
                    setIsAuthenticated(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    };

    // 로그인 처리
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const response = await authAPI.login(loginForm);

            // 토큰 저장
            localStorage.setItem('managerToken', response.data.access_token);
            localStorage.setItem('manager', JSON.stringify(response.data.user));

            setIsAuthenticated(true);
            setLoginForm({ username: '', password: '' });
        } catch (error) {
            console.error('로그인 실패:', error);
            setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    // 로그아웃 처리
    const handleLogout = () => {
        localStorage.removeItem('managerToken');
        localStorage.removeItem('manager');
        setIsAuthenticated(false);
        setDevices([]);
        setStats(null);
        setSystemStatus(null); // 🆕 시스템 상태 초기화
    };

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [devicesResponse, statsResponse] = await Promise.all([
                deviceAPI.getAllDevices(),
                rentalAPI.getRentalStats()
            ]);

            setDevices(devicesResponse.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('데이터 조회 실패:', error);
            if (error.response?.status === 401) {
                // 인증 오류 시 로그아웃
                handleLogout();
            } else {
                alert('데이터를 불러오는데 실패했습니다.');
            }
        } finally {
            setRefreshing(false);
        }
    };

    // 🆕 전체 데이터 새로고침 (시스템 상태 포함)
    const handleRefreshAll = async () => {
        await Promise.all([
            fetchData(),
            fetchSystemStatus()
        ]);
    };

    // 🆕 시스템 설정 업데이트 후 콜백
    const handleSystemConfigUpdated = () => {
        fetchSystemStatus(); // 시스템 상태 다시 조회
    };

    // 🆕 시스템 상태 변경 시 콜백
    const handleSystemStatusChange = (status) => {
        setSystemStatus(status);
    };

    // 필터링된 디바이스 목록
    const filteredDevices = devices.filter(device => {
        const statusMatch = filter === 'all' || device.status === filter;
        const platformMatch = platformFilter === 'all' || device.platform === platformFilter;
        return statusMatch && platformMatch;
    });

    // 디바이스 추가
    const handleAddDevice = () => {
        setSelectedDevice(null);
        setShowDeviceModal(true);
    };

    // 디바이스 수정
    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setShowDeviceModal(true);
    };

    // 디바이스 삭제
    const handleDeleteDevice = async (device) => {
        if (device.status === 'rented') {
            alert('대여 중인 디바이스는 삭제할 수 없습니다.');
            return;
        }

        if (!window.confirm(`${device.deviceNumber} - ${device.productName}을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deviceAPI.deleteDevice(device.id);
            alert('디바이스가 삭제되었습니다.');
            fetchData();
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('디바이스 삭제에 실패했습니다.');
        }
    };

    // 디바이스 반납
    const handleReturnDevice = (device) => {
        setSelectedDevice(device);
        setShowReturnModal(true);
    };

    // 디바이스 저장 (추가/수정)
    const handleSaveDevice = async (deviceData) => {
        setModalLoading(true);
        try {
            if (selectedDevice) {
                // 수정
                await deviceAPI.updateDevice(selectedDevice.id, deviceData);
                alert('디바이스가 수정되었습니다.');
            } else {
                // 추가
                await deviceAPI.createDevice(deviceData);
                alert('디바이스가 추가되었습니다.');
            }
            fetchData();
        } catch (error) {
            console.error('저장 실패:', error);
            const errorMessage = error.response?.data?.message || '디바이스 저장에 실패했습니다.';
            alert(errorMessage);
            throw error; // 모달에서 로딩 상태 유지
        } finally {
            setModalLoading(false);
        }
    };

    // 반납 처리
    const handleReturn = async (deviceId, renterName, password) => {
        setModalLoading(true);
        try {
            await deviceAPI.returnDevice(deviceId, renterName, password);
            alert('디바이스가 성공적으로 반납되었습니다.');
            fetchData();
        } catch (error) {
            setModalLoading(false);
            throw error; // 에러를 다시 던져서 모달에서 처리하도록
        } finally {
            setModalLoading(false);
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600 dark:text-gray-300">시스템을 로딩하는 중...</div>
                </div>
            </div>
        );
    }

    // 로그인 폼
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors">
                    {/* 다크모드 토글 버튼 */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ 관리자 로그인</h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">디바이스 관리 시스템</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {loginError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                아이디
                            </label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                placeholder="관리자 아이디"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                placeholder="관리자 비밀번호"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            로그인
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 관리자 대시보드
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* 헤더 */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                ⚙️ 디바이스 관리 시스템
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                관리자 전용 - 디바이스 관리 및 대여 현황
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            {/* 다크모드 토글 */}
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>

                            {/* 🆕 시스템 설정 버튼 */}
                            <button
                                onClick={() => setShowSystemConfigModal(true)}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                    systemStatus?.isTestMode
                                        ? 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600'
                                        : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                                }`}
                            >
                                <span className="mr-2">
                                    {systemStatus?.isTestMode ? '🔴' : '⚙️'}
                                </span>
                                {systemStatus?.isTestMode ? '테스트 모드' : '시스템 설정'}
                            </button>

                            {/* 대여 이력 버튼 */}
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                            >
                                📊 대여 이력
                            </button>

                            <button
                                onClick={handleRefreshAll} // 🆕 전체 새로고침
                                disabled={refreshing}
                                className="flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                                <span className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}>
                                    🔄
                                </span>
                                {refreshing ? '새로고침 중...' : '새로고침'}
                            </button>

                            <button
                                onClick={handleAddDevice}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span className="mr-2 text-lg">➕</span>
                                디바이스 추가
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-500 transition-colors"
                            >
                                🚪 로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 🆕 시스템 상태 배너 */}
                <SystemStatusBanner
                    onStatusChange={handleSystemStatusChange}
                />

                {/* 통계 카드 */}
                <StatsCards stats={stats} devices={devices} />

                {/* 필터 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-8 transition-colors">
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">상태:</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                            >
                                <option value="all">전체</option>
                                <option value="available">대여 가능</option>
                                <option value="rented">대여 중</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">플랫폼:</label>
                            <select
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                            >
                                <option value="all">전체</option>
                                <option value="Android">Android</option>
                                <option value="iOS">iOS</option>
                            </select>
                        </div>

                        <div className="ml-auto">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {filteredDevices.length}개 디바이스 표시
                            </span>
                        </div>
                    </div>
                </div>

                {/* 디바이스 테이블 */}
                <DeviceTable
                    devices={filteredDevices}
                    onEdit={handleEditDevice}
                    onDelete={handleDeleteDevice}
                    onReturn={handleReturnDevice}
                />

                {/* 디바이스 추가/수정 모달 */}
                <DeviceModal
                    isOpen={showDeviceModal}
                    onClose={() => setShowDeviceModal(false)}
                    onSave={handleSaveDevice}
                    device={selectedDevice}
                    isLoading={modalLoading}
                />

                {/* 반납 모달 */}
                <ReturnModal
                    isOpen={showReturnModal}
                    onClose={() => setShowReturnModal(false)}
                    device={selectedDevice}
                    onReturn={handleReturn}
                    isLoading={modalLoading}
                />

                {/* 대여 이력 모달 */}
                <AdminRentalHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                />

                {/* 🆕 시스템 설정 모달 */}
                <SystemConfigModal
                    isOpen={showSystemConfigModal}
                    onClose={() => setShowSystemConfigModal(false)}
                    onConfigUpdated={handleSystemConfigUpdated}
                />
            </main>
        </div>
    );
}

export default ManagerApp;