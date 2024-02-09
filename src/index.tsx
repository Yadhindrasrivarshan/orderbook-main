import React from "react";
import ReactDOM from "react-dom";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

import { Provider } from "react-redux";

import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
