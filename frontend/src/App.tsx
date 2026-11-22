import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Places } from './pages/Places'
import { PlaceDetail } from './pages/PlaceDetail'
import { Collections } from './pages/Collections'
import { CollectionDetail } from './pages/CollectionDetail'
import { RoutesPage } from './pages/RoutesPage'
import { RouteDetail } from './pages/RouteDetail'
import { Challenges } from './pages/Challenges'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/mesta" element={<Places />} />
        <Route path="/mesta/:id" element={<PlaceDetail />} />
        <Route path="/podborki" element={<Collections />} />
        <Route path="/podborki/:id" element={<CollectionDetail />} />
        <Route path="/marshruty" element={<RoutesPage />} />
        <Route path="/marshruty/:id" element={<RouteDetail />} />
        <Route path="/chellendzhi" element={<Challenges />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
