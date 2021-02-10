// Styles
import "./NavBarComponent.css";

// Images
import EnsoLogo from "../images/enso-logo.png";

const NavbarComponent = () => {
  return (
    <>
      <div>
        <div className="navbar-container">
          <div className="navbar-item">
            <img className="enso-image" src={EnsoLogo} alt="" />
            <div className="enso-logo-text-container">
              <p className="enso-logo-text">enso</p>
              <p>co-living</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarComponent;
