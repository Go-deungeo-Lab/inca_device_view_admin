// src/contexts/DarkModeContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 로컬스토리지에서 다크모드 설정 불러오기
        const savedMode = localStorage.getItem('adminDarkMode');
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }

        // 시스템 설정 확인
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // 다크모드 설정을 로컬스토리지에 저장
        localStorage.setItem('adminDarkMode', JSON.stringify(isDarkMode));

        // HTML 요소에 dark 클래스 추가/제거
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};