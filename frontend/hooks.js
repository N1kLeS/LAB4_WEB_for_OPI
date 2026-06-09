function useViewportMode() {
  const dispatch = useDispatch();
  useEffect(() => {
    const decide = () => {
      const w = window.innerWidth;
      const mode = w >= 1160 ? "desktop" : w >= 844 ? "tablet" : "mobile";
      dispatch(actions.modeSet(mode));
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, [dispatch]);
}

function useSessionBootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    apiFetch("/api/auth/me", {method: "GET"})
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.username) {
          dispatch(actions.authSuccess(data.username));
          loadResults(dispatch);
        }
      })
      .catch(() => {});
  }, [dispatch]);
}


