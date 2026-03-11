import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QuickScan from './pages/QuickScan';
import CustomScan from './pages/CustomScan';
import Results from './pages/Results';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quick-scan" element={<QuickScan />} />
                <Route path="/custom-scan" element={<CustomScan />} />
                <Route path="/results" element={<Results />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
