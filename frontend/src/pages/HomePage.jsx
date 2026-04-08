import HeroSection from '../components/home/HeroSection';
import ProvinceList from '../components/home/ProvinceList';
import FeatureSection from '../components/home/FeatureSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ProvinceList />
      <FeatureSection />
    </div>
  );
}
