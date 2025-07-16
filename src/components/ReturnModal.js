import React, { useState } from 'react';

function ReturnModal({
                         isOpen,
                         onClose,
                         device,
                         onReturn,
                         isLoading = false
                     }) {
    const [renterName, setRenterName] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!renterName.trim()) {
            newErrors.renterName = '대여자 이름을 입력해주세요';
        }

        if (!password.trim()) {
            newErrors.password = 'QA 비밀번호를 입력해주세요';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            await onReturn(device.id, renterName.trim(), password);
            // 성공 시 폼 초기화
            setRenterName('');
            setPassword('');
            setErrors({});
            onClose();
        } catch (error) {
            console.error('반납 실패:', error);

            // API 에러 메시지 표시
            const errorMessage = error.response?.data?.message || '반납에 실패했습니다';

            if (errorMessage.includes('password') || errorMessage.includes('비밀번호')) {
                setErrors({ password: '올바르지 않은 QA 비밀번호입니다' });
            } else if (errorMessage.includes('renter') || errorMessage.includes('대여자')) {
                setErrors({ renterName: '대여자 이름이 일치하지 않습니다' });
            } else {
                setErrors({ general: errorMessage });
            }
        }
    };

    const handleClose = () => {
        setRenterName('');
        setPassword('');
        setErrors({});
        onClose();
    };

    if (!isOpen || !device) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-red-600">
                        🔙 디바이스 반납
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                {/* 디바이스 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">반납할 디바이스</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                        <div><strong>No.:</strong> {device.deviceNumber}</div>
                        <div><strong>제품명:</strong> {device.productName}</div>
                        <div><strong>현재 대여자:</strong> {device.currentRenter}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 일반 에러 메시지 */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* 대여자 이름 확인 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            대여자 이름 확인 *
                        </label>
                        <input
                            type="text"
                            value={renterName}
                            onChange={(e) => {
                                setRenterName(e.target.value);
                                if (errors.renterName) {
                                    setErrors(prev => ({ ...prev, renterName: '' }));
                                }
                            }}
                            placeholder="대여자 이름을 입력하세요"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.renterName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                            autoFocus
                        />
                        {errors.renterName && (
                            <p className="text-red-500 text-xs mt-1">{errors.renterName}</p>
                        )}
                    </div>

                    {/* QA 비밀번호 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            QA 비밀번호 *
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            placeholder="QA 팀 전용 비밀번호"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            QA 팀만 접근 가능한 비밀번호입니다
                        </p>
                    </div>

                    {/* 경고 메시지 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex items-start">
                            <span className="text-yellow-600 mr-2">⚠️</span>
                            <div className="text-yellow-800 text-sm">
                                <strong>주의:</strong> 반납 처리 후에는 되돌릴 수 없습니다.
                                대여자 이름과 비밀번호를 정확히 확인해주세요.
                            </div>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '반납 처리 중...' : '반납 처리'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReturnModal;