// src/Components/FeaturedProducts/FeaturedProducts.jsx

import { useContext, useEffect, useState, useCallback } from "react";
import Loader from "../Loader/Loader.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";
import { productsContext } from "../../Context/ProductsContext.js";
import { useNavigate } from "react-router-dom";

export default function FeaturedProducts() {
  const { getAllProducts } = useContext(productsContext);
  const [products, setProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getOut = useCallback(() => {
    localStorage.removeItem("userToken");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    async function getProducts() {
      setIsLoading(true);
      try {
        const res = await getAllProducts("limit=18");
        if (res?.data?.results > 0) {
          setProducts(res?.data?.data);
        } else {
          if (
            res?.response?.data?.message ===
            "Expired Token. please login again"
          ) {
            getOut();
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    getProducts();
  }, [getAllProducts, getOut]);

  if (isLoading) {
    // loader العام للصفحة
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <Loader />
      </div>
    );
  }

  return (
    <div className="row">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
