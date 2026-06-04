import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Discover Amazing Products
        </h1>
        <p>
          Shop from thousands of products from trusted sellers.
        </p>
        <button>
          Shop Now
        </button>
      </div>
      <div className="hero-image">
        <img 
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30" 
          alt="hero" 
        />
      </div>
    </section>
  );
};

export default Hero;