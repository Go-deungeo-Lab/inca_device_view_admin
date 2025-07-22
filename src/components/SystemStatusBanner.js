// src/components/SystemStatusBanner.js

import React, { useState, useEffect } from 'react';
import { systemAPI } from '../services/api';

function SystemStatusBanner({ onStatusChange }) {
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSystemStatus();

        // 30초마다 상태 확인
        const interval = setInterval(fetchSystemStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchSystemStatus = async () => {
        try {
            const response = await systemAPI.getSystemStatus();
            setSystemStatus(response.data);

            if (onStatusChange) {
                onStatusChange(response.data);
            }
        } catch (error) {
            console.error('시스템 상태 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 transition-colors">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-300">시스템 상태 확인 중...</span>
                </div>
            </div>
        );
    }

    if (!systemStatus) {
        return null;
    }

    // 정상 운영 중일 때는 배너를 표시하지 않음 (또는 간단하게만)
    if (!systemStatus.isTestMode) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6 transition-colors">
                <div className="flex items-center">
                    <span className="text-green-600 dark:text-green-400 mr-3">🟢</span>
                    <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                            시스템 정상 운영 중
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                            모든 기능이 정상적으로 작동합니다
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 테스트 모드일 때는 눈에 띄는 배너 표시
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6 transition-colors">
            <div className="flex items-start">
                <span className="text-red-600 dark:text-red-400 mr-4 text-2xl">🔴</span>
                <div className="flex-1">
                    <h4 className="font-bold text-red-800 dark:text-red-200 text-lg">
                        {systemStatus.testType ? `${systemStatus.testType} 진행 중` : '테스트 모드 활성'}
                    </h4>

                    {systemStatus.testMessage && (
                        <p className="text-red-700 dark:text-red-300 mt-2 mb-3">
                            {systemStatus.testMessage}
                        </p>
                    )}

                    <div className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        <div>• 사용자 디바이스 대여가 제한됩니다</div>
                        <div>• 이미 대여 중인 디바이스의 반납은 정상 작동합니다</div>

                        {systemStatus.testStartDate && systemStatus.testEndDate && (
                            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded-md">
                                <div className="font-medium text-red-800 dark:text-red-200 mb-1">테스트 기간:</div>
                                <div>시작: {formatDate(systemStatus.testStartDate)}</div>
                                <div>종료: {formatDate(systemStatus.testEndDate)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemStatusBanner;