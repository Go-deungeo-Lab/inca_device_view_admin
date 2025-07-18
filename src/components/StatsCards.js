import React from 'react';

function StatsCards({ devices, stats }) {
    // devices 배열에서 직접 계산
    const totalDevices = devices?.length || 0;
    const availableDevices = devices?.filter(d => d.status === 'available').length || 0;
    const rentedDevices = devices?.filter(d => d.status === 'rented').length || 0;

    // stats 객체에서 추가 통계 (있는 경우)
    const totalRentals = stats?.totalRentals || 0;
    const activeRentals = stats?.activeRentals || 0;

    const cards = [
        {
            title: '전체 디바이스',
            value: totalDevices,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-700'
        },
        {
            title: '대여 가능',
            value: availableDevices,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-700'
        },
        {
            title: '대여 중',
            value: rentedDevices,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-700'
        },
        {
            title: '총 대여 횟수',
            value: totalRentals,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-200 dark:border-purple-700'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 text-center transition-all hover:shadow-md bg-white dark:bg-gray-800`}
                >
                    <div className={`text-2xl font-bold ${card.color} mb-1`}>
                        {card.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {card.title}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsCards;