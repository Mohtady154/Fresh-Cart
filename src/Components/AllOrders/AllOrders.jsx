import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartContext } from "../../Context/CartContext.js";
import jwtDecode from "jwt-decode";
import Loader from "../Loader/Loader.jsx";
import { Helmet } from "react-helmet-async";
import noOrders from "../../assets/images/Empty-Orders.svg";
import { useQuery } from "@tanstack/react-query";

export default function AllOrders() {
  let { getLoggedUserOrders, getLoggedUserCart, setNumOfCartItems, setCartId } =
    useContext(cartContext);

  let navigate = useNavigate();

  const getOut = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  const userId = jwtDecode(localStorage.getItem("userToken"))?.id;

  // Query: Get Cart Info
  useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await getLoggedUserCart();
      if (res?.data?.status === "success") {
        setNumOfCartItems(res?.data?.numOfCartItems);
        setCartId(res?.data?.data?._id);
        return res?.data;
      } else {
        if (
          res?.response?.data?.message === "Expired Token. please login again" ||
          res?.request?.statusText === "Unauthorized"
        ) {
          getOut();
        } else {
          setNumOfCartItems(0);
          setCartId(null);
        }
        return null;
      }
    },
  });

  // Query: Get Orders
  const {
    data: ordersList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      const res = await getLoggedUserOrders(userId);
      if (res?.data?.length > 0) {
        return res?.data;
      } else {
        if (res?.response?.data?.message === "Expired Token. please login again") {
          getOut();
        }
        return [];
      }
    },
    enabled: !!userId, 
  });

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-danger">Something went wrong!</p>;

  return (
    <>
      <Helmet>
        <title>Orders</title>
      </Helmet>

      <div className="pt-4 pb-5">
        {ordersList?.length > 0 ? (
          <>
            <h1>All Orders</h1>
            <div className="accordion" id="accordionExample">
              {ordersList
                ?.slice() 
                .reverse()
                .map((order) => (
                  <div key={order?._id} className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${order?._id}`}
                        aria-expanded="true"
                        aria-controls={order?._id}
                      >
                        <div className="row w-100 position-relative">
                          <div className="col-7 col-md-4 col-lg-3 d-flex row justify-content-center">
                            <span>ORDER PLACED</span>
                            <span>{order?.updatedAt?.slice(0, 10)}</span>
                          </div>
                          <div className="col-5 col-md-4 col-lg-3 d-flex row justify-content-center">
                            <span>TOTAL</span>
                            <span>EGP {order?.totalOrderPrice}</span>
                          </div>
                          <div
                            className="position-absolute end-0 me-3 drop-down-order"
                            style={{ width: "fit-content" }}
                          >
                            ORDER # {order._id}
                          </div>
                        </div>
                      </button>
                    </h2>

                    <div
                      id={order?._id}
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        <div className="d-flex row">
                          <div className="h6 col-md-6">
                            <h4>Order Details: </h4>
                            {order?.user?.name}
                            <br />
                            {order?.shippingAddress?.phone}
                            <br />
                            {order?.shippingAddress?.details},{" "}
                            {order?.shippingAddress?.city}
                          </div>

                          <div className="h5 col-md-6 row justify-content-end">
                            <span
                              className="badge bg-main text-white m-2"
                              style={{
                                height: "fit-content",
                                width: "fit-content",
                              }}
                            >
                              {order?.paymentMethodType === "card"
                                ? "Card"
                                : "Cash"}
                            </span>
                            <span
                              className="badge bg-main text-white m-2"
                              style={{
                                height: "fit-content",
                                width: "fit-content",
                              }}
                            >
                              {order?.isPaid ? "Paid" : "Not Paid"}
                            </span>
                            <span
                              className="badge bg-main text-white m-2"
                              style={{
                                height: "fit-content",
                                width: "fit-content",
                              }}
                            >
                              {order?.isDelivered ? "Delivered" : "In Way"}
                            </span>
                          </div>
                        </div>

                        <h4 className="mt-3">
                          Products :{" "}
                          <span className="h6 ms-4">
                            No. {order?.cartItems?.length}
                          </span>
                        </h4>
                        <div className="row">
                          {order?.cartItems?.map((item, index) => (
                            <div key={index} className="col-md-6 col-lg-4 mt-4 ">
                              <div className="border-bottom row pb-1 mx-1">
                                <div className="col-5 col-md-4 col-lg-3">
                                  <img
                                    className="w-100"
                                    src={item?.product?.imageCover}
                                    alt=""
                                  />
                                </div>
                                <div className="col-7 col-md-8 col-lg-9">
                                  <Link
                                    className="d-block fw-normal product-order-name"
                                    to={`/productdetails/${item?.product?._id}`}
                                  >
                                    {item?.product?.title
                                      ?.split(" ")
                                      .slice(0, 3)
                                      .join(" ")}
                                  </Link>
                                  <span>
                                    {item?.count} x EGP {item?.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="row justify-content-center my-5">
            <div className="col-md-8">
              <img className="w-100" height={500} src={noOrders} alt="" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
