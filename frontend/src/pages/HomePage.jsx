import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import ProvinceList from '../components/home/ProvinceList';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ProvinceList />
      <FeatureSection />
    </div>
  );
}
