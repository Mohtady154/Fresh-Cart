import { useContext, useState } from "react";
import { cartContext } from "../../Context/CartContext.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loader from "../Loader/Loader.jsx";
import emptyWishList from "../../assets/images/WishList.svg";
import ProductCard from "../ProductCard/ProductCard.jsx";
export default function WishList() {
  let {
    getLoggedWishList,
    removeItemFromWishList,
    setNumOfFavoriteItems,
    setWishListDetails,
    wishListDetails,
  } = useContext(cartContext);

  const [isLoading, setIsLoading] = useState(false);

  let navigate = useNavigate();
  function getOut() {
    localStorage.removeItem("userToken");
    navigate("/");
  }

async function getWishList() {
  setIsLoading(true);
  let res = await getLoggedWishList();
  if (res?.data?.status === "success") {
    setWishListDetails(res?.data?.data);
    setNumOfFavoriteItems(res?.data?.count);
  } else {
    if (res?.response?.data?.message === "Expired Token. please login again") {
      getOut();
    }
  }
  setIsLoading(false);
}

  async function deleteItem(productId) {
    let res = await removeItemFromWishList(productId);
    if (res?.data?.status === "success") {
      setNumOfFavoriteItems(res?.data?.count);
      toast.success("Item removed Successfuly");
      getWishList();
    } else {
      res?.response?.data?.message === "Expired Token. please login again"
        ? getOut()
        : toast.error("Failed to remove item");
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>Wish List</title>
      </Helmet>
      {wishListDetails !== null && wishListDetails?.length > 0 ? (
        <div className="row bg-main-light p-3 p-md-4 my-4 position-relative">
          <h3>Wish List: </h3>
          {wishListDetails?.map((product) => (
            <ProductCard key={product.id} product={product} deleteItem={deleteItem} />
          ))}
        </div>
      ) : (
        <>
          <div className="row justify-content-center my-5">
            <div className="col-md-8">
              <img className="w-100" height={500} src={emptyWishList} alt="" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
