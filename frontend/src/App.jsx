// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect tự động chạy khi component load lần đầu
    useEffect(() => {
        // Hàm lấy danh sách tỉnh
        const fetchProvinces = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/provinces');
                if (!response.ok) {
                    throw new Error('Lỗi mạng');
                }
                const data = await response.json();
                setProvinces(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []); // [] nghĩa là chỉ chạy 1 lần

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>LingoVoyage - Khám phá Việt Nam</h1>
            
            <h2>Danh sách tỉnh thành</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {provinces.map((province) => (
                    <div 
                        key={province._id}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center'
                        }}
                    >
                        <h3>{province.name}</h3>
                        <p>Mã: {province.code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;