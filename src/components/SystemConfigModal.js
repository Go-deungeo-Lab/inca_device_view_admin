// src/components/SystemConfigModal.js

import React, { useState, useEffect } from 'react';
import { systemAPI } from '../services/api';

function SystemConfigModal({ isOpen, onClose, onConfigUpdated }) {
    const [config, setConfig] = useState({
        isTestMode: false,
        testMessage: '',
        testStartDate: '',
        testEndDate: '',
        testType: ''
    });
    const [originalConfig, setOriginalConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchSystemConfig();
        }
    }, [isOpen]);

    const fetchSystemConfig = async () => {
        try {
            setLoading(true);
            const response = await systemAPI.getSystemConfig();
            const configData = response.data;

            // 날짜 포맷팅
            const formattedConfig = {
                isTestMode: configData.isTestMode,
                testMessage: configData.testMessage || '',
                testStartDate: configData.testStartDate
                    ? new Date(configData.testStartDate).toISOString().slice(0, 16)
                    : '',
                testEndDate: configData.testEndDate
                    ? new Date(configData.testEndDate).toISOString().slice(0, 16)
                    : '',
                testType: configData.testType || ''
            };

            setConfig(formattedConfig);
            setOriginalConfig(formattedConfig);
        } catch (error) {
            console.error('시스템 설정 조회 실패:', error);
            alert('시스템 설정을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 에러 클리어
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // 테스트 모드 활성화 시 검증
        if (config.isTestMode) {
            if (!config.testMessage.trim()) {
                newErrors.testMessage = '테스트 모드 활성화 시 안내 메시지는 필수입니다';
            }

            if (config.testStartDate && config.testEndDate) {
                const startDate = new Date(config.testStartDate);
                const endDate = new Date(config.testEndDate);

                if (startDate >= endDate) {
                    newErrors.testEndDate = '종료일은 시작일보다 늦어야 합니다';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            // API 형식에 맞게 데이터 변환
            const submitData = {
                isTestMode: config.isTestMode,
                testMessage: config.testMessage.trim() || null,
                testStartDate: config.testStartDate || null,
                testEndDate: config.testEndDate || null,
                testType: config.testType.trim() || null
            };

            const response = await systemAPI.updateSystemConfig(submitData);

            alert(response.data.message || '시스템 설정이 업데이트되었습니다.');

            if (onConfigUpdated) {
                onConfigUpdated(response.data.config);
            }

            onClose();
        } catch (error) {
            console.error('설정 저장 실패:', error);
            const errorMessage = error.response?.data?.message || '시스템 설정 저장에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleQuickToggle = async () => {
        try {
            setSaving(true);
            const response = await systemAPI.toggleTestMode();

            alert(response.data.message);

            // 현재 설정 다시 불러오기
            await fetchSystemConfig();

            if (onConfigUpdated) {
                onConfigUpdated();
            }
        } catch (error) {
            console.error('테스트 모드 토글 실패:', error);
            alert('테스트 모드 토글에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setConfig(originalConfig || {
            isTestMode: false,
            testMessage: '',
            testStartDate: '',
            testEndDate: '',
            testType: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto transition-colors">
                {/* 헤더 */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        ⚙️ 시스템 설정 관리
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8 flex items-center justify-center"
                        disabled={saving}
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <div className="text-lg text-gray-600 dark:text-gray-300">설정을 불러오는 중...</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* 현재 상태 표시 */}
                        <div className={`p-4 rounded-lg border ${
                            config.isTestMode
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className={`font-medium ${
                                        config.isTestMode
                                            ? 'text-red-800 dark:text-red-200'
                                            : 'text-green-800 dark:text-green-200'
                                    }`}>
                                        현재 상태: {config.isTestMode ? '🔴 테스트 모드 활성' : '🟢 정상 운영'}
                                    </h4>
                                    <p className={`text-sm mt-1 ${
                                        config.isTestMode
                                            ? 'text-red-600 dark:text-red-300'
                                            : 'text-green-600 dark:text-green-300'
                                    }`}>
                                        {config.isTestMode
                                            ? '사용자 디바이스 대여가 제한됩니다'
                                            : '사용자가 정상적으로 디바이스를 대여할 수 있습니다'
                                        }
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleQuickToggle}
                                    disabled={saving}
                                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                                        config.isTestMode
                                            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                                            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                                    } disabled:opacity-50`}
                                >
                                    {config.isTestMode ? '정상 운영으로 전환' : '테스트 모드로 전환'}
                                </button>
                            </div>
                        </div>

                        {/* 테스트 모드 설정 */}
                        <div>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="isTestMode"
                                    checked={config.isTestMode}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    disabled={saving}
                                />
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                    테스트 모드 활성화
                                </span>
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-8">
                                활성화하면 사용자의 디바이스 대여가 차단됩니다 (반납은 가능)
                            </p>
                        </div>

                        {/* 테스트 모드가 활성화된 경우의 추가 설정 */}
                        {config.isTestMode && (
                            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                {/* 테스트 유형 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        테스트 유형
                                    </label>
                                    <select
                                        name="testType"
                                        value={config.testType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                        disabled={saving}
                                    >
                                        <option value="">테스트 유형 선택</option>
                                        <option value="호환성 테스트">호환성 테스트</option>
                                        <option value="인수 테스트">인수 테스트</option>
                                    </select>
                                </div>

                                {/* 안내 메시지 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        사용자 안내 메시지 *
                                    </label>
                                    <textarea
                                        name="testMessage"
                                        value={config.testMessage}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="사용자에게 표시될 안내 메시지를 입력하세요. 예: 호환성 테스트로 인해 일시적으로 대여가 제한됩니다. QA팀(내선: 1234)에게 문의하세요."
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                                            errors.testMessage
                                                ? 'border-red-500 dark:border-red-400'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        disabled={saving}
                                    />
                                    {errors.testMessage && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.testMessage}</p>
                                    )}
                                </div>

                                {/* 테스트 기간 설정 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            테스트 시작일시
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="testStartDate"
                                            value={config.testStartDate}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                            disabled={saving}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            비워두면 즉시 적용
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            테스트 종료일시
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="testEndDate"
                                            value={config.testEndDate}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                                                errors.testEndDate
                                                    ? 'border-red-500 dark:border-red-400'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                            disabled={saving}
                                        />
                                        {errors.testEndDate && (
                                            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.testEndDate}</p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            비워두면 수동으로 해제할 때까지 유지
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 경고 메시지 */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                            <div className="flex">
                                <span className="text-yellow-600 dark:text-yellow-400 mr-3">⚠️</span>
                                <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                                    <strong>주의사항:</strong>
                                    <ul className="mt-2 space-y-1 list-disc list-inside">
                                        <li>테스트 모드 활성화 시 사용자의 새로운 디바이스 대여가 차단됩니다</li>
                                        <li>이미 대여 중인 디바이스의 반납은 정상적으로 가능합니다</li>
                                        <li>관리자는 테스트 모드와 관계없이 모든 기능을 사용할 수 있습니다</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {saving ? '저장 중...' : '설정 저장'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default SystemConfigModal;