import React, { useEffect, useState } from 'react';
import { deviceAPI, rentalAPI } from '../services/api';
import StatsCards from '../components/StatsCards';
import DeviceTable from '../components/DeviceTable';
import DeviceModal from '../components/DeviceModal';
import ReturnModal from '../components/ReturnModal';

function ManagerApp() {
    const [devices, setDevices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 모달 상태
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    // 필터 상태
    const [filter, setFilter] = useState('all'); // 'all', 'available', 'rented'
    const [platformFilter, setPlatformFilter] = useState('all'); // 'all', 'Android', 'iOS'

    useEffect(() => {
        fetchData();
    }, []);

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
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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

    // 대여 기록 보기 (추후 구현)
    const handleViewHistory = (device) => {
        alert(`${device.productName}의 대여 기록 (구현 예정)`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                ⚙️ 디바이스 관리 시스템
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                관리자 전용 - 디바이스 관리 및 대여 현황
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
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
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 통계 카드 */}
                <StatsCards stats={stats} devices={devices} />

                {/* 필터 - 간단하게 수정 */}
                <div className="bg-white rounded-lg border p-4 mb-8">
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">상태:</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">전체</option>
                                <option value="available">대여 가능</option>
                                <option value="rented">대여 중</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">플랫폼:</label>
                            <select
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">전체</option>
                                <option value="Android">Android</option>
                                <option value="iOS">iOS</option>
                            </select>
                        </div>

                        <div className="ml-auto">
                            <span className="text-sm text-gray-600">
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
                    onViewHistory={handleViewHistory}
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
            </main>
        </div>
    );
}

export default ManagerApp;