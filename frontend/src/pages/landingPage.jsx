import React, { useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";


export default function LandingPage() {
  const router = useNavigate();

  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Video Call</h2>
        </div>

        <div className={`navlist ${hamburgerOpen ? 'active' : ''}`}>

            <RxCross2 
             className="closeIcon"
             onClick={() => setHamburgerOpen(false)}
          />

          <p
            onClick={() => {
              router("/random");
              setHamburgerOpen(false);
            }}
            
          >
            Join as Participant
          </p>

          <p
            onClick={() => {
              router("/auth");
               setHamburgerOpen(false);
            }}
          >
            Sign Up
          </p>

          <div
            onClick={() => {
              router("/auth");
              setHamburgerOpen(false);
            }}
            role="button"
          >
            <p>Login</p>
          </div>
        </div>


          {!hamburgerOpen && ( 
          <CiMenuFries
            className="hamburger"
            onClick={() => setHamburgerOpen(true)}
          />
        )}

      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            Empower Your Team.{" "}
            <span style={{ color: "#6C63FF" }}> Anywhere. </span>
          </h1>

          <p>Secure, reliable, and scalable video conferencing.</p>

          <div role="button">
            <Link to={"/auth"}>Connect Now</Link>
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <img src="/landing.png" />
        </div>
      </div>
    </div>
  );
}
