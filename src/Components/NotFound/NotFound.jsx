import { Helmet } from "react-helmet-async";
import notFoundImg from "../../assets/images/freshcart-logo.svg";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Not Found</title>
      </Helmet>
      <div className="row justify-content-center my-5">
        <div className="col-11 col-md-10 col-lg-8">
          <img className="w-100" height={500} src={notFoundImg} alt="" />
        </div>
      </div>
    </>
  );
}
