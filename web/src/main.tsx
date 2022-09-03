import { createRoot } from "react-dom/client";
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Provider } from "react-redux";
import App from "./App";
import Index from "./pages/Home";
import I18nProvider from "./labs/i18n/I18nProvider";
import store from "./store";
import "./helpers/polyfill";
import "./less/global.less";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

export const history = createBrowserHistory({ window });

root.render(
  <I18nProvider>
    <Provider store={store}>
      <HistoryRouter history={history}>
        <App>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/u/*" element={<Index />} />
          </Routes>
        </App>
      </HistoryRouter>
    </Provider>
  </I18nProvider>
);
