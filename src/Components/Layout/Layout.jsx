import { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "./../Footer/Footer";
import { Outlet, useNavigate } from "react-router-dom";
import bgPattern from "../../assets/images/light-patten.svg";
import toast from "react-hot-toast";
import { cartContext } from "../../Context/CartContext.js";
import { productsContext } from "../../Context/ProductsContext.js";
import Loader from "../Loader/Loader.jsx";

export default function Layout({ userData, setUserData, saveUserDate }) {
  const {
    getLoggedUserCart,
    setNumOfCartItems,
    setCartId,
    getLoggedWishList,
    setNumOfFavoriteItems,
    setWishListDetails,
  } = useContext(cartContext);

  const { getAllCategories, setCategories } = useContext(productsContext);

  const navigate = useNavigate();

  const [cartIsLoading, setCartIsLoading] = useState(false);
  const [wishListtIsLoading, setWishListtIsLoading] = useState(false);
  const [categoriesIsLoading, setCategoriesIsLoading] = useState(false);

  function logOut(msg) {
    localStorage.removeItem("userToken");
    setUserData(null);
    toast(msg, { duration: 1000 });
    navigate("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("userToken");

    if (token) {
      if (userData === null) {
        saveUserDate();
      }
    } else {
      if (userData !== null) {
        logOut("Expired Token. please login again");
      }
    }
  }, [userData]);

  useEffect(() => {
    if (localStorage.getItem("userToken") !== null && userData !== null) {
      getCartInfo();
      getWishListInfo();
      getCategories();
    }
  }, [userData]);

  async function getCartInfo() {
    setCartIsLoading(true);
    let res = await getLoggedUserCart();
    if (res?.data?.status === "success") {
      setNumOfCartItems(res?.data?.numOfCartItems);
      setCartId(res?.data?.data?._id);
    } else {
      if (
        res?.response?.data?.message === "Expired Token. please login again" ||
        res?.request?.statusText === "Unauthorized"
      ) {
        logOut("Expired Token. please login again");
      } else {
        setNumOfCartItems(0);
        setCartId(null);
      }
    }
    setCartIsLoading(false);
  }

  async function getWishListInfo() {
    setWishListtIsLoading(true);
    let res = await getLoggedWishList();
    if (res?.data?.status === "success") {
      setNumOfFavoriteItems(res?.data?.count);
      setWishListDetails(res?.data?.data);
    } else {
      res?.response?.data?.message === "Expired Token. please login again" ||
      res?.request?.statusText === "Unauthorized"
        ? logOut("Expired Token. please login again")
        : setNumOfFavoriteItems(0);
    }
    setWishListtIsLoading(false);
  }

  async function getCategories() {
    setCategoriesIsLoading(true);
    let res = await getAllCategories();
    if (res?.data?.results > 0) {
      setCategories(res?.data?.data);
    } else {
      if (
        res?.response?.data?.message === "Expired Token. please login again" ||
        res?.request?.statusText === "Unauthorized"
      ) {
        logOut("Expired Token. please login again");
      }
    }
    setCategoriesIsLoading(false);
  }

  return (
    <div
      className="pt-5 bg-pattern-img"
      style={{ backgroundImage: `url(${bgPattern})` }}
    >
      <Navbar userData={userData} logOut={logOut} />
      <div className="container">
        {!(
          cartIsLoading === false &&
          wishListtIsLoading === false &&
          categoriesIsLoading === false
        ) ? (
          <Loader />
        ) : (
          <Outlet />
        )}
      </div>
      <Footer />
    </div>
  );
}
