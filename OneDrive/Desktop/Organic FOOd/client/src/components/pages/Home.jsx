import React from "react";
import Hero from "../molecules/Hero";
import Categories from "../molecules/Categories";
import FeaturedProduct from "../molecules/FeaturedProduct";
import Banner from "../molecules/Banner";

const Home = (props) => {
  return (
    <>
      <Hero />

      <Categories />

      <FeaturedProduct />

      <Banner />
          

          <div className="mb-3">

          </div>
    </>
  );
};

export default Home;
