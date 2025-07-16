import React from 'react';

function DeviceTable({
                         devices,
                         onEdit,
                         onDelete,
                         onReturn,
                         onViewHistory
                     }) {
    const getStatusColor = (status) => {
        return status === 'rented'
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    };

    const getStatusText = (status) => {
        return status === 'rented' ? '대여 중' : '대여 가능';
    };

    const getRootedBadge = (isRooted, platform) => {
        if (isRooted) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
                    ⚠️ {platform === 'iOS' ? '탈옥' : '루팅'}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-sm">
                ✅ 정상
            </span>
        );
    };

    const getPlatformIcon = (platform) => {
        return platform === 'iOS' ? (
            <div className="flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded text-white flex items-center justify-center text-xs mr-2">🍎</span>
                <span className="font-medium text-gray-700">iOS</span>
            </div>
        ) : (
            <div className="flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded text-white flex items-center justify-center text-xs mr-2">🤖</span>
                <span className="font-medium text-gray-700">Android</span>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            No.
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            제품 정보
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            플랫폼
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            OS 버전
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            루팅/탈옥
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            상태
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            대여자
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                            관리
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {devices.map((device, index) => (
                        <tr
                            key={device.id}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                                device.status === 'rented'
                                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400'
                                    : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {device.deviceNumber}
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-1">
                                        {device.productName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {device.modelName || 'N/A'}
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                {getPlatformIcon(device.platform)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {device.osVersion}
                                    </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                {getRootedBadge(device.isRootedOrJailbroken, device.platform)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(device.status)}`}>
                                        {getStatusText(device.status)}
                                    </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {device.currentRenter ? (
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                            {device.currentRenter.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900">{device.currentRenter}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic">-</span>
                                )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => onViewHistory(device)}
                                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                        title="대여 기록 보기"
                                    >
                                        📊
                                    </button>
                                    <button
                                        onClick={() => onEdit(device)}
                                        className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                        title="수정"
                                    >
                                        ✏️
                                    </button>
                                    {device.status === 'rented' ? (
                                        <button
                                            onClick={() => onReturn(device)}
                                            className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                            title="반납"
                                        >
                                            🔙
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onDelete(device)}
                                            className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                            title="삭제"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {devices.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📱</div>
                    <div className="text-xl text-gray-500 font-medium">디바이스가 없습니다</div>
                    <div className="text-sm text-gray-400 mt-2">새로운 디바이스를 추가해보세요</div>
                </div>
            )}
        </div>
    );
}

export default DeviceTable;