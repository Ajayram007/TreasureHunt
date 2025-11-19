import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authSuccess } from "../store/authSlice";

export const checkAuth = (Component) => {
  function Wrapper(props) {
    const user = useSelector((store) => store.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("token"); // ✅ Get token from localStorage

    useEffect(() => {
      if (!token) {
        console.log("No token found. Redirecting to login...");
        navigate("/login");
      } else if (!user) {
        dispatch(authSuccess({ token })); // ✅ Restore token in Redux if missing
      }
    }, [token, user, navigate, dispatch]);

    return <Component {...props} />;
  }
  return Wrapper;
};

