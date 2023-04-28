import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetSessionQuery, baseApi } from "@utils/api";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default function Logout() {
    const {
        data: sessionInfo,
        isSuccess: sessionLoaded,
        refetch: refetchSession,
    } = useGetSessionQuery();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // TODO: Places like this might be best to stick with Axios calls but we should have a generic Axios object
    //   for global cookie management, etc.
    useEffect(() => {
        if (sessionLoaded && sessionInfo.logged_in) {
            axios
                .get("/logout/")
                .then(() => {
                    refetchSession().then(() => {
                        dispatch(baseApi.util.resetApiState());
                        navigate("/");
                    });
                })
                .catch((err) => console.log(err.detail));
        } else {
            navigate("/");
        }
    }, [
        dispatch,
        navigate,
        refetchSession,
        sessionInfo.logged_in,
        sessionLoaded,
    ]);

    return <span>Logging out...</span>;
}
