import React, { useState, useEffect } from 'react';

function DeviceModal({
                         isOpen,
                         onClose,
                         onSave,
                         device = null, // null이면 추가, 값이 있으면 수정
                         isLoading = false
                     }) {
    const [formData, setFormData] = useState({
        deviceNumber: '',
        productName: '',
        modelName: '',
        osVersion: '',
        isRootedOrJailbroken: false,
        platform: 'Android'
    });

    const [errors, setErrors] = useState({});

    // 수정 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (device) {
            setFormData({
                deviceNumber: device.deviceNumber || '',
                productName: device.productName || '',
                modelName: device.modelName || '',
                osVersion: device.osVersion || '',
                isRootedOrJailbroken: device.isRootedOrJailbroken || false,
                platform: device.platform || 'Android'
            });
        } else {
            // 추가 모드일 때 초기화
            setFormData({
                deviceNumber: '',
                productName: '',
                modelName: '',
                osVersion: '',
                isRootedOrJailbroken: false,
                platform: 'Android'
            });
        }
        setErrors({});
    }, [device, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
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

        if (!formData.deviceNumber.trim()) {
            newErrors.deviceNumber = '디바이스 번호는 필수입니다';
        }

        if (!formData.productName.trim()) {
            newErrors.productName = '제품명은 필수입니다';
        }

        if (!formData.osVersion.trim()) {
            newErrors.osVersion = 'OS 버전은 필수입니다';
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
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('저장 실패:', error);
            // 에러 처리는 부모 컴포넌트에서
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">
                        {device ? '디바이스 수정' : '디바이스 추가'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 디바이스 번호 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            디바이스 번호 *
                        </label>
                        <input
                            type="text"
                            name="deviceNumber"
                            value={formData.deviceNumber}
                            onChange={handleChange}
                            placeholder="예: 8, I-2"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.deviceNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.deviceNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.deviceNumber}</p>
                        )}
                    </div>

                    {/* 제품명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            제품명 *
                        </label>
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            placeholder="예: Galaxy Note 9, iPhone XR"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.productName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.productName && (
                            <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                        )}
                    </div>

                    {/* 플랫폼 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            플랫폼 *
                        </label>
                        <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            <option value="Android">🤖 Android</option>
                            <option value="iOS">🍎 iOS</option>
                        </select>
                    </div>

                    {/* 모델명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            모델명
                        </label>
                        <input
                            type="text"
                            name="modelName"
                            value={formData.modelName}
                            onChange={handleChange}
                            placeholder="예: SM-N960N, A2105"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>

                    {/* OS 버전 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            OS 버전 *
                        </label>
                        <input
                            type="text"
                            name="osVersion"
                            value={formData.osVersion}
                            onChange={handleChange}
                            placeholder="예: 10.0, 14.6.0"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.osVersion ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.osVersion && (
                            <p className="text-red-500 text-xs mt-1">{errors.osVersion}</p>
                        )}
                    </div>

                    {/* 루팅/탈옥 여부 */}
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isRootedOrJailbroken"
                                checked={formData.isRootedOrJailbroken}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {formData.platform === 'iOS' ? '탈옥' : '루팅'} 상태
                            </span>
                        </label>
                    </div>

                    {/* 버튼 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '저장 중...' : (device ? '수정' : '추가')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DeviceModal;