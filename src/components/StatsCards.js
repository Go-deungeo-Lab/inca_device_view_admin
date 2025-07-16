import React from 'react';

function StatsCards({ devices }) {
    const totalDevices = devices.length;
    const availableDevices = devices.filter(d => d.status === 'available').length;
    const rentedDevices = devices.filter(d => d.status === 'rented').length;

    const cards = [
        {
            title: '전체 디바이스',
            value: totalDevices,
            color: 'text-blue-600'
        },
        {
            title: '대여 가능',
            value: availableDevices,
            color: 'text-green-600'
        },
        {
            title: '대여 중',
            value: rentedDevices,
            color: 'text-red-600'
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className={`text-2xl font-bold ${card.color} mb-1`}>
                        {card.value}
                    </div>
                    <div className="text-sm text-gray-600">
                        {card.title}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsCards;