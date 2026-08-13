import { HashRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { PilihMobil } from './pages/PilihMobil'
import { Inspeksi } from './pages/Inspeksi'
import { Hasil } from './pages/Hasil'
import { Laporan } from './pages/Laporan'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pilih-mobil" element={<PilihMobil />} />
        <Route path="/inspeksi/:id" element={<Inspeksi />} />
        <Route path="/hasil/:id" element={<Hasil />} />
        <Route path="/laporan/:data" element={<Laporan />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
