import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home.tsx';
import NextTenDay from "./pages/NextTenDay/NextTenDay.tsx";
import Header from './components/Header/Header.tsx';
import Footer from './components/Footer/Footer.tsx';

export default function App() {
    return (
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/weather-next-ten-day" element={<NextTenDay />} />
                </Routes>
            </main>
            <Footer />
        </Router>
    );
}