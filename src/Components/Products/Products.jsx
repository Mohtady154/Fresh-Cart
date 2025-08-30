import { useContext, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import Loader from "../Loader/Loader.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";
import { useNavigate } from "react-router-dom";
import { productsContext } from "../../Context/ProductsContext.js";
import ResponsivePagination from "react-responsive-pagination";
import noProductsImg from "../../assets/images/NoProducts.svg";

export default function Products() {
  const { getAllProducts, categories } = useContext(productsContext);
  const navigate = useNavigate();

  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOption, setFilterOption] = useState("&sort=");
  const [categoryOption, setCategoryOption] = useState("all");

  // Sort options
  const sortOptions = useMemo(
    () => ({
      "&sort=": "Select option",
      "&sort=price": "Lowest Price",
      "&sort=-price": "Highest Price",
      "&sort=ratingsAverage": "Lowest Rating",
      "&sort=-ratingsAverage": "Highest Rating",
      "&sort=-sold": "Best Seller",
    }),
    []
  );

  // Category options mapping
  const categoryOptions = useMemo(
    () => ({
      all: "All",
      ...categories?.reduce((acc, category) => {
        acc[`&category[in]=${category._id}`] = category.name;
        return acc;
      }, {}),
    }),
    [categories]
  );

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  // Fetch products with React Query 
  const { data, isLoading } = useQuery({
    queryKey: ["products", currentPage, filterOption, categoryOption],
    queryFn: () =>
      getAllProducts(
        `page=${currentPage}&limit=24${filterOption}${
          categoryOption === "all" ? "" : categoryOption
        }`
      ),
    keepPreviousData: true,
    onError: (err) => {
      if (err?.response?.data?.message === "Expired Token. please login again") {
        handleLogout();
      }
    },
  });

  const products = data?.data?.data || [];
  const totalPages = data?.data?.metadata?.numberOfPages || 1;

  // Handlers
  const handlePageChange = (page) => setCurrentPage(page);

  const handleSortChange = (e) => {
    setFilterOption(e.target.value);
    setCurrentPage(1); // reset page on filter change
  };

  const handleCategoryChange = (e) => {
    setCategoryOption(e.target.value);
    setCurrentPage(1); // reset page on filter change
  };

  const resetAllFilters = () => {
    setFilterOption("&sort=");
    setCategoryOption("all");
    setCurrentPage(1);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Products</title>
      </Helmet>

      <div className="row py-5">
        {/* Filters Header */}
        <div className="row d-flex align-items-center mb-3">
          <h2 className="col-md-4 fw-semibold">
            <span className="cursor-pointer" onClick={resetAllFilters}>
              All Products
            </span>
          </h2>

          <div className="col-md-8">
            <div className="row">
              {/* Category Select */}
              <div className="col-md-6 d-flex align-items-center mb-2">
                <h5 className="my-0 mx-2">Category</h5>
                <select
                  className="form-control"
                  value={categoryOption}
                  onChange={handleCategoryChange}
                >
                  {Object.entries(categoryOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div className="col-md-6 d-flex align-items-center mb-2">
                <h5 className="my-0 mx-2">Sort by</h5>
                <select
                  className="form-control"
                  value={filterOption}
                  onChange={handleSortChange}
                >
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="d-flex justify-content-center pt-5 pb-2">
            <img className="w-50" src={noProductsImg} alt="No Products" />
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <ResponsivePagination
            total={totalPages}
            current={currentPage}
            onPageChange={handlePageChange}
            extraClassName="justify-content-center"
          />
        )}
      </div>
    </>
  );
}
