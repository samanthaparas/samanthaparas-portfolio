import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import About from './pages/About';
import BehindTheBuild from './pages/BehindTheBuild';
import CanYouSpotIt from './pages/CanYouSpotIt';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Nugget from './pages/Nugget';
import QuestKeeper from './pages/QuestKeeper';
import Services from './pages/Services';
import Work from './pages/Work';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work" element={<Work />} />
        <Route path="work/questkeeper" element={<QuestKeeper />} />
        <Route path="work/can-you-spot-it" element={<CanYouSpotIt />} />
        <Route path="work/nugget-hackathon" element={<Nugget />} />
        <Route path="behind-the-build" element={<BehindTheBuild />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
