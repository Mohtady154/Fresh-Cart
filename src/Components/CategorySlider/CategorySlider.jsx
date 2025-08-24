import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import Loader from "../Loader/Loader.jsx";
import { productsContext } from "../../Context/ProductsContext.js";

export default function CategorySlider() {
  let { getAllCategories, categories, setCategories } =
    useContext(productsContext);

  const [isLoading, setIsLoading] = useState(false);

  let navigate = useNavigate();
  const getOut = useCallback(() => {
    localStorage.removeItem("userToken");
    navigate("/");
  }, [navigate]);

  const getCategories = useCallback(async () => {
    setIsLoading(true);
    let res = await getAllCategories();
    if (res?.data?.results > 0) {
      setCategories(res?.data?.data);
    } else {
      if (res?.response?.data?.message === "Expired Token. please login again")
        getOut();
    }
    setIsLoading(false);
  }, [getAllCategories, setCategories, getOut]);

  useEffect(() => {
    if (categories === null) {
      getCategories();
    }
  }, [categories, getCategories]);

  const settings = {
    dots: true,
    infinity: true,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 5,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Slider {...settings}>
        {categories?.map((category) => (
          <Link
            key={category._id}
            to={`categories/${category._id}`}
            className="category-slider"
          >
            <img
              height={200}
              className="w-100 category-img-slide"
              src={category.image}
              alt=""
            />
            <h2 className="h6 pt-2 text-center">{category.name}</h2>
          </Link>
        ))}
      </Slider>
    </>
  );
}
