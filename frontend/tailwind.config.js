/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    ],
    theme: {
        extend: {
            fontFamily: {
                others: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    500: '#10b981',
                    600: '#059669', // Emerald 600
                    700: '#047857',
                },
                danger: {
                    500: '#f43f5e', // Rose 500
                },
                slate: {
                    850: '#1e293b', // Custom dark slate
                }
            },
            borderRadius: {
                'card': '12px',
                'btn': '4px',
            }
        },
    },
    plugins: [],
}
