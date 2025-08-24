import { useContext, useState } from "react";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { authenticationContext } from "../../Context/AuthenticationContext.js";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { resetPasswordApi, email } = useContext(authenticationContext);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleResetPassword(values) {
    setIsLoading(true);
    try {
      let res = await resetPasswordApi(values);
      if (res?.data?.token) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        toast.error(
          res?.response?.data?.message || "Failed Operation"
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
    setIsLoading(false);
  }

  const validationSchema = Yup.object({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    newPassword: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Password must have special characters, capital letters, small letters, numbers, and min 8 characters"
      ),
  });

  const formik = useFormik({
    initialValues: {
      email: email ?? "",
      newPassword: "",
    },
    onSubmit: handleResetPassword,
    validationSchema,
  });

  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <div className="w-75 mx-auto py-5 my-5">
        <h3 className="mb-4">Reset Password</h3>

        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            className="form-control mb-2"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.email}
            type="text"
            name="email"
            id="email"
          />
          {formik.errors.email && formik.touched.email && (
            <div className="alert alert-danger">{formik.errors.email}</div>
          )}

          <label htmlFor="newPassword">New Password</label>
          <input
            className="form-control mb-2"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.newPassword}
            type="password"
            name="newPassword"
            id="newPassword"
          />
          {formik.errors.newPassword && formik.touched.newPassword && (
            <div className="alert alert-danger">{formik.errors.newPassword}</div>
          )}

          {isLoading ? (
            <button className="btn bg-main text-white mt-1" disabled>
              <i className="fas fa-spinner fa-spin"></i>
            </button>
          ) : (
            <button
              disabled={!(formik.isValid && formik.dirty)}
              type="submit"
              className="btn bg-main text-white mt-1"
            >
              Confirm
            </button>
          )}
        </form>
      </div>
    </>
  );
}
