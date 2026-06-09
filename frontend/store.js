const {useEffect, useRef, useState} = React;
const {Provider, useDispatch, useSelector} = ReactRedux;

const initialState = {
  auth: {user: null, loading: false, error: null},
  results: {items: [], loading: false},
  form: {x: null, y: "", r: 2},
  ui: {mode: "desktop"}
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "authStart":
      return {
        ...state,
        auth: {...state.auth, loading: true, error: null}
      };
    case "authSuccess":
      return {
        ...state,
        auth: {user: action.payload, loading: false, error: null}
      };
    case "authError":
      return {
        ...state,
        auth: {user: null, loading: false, error: action.payload}
      };
    case "logout":
      return {
        ...state,
        auth: {user: null, loading: false, error: null},
        results: {items: [], loading: false}
      };
    case "resultsSet":
      return {
        ...state,
        results: {items: action.payload, loading: false}
      };
    case "resultAdd":
      return {
        ...state,
        results: {items: [action.payload, ...state.results.items], loading: false}
      };
    case "formSet":
      return {
        ...state,
        form: {...state.form, ...action.payload}
      };
    case "modeSet":
      return {
        ...state,
        ui: {...state.ui, mode: action.payload}
      };
    default:
      return state;
  }
}

const actions = {
  authStart: () => ({type: "authStart"}),
  authSuccess: (username) => ({type: "authSuccess", payload: username}),
  authError: (message) => ({type: "authError", payload: message}),
  logout: () => ({type: "logout"}),
  resultsSet: (items) => ({type: "resultsSet", payload: items}),
  resultAdd: (item) => ({type: "resultAdd", payload: item}),
  formSet: (payload) => ({type: "formSet", payload}),
  modeSet: (mode) => ({type: "modeSet", payload: mode}),
};

const store = Redux.createStore(reducer);
