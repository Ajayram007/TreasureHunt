import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authSuccess } from "../store/authSlice";

export const checkAuth = (Component) => {
  function Wrapper(props) {
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        setIsValidating(false);
        return;
      }

      try {
        // Decode JWT (no secret needed for reading payload)
        const payload = JSON.parse(atob(token.split(".")[1]));

        // 1. Check expiration
        const exp = payload.exp * 1000;
        if (Date.now() >= exp) {
          localStorage.clear();
          navigate("/login", { replace: true });
          setIsValidating(false);
          return;
        }

        // 2. Optional: Check role exists
        if (!payload.role) {
          localStorage.clear();
          navigate("/login", { replace: true });
          setIsValidating(false);
          return;
        }

        // 3. Restore if not already in Redux
        if (!user) {
          dispatch(authSuccess({
            user: {
              id: payload.userId || payload.sub,
              name: payload.name,
              role: payload.role,
              department: payload.department,
              phonenumber: payload.phonenumber,
              // add other fields
            },
            token,
          }));
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.clear();
        navigate("/login", { replace: true });
      } finally {
        setIsValidating(false);
      }
    }, [dispatch, navigate, user]);

    if (isValidating) {
      return <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>;
    }

    // If we reach here → token is valid
    return <Component {...props} />;
  }

  return Wrapper;
};