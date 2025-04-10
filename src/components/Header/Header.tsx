import "./Header.css";

function Header(): JSX.Element {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src="/logo192.png" alt="FlowPipes Logo" className="logo-image" />
          <div className="brand-name">FlowPipes</div>
        </div>
        <nav className="nav-links">
          <a className="nav-link" href="/">
            Home
          </a>
          <a className="nav-link" href="/about">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
