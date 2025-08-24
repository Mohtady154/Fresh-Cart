import { useContext, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Slider from "react-slick";
import { cartContext } from "../../Context/CartContext.js";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import Loader from "../Loader/Loader.jsx";
import { productsContext } from "../../Context/ProductsContext.js";
import NotFound from "../NotFound/NotFound.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function ProductDetails() {
  const { getProductDeatails } = useContext(productsContext);
  const {
    addToCart,
    getLoggedWishList,
    addToWishList,
    removeItemFromWishList,
    setNumOfFavoriteItems,
    setNumOfCartItems,
    wishListDetails,
    setWishListDetails,
  } = useContext(cartContext);

  const params = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  // Fetch product details
  const { data: productData, isLoading } = useQuery({
    queryKey: ["productDetails", params.id],
    queryFn: () => getProductDeatails(params.id),
    onError: (err) => {
      if (
        err?.response?.data?.message === "Expired Token. please login again"
      ) {
        handleLogout();
      }
    },
  });
  const productDetails = productData?.data?.data || null;

  // Fetch wishlist info
  const fetchWishListInfo = async () => {
    try {
      const res = await getLoggedWishList();
      if (res?.data?.status === "success") {
        setNumOfFavoriteItems(res.data.count);
        setWishListDetails(res.data.data);
      } else {
        handleLogout();
      }
    } catch {
      setNumOfFavoriteItems(0);
    }
  };

  // Check if product is favorite
  const isFavorite = useMemo(
    () => wishListDetails?.some((item) => item._id === params.id),
    [wishListDetails, params.id]
  );

  // Cart mutation
  const cartMutation = useMutation({
    mutationFn: (productId) => addToCart(productId),
    onSuccess: (res) => {
      if (res?.data?.status === "success") {
        toast.success(res.data.message);
        setNumOfCartItems(res.data.numOfCartItems); // <-- Add this line
      }
    },
    onError: (err) => {
      if (
        err?.response?.data?.message === "Expired Token. please login again"
      ) {
        handleLogout();
      } else {
        toast.error("Failed to add product");
      }
    },
  });

  // Wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: (productId) =>
      isFavorite ? removeItemFromWishList(productId) : addToWishList(productId),
    onSuccess: async () => {
      toast.success(isFavorite ? "Item removed" : "Item added");
      await fetchWishListInfo(); // refresh wishlist
    },
    onError: (err) => {
      if (
        err?.response?.data?.message === "Expired Token. please login again"
      ) {
        handleLogout();
      } else {
        toast.error("Failed to update wishlist");
      }
    },
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  if (isLoading) return <Loader />;
  if (!productDetails) return <NotFound />;

  return (
    <>
      <Helmet>
        <title>{productDetails?.title || "Product Details"}</title>
      </Helmet>

      <div className="row justify-content-center align-items-center py-5">
        <div className="col-md-4 mb-5">
          <Slider {...settings}>
            {productDetails?.images?.map((img, index) => (
              <img key={index} className="w-100" src={img} alt="" />
            ))}
          </Slider>
        </div>

        <div className="col-md-8">
          <h3>{productDetails.title}</h3>
          <p className="text-muted p-2">{productDetails.description}</p>

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted fs-4">{productDetails.price} EGP</span>
            <span className="d-flex align-items-center">
              <i className="fas fa-star rating-color fs-4 pe-2"></i>
              {productDetails.ratingsAverage}
            </span>
          </div>

          <div className="row mt-3 px-3">
            <button
              onClick={() => cartMutation.mutate(productDetails._id)}
              className="col-10 col-md-11 btn bg-main text-white px-0 position-relative"
            >
              <i className="fa-solid fa-cart-plus fa-xl ms-3 position-absolute start-0 top-50 bottom-50"></i>
              Add to Cart
            </button>

            <div className="col-2 col-md-1 d-flex justify-content-center px-0">
              <button
                onClick={() => wishlistMutation.mutate(productDetails._id)}
                className="btn text-white w-100 p-0"
              >
                <i
                  className="fa-solid fa-heart fa-2xl heart"
                  style={{ color: isFavorite ? "#dc3545" : "#bdbdbd" }}
                ></i>
              </button>
            </div>
          </div>

          <div className="text-muted mt-4">
            <h6 className="mb-3">
              Category:
              <Link
                className="ps-2"
                to={`/categories/${productDetails.category?._id}`}
              >
                {productDetails.category?.name || "N/A"}
              </Link>
            </h6>
            <h6 className="mb-3">
              Brand:
              <Link
                className="ps-2"
                to={`/brands/${productDetails.brand?._id}`}
              >
                {productDetails.brand?.name || "N/A"}
              </Link>
            </h6>
          </div>
        </div>
      </div>
    </>
  );
}
