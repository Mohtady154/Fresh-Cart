import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartContext } from "../../Context/CartContext.js";
import toast from "react-hot-toast";

export default function ProductCard({ product, showSubcategory }) {
  let {
    addToCart,
    setNumOfCartItems,
    addToWishList,
    removeItemFromWishList,
    setNumOfFavoriteItems,
    wishListDetails,
    getLoggedWishList,
    setWishListDetails,
  } = useContext(cartContext);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingId, setLoadingId] = useState(null); // ✅ تحميل زرار Add to Cart
  const [wishLoadingId, setWishLoadingId] = useState(null); // ✅ تحميل زرار Heart

  let navigate = useNavigate();
  function getOut() {
    localStorage.removeItem("userToken");
    navigate("/");
  }

  async function addProductToCart(productId) {
    setLoadingId(productId);
    let res = await addToCart(productId);
    if (res?.data?.status === "success") {
      setNumOfCartItems(res?.data?.numOfCartItems);
      toast.success(res?.data?.message, {
        duration: 2000,
        position: "top-center",
      });
    } else {
      res?.response?.data?.message === "Expired Token. please login again"
        ? getOut()
        : toast.error("Failed to add Product", { duration: 2000 });
    }
    setLoadingId(null);
  }

  const checkFavorite = useCallback(() => {
    wishListDetails?.forEach((element) => {
      if (element?._id === product._id) {
        setIsFavorite(true);
      }
    });
  }, [wishListDetails, product._id]);

  async function deleteProductFromWishList(productId) {
    setWishLoadingId(productId);
    let res = await removeItemFromWishList(productId);
    if (res?.data?.status === "success") {
      setIsFavorite(false);
      toast.success("Item removed Successfuly");
      await getWishListInfo();
    } else {
      res?.response?.data?.message === "Expired Token. please login again"
        ? getOut()
        : toast.error("Failed to remove item");
    }
    setWishLoadingId(null);
  }

  async function addProductToWishList(productId) {
    setWishLoadingId(productId);
    let res = await addToWishList(productId);
    if (res?.data?.status === "success") {
      setIsFavorite(true);
      toast.success(res?.data?.message);
      await getWishListInfo();
    } else {
      res?.response?.data?.message === "Expired Token. please login again"
        ? getOut()
        : toast.error("Failed to add item");
    }
    setWishLoadingId(null);
  }

  async function getWishListInfo() {
    let res = await getLoggedWishList();
    if (res?.data?.status === "success") {
      setNumOfFavoriteItems(res?.data?.count);
      setWishListDetails(res?.data?.data);
    } else {
      res?.response?.data?.message === "Expired Token. please login again" ||
      res?.request?.statusText === "Unauthorized"
        ? getOut()
        : setNumOfFavoriteItems(0);
    }
  }

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  return (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2 my-3">
      <div className="product cursor-pointer px-2 pt-2 pb-3">
        <Link to={`/productdetails/${product._id}`}>
          <img className="w-100" src={product.imageCover} alt="" />
        </Link>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <div className="text-main fw-bold font-sm">
              {showSubcategory
                ? product.subcategory[0]?.name
                : product.category.name}
            </div>
            <h3 className="h6 fw-bolder">
              {product.title.split(" ").slice(0, 2).join(" ")}
            </h3>
          </div>

          <span
            className="d-flex align-items-center justify-content-center"
            style={{ width: "24px", height: "24px" }}
          >
            {wishLoadingId === product._id ? (
              <span
                className="spinner-grow spinner-grow-sm text-danger"
                role="status"
              
              ></span>
            ) : (
              <i
                className="fa-solid fa-heart fa-lg heart cursor-pointer"
                style={{ color: isFavorite ? "#dc3545" : "#bdbdbd" }}
                onClick={() => {
                  isFavorite
                    ? deleteProductFromWishList(product._id)
                    : addProductToWishList(product._id);
                }}
              ></i>
            )}
          </span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">{product.price} EGP</span>
          <span>
            <i className="fas fa-star rating-color me-1"></i>
            {product.ratingsAverage}
          </span>
        </div>

        <button
          onClick={() => addProductToCart(product.id)}
          className="btn bg-main text-white w-100 px-0"
          disabled={loadingId === product.id}
        >
          {loadingId === product.id ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <>
              <i className="fa-solid fa-cart-plus fa-lg pe-2"></i>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
