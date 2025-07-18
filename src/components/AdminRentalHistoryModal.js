// src/components/AdminRentalHistoryModal.js

import React, { useState, useEffect } from 'react';
import { rentalAPI } from '../services/api';

function AdminRentalHistoryModal({ isOpen, onClose }) {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'returned'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchRentals();
        }
    }, [isOpen, filter]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            let response;

            switch (filter) {
                case 'active':
                    response = await rentalAPI.getActiveRentals();
                    break;
                case 'returned':
                    response = await rentalAPI.getReturnedRentals();
                    break;
                default:
                    response = await rentalAPI.getAllRentals();
            }

            setRentals(response.data);
        } catch (error) {
            console.error('이력 조회 실패:', error);
            alert('대여 이력을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (rentedAt, returnedAt) => {
        if (!returnedAt) return '대여 중';

        const start = new Date(rentedAt);
        const end = new Date(returnedAt);
        const diffMs = end - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays}일 ${diffHours}시간`;
        } else if (diffHours > 0) {
            return `${diffHours}시간 ${diffMinutes}분`;
        } else {
            return `${diffMinutes}분`;
        }
    };

    // 검색 필터링
    const filteredRentals = rentals.filter(rental => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            rental.renterName.toLowerCase().includes(searchLower) ||
            rental.device?.deviceNumber.toLowerCase().includes(searchLower) ||
            rental.device?.productName.toLowerCase().includes(searchLower)
        );
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 touch-manipulation">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col transition-colors">
                {/* 헤더 */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        📊 디바이스 대여 이력
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 flex items-center justify-center touch-manipulation"
                    >
                        ✕
                    </button>
                </div>

                {/* 필터 및 검색 */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* 필터 버튼들 */}
                        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                                    filter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    filter === 'active'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                대여 중
                            </button>
                            <button
                                onClick={() => setFilter('returned')}
                                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                                    filter === 'returned'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                반납 완료
                            </button>
                        </div>

                        {/* 검색 */}
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="이름, 디바이스 번호, 제품명 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* 새로고침 버튼 */}
                        <button
                            onClick={fetchRentals}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                        >
                            🔄 새로고침
                        </button>
                    </div>

                    {/* 결과 개수 */}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                        총 {filteredRentals.length}개의 기록
                    </div>
                </div>

                {/* 이력 테이블 */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <div className="text-lg text-gray-600 dark:text-gray-300">이력을 불러오는 중...</div>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    대여자
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    디바이스
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    대여 시간
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    반납 시간
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    사용 기간
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    상태
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {filteredRentals.map((rental) => (
                                <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {rental.renterName}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            <div className="font-medium">
                                                {rental.device?.deviceNumber} - {rental.device?.productName}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {rental.device?.platform === 'iOS' ? '🍎 iOS' : '🤖 Android'} {rental.device?.osVersion}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {formatDate(rental.rentedAt)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {formatDate(rental.returnedAt)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {calculateDuration(rental.rentedAt, rental.returnedAt)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            rental.status === 'active'
                                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        }`}>
                                            {rental.status === 'active' ? '대여 중' : '반납 완료'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && filteredRentals.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📋</div>
                            <div className="text-gray-500 dark:text-gray-400 text-lg">
                                {searchTerm ? '검색 결과가 없습니다.' : '대여 이력이 없습니다.'}
                            </div>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminRentalHistoryModal;