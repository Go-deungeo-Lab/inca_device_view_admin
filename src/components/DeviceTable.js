import React from 'react';

function DeviceTable({ devices, onEdit, onDelete, onReturn }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">No.</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">제품명</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">플랫폼</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">OS</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">대여자</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">관리</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                    <tr key={device.id} className={device.status === 'rented' ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {device.deviceNumber}
                        </td>

                        <td className="px-6 py-4">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {device.productName}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {device.modelName}
                                </div>
                                {device.isRootedOrJailbroken && (
                                    <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                                            ⚠️ {device.platform === 'iOS' ? '탈옥' : '루팅'}
                                        </span>
                                )}
                            </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                            {device.platform === 'iOS' ? '🍎 iOS' : '🤖 Android'}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                            {device.osVersion}
                        </td>

                        <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    device.status === 'rented'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {device.status === 'rented' ? '대여 중' : '대여 가능'}
                                </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-900">
                            {device.currentRenter || '-'}
                        </td>

                        <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEdit(device)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    수정
                                </button>
                                {device.status === 'rented' ? (
                                    <button
                                        onClick={() => onReturn(device)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        반납
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onDelete(device)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {devices.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📱</div>
                    <div className="text-gray-500">디바이스가 없습니다</div>
                </div>
            )}
        </div>
    );
}

export default DeviceTable;