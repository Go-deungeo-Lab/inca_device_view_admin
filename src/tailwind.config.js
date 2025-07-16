/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'admin-primary': '#1e40af',
                'admin-secondary': '#64748b',
                'device-available': '#10b981',
                'device-rented': '#ef4444',
                'device-rooted': '#f59e0b',
            }
        },
    },
    plugins: [],
}