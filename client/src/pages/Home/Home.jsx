import "./Home.css";
import Hero from "../../components/Home/Hero/Hero";
import Categories from "../../components/Home/Categories/Categories";
import FeaturedProducts from "../../components/Home/FeaturedProducts/FeaturedProducts";
import OfferBanner from "../../components/Home/offerBanner/OfferBanner";
import Newsletter from "../../components/Home/Newsletter/Newsletter";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <OfferBanner />
      <Newsletter />
    </>
  );
};

export default Home;