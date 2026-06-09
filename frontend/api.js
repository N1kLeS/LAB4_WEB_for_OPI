const apiFetch = (url, options = {}) => {

  const normalized = url.startsWith("http")
    ? url
    : url.startsWith("/") ? url : `/${url}`;
  
  return fetch(normalized, {
    credentials: "include",
    headers: {"Content-Type": "application/json", ...(options.headers || {})},
    ...options
  });
};

const normalizeResult = (item) => ({
  ...item,
  time: item.time || item.checkTime || item.timestamp,
});

const loadResults = (dispatch) => {
  apiFetch("/api/results")
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => dispatch(actions.resultsSet((data || []).map(normalizeResult))))
    .catch(() => dispatch(actions.resultsSet([])));
};


