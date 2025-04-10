import Header from "../Header/Header";
import "./Layout.css";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      <div className="content-container">{children}</div>
    </div>
  );
};

export default Layout;
