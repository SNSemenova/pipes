import ReactDOM from "react-dom";
import "./index.css";
import Home from "./pages/Home";
import AboutPage from "./pages/about/AboutPage";
import { SocketManager } from "./SocketManager.tsx";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "about",
    element: <AboutPage />,
  },
]);

ReactDOM.render(
  <Provider store={store}>
    <SocketManager>
      <RouterProvider router={router} />
    </SocketManager>
  </Provider>,
  document.getElementById("root"),
);
