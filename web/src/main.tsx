import { createRoot } from "react-dom/client";
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Provider } from "react-redux";
import App from "./App";
import Index from "./pages/Home";
import Trash from "./pages/Trash";
import Setting from "./pages/Setting";
import SignIn from "./pages/Auth";
import Search from "./pages/Search";
import Note from "./pages/Note";
import Edit from "./pages/Edit"
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
            <Route path="/setting" element={<Setting />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/search" element={<Search />} />
            <Route path="/note/:noteId" element={<Note />} />
            <Route path="/edit" element={<Edit />} />
          </Routes>
        </App>
      </HistoryRouter>
    </Provider>
  </I18nProvider>
);
