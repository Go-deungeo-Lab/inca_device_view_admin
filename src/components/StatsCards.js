import React from 'react';

function StatsCards({ stats, devices }) {
    const totalDevices = devices.length;
    const availableDevices = devices.filter(d => d.status === 'available').length;
    const rentedDevices = devices.filter(d => d.status === 'rented').length;
    const androidDevices = devices.filter(d => d.platform === 'Android').length;
    const iosDevices = devices.filter(d => d.platform === 'iOS').length;
    const rootedDevices = devices.filter(d => d.isRootedOrJailbroken).length;

    const cards = [
        {
            title: '전체 디바이스',
            value: totalDevices,
            icon: '📱',
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
            textColor: 'text-blue-700',
            iconBg: 'bg-blue-500'
        },
        {
            title: '대여 가능',
            value: availableDevices,
            icon: '✅',
            gradient: 'from-green-500 to-green-600',
            bg: 'bg-gradient-to-br from-green-50 to-green-100',
            textColor: 'text-green-700',
            iconBg: 'bg-green-500'
        },
        {
            title: '대여 중',
            value: rentedDevices,
            icon: '🔴',
            gradient: 'from-red-500 to-red-600',
            bg: 'bg-gradient-to-br from-red-50 to-red-100',
            textColor: 'text-red-700',
            iconBg: 'bg-red-500'
        },
        {
            title: 'Android',
            value: androidDevices,
            icon: '🤖',
            gradient: 'from-emerald-500 to-emerald-600',
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
            textColor: 'text-emerald-700',
            iconBg: 'bg-emerald-500'
        },
        {
            title: 'iOS',
            value: iosDevices,
            icon: '🍎',
            gradient: 'from-gray-500 to-gray-600',
            bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
            textColor: 'text-gray-700',
            iconBg: 'bg-gray-500'
        },
        {
            title: '루팅/탈옥',
            value: rootedDevices,
            icon: '⚠️',
            gradient: 'from-amber-500 to-amber-600',
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
            textColor: 'text-amber-700',
            iconBg: 'bg-amber-500'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bg} rounded-xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden`}
                >
                    {/* 배경 장식 */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

                    <div className="relative z-10">
                        {/* 아이콘과 제목 */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center text-white text-xl shadow-md`}>
                                {card.icon}
                            </div>
                        </div>

                        {/* 값 */}
                        <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
                            {card.value}
                        </div>

                        {/* 제목 */}
                        <div className="text-sm font-medium text-gray-600 mb-3">
                            {card.title}
                        </div>

                        {/* 진행률 바 */}
                        {totalDevices > 0 && (
                            <div>
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                    <span>전체 대비</span>
                                    <span className="font-semibold">
                                        {((card.value / totalDevices) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`bg-gradient-to-r ${card.gradient} h-2 rounded-full transition-all duration-500 ease-out shadow-sm`}
                                        style={{
                                            width: `${(card.value / totalDevices) * 100}%`,
                                            transform: `translateX(-${100 - (card.value / totalDevices) * 100}%)`,
                                            animation: 'slideIn 1s ease-out forwards'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsCards;