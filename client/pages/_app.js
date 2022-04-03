import "../styles/globals.css";
import { Web3Provider } from "@context/Web3Context";
import { Provider } from "react-redux";

import store from "@app/store";

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </Web3Provider>
  );
}

export default MyApp;
