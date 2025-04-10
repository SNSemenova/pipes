import Layout from "../../components/Layout/Layout";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <Layout>
      <div className="about-container">
        <h1 className="about-title">About the Game</h1>
        <p className="about-text">
          This is a logic puzzle game where your goal is to rotate the tiles
          until all the paths are connected into a single network with no loose
          ends.
        </p>

        <h2 className="about-subtitle">How to Play</h2>
        <ul className="about-list">
          <li>Click on a tile to rotate it.</li>
          <li>
            Try to make sure all tiles are connected and there are no open
            edges.
          </li>
          <li>Try different levels and see if you can solve them all!</li>
        </ul>

        <h2 className="about-subtitle">Made by</h2>
        <p className="about-text about-link">
          <a
            href="https://github.com/SNSemenova"
            target="_blank"
            rel="noreferrer"
          >
            SNSemenova
          </a>{" "}
          – frontend developer and puzzle game fan 😊
        </p>

        <p className="about-link">
          <a
            href="https://github.com/SNSemenova/pipes"
            target="_blank"
            rel="noreferrer"
          >
            View the project on GitHub
          </a>
        </p>
      </div>
    </Layout>
  );
}
