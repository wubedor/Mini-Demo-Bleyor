import React from "react";
import "./HeroSection.css";

const addCityData = async () => {
  // Firebase is disabled - this function is no longer needed
  console.log("Firebase Firestore is disabled. Using backend database instead.");
  alert("Firebase Firestore is disabled. Data is now stored in MongoDB backend.");
};

const DEFAULT_PROPS = {
  title: "SAMB's LAUNDRY AND KLININ SERVICES",
  subtitle: "The Experts in Cleaning and Laundry Services for your Homes, Offices and Sites.",
  backgroundImage: "/IMG-20260216-WA0000.jpg",
  onButtonClick: addCityData,
  buttonText: "Learn More",
};

export default function HeroSection({
  title = DEFAULT_PROPS.title,
  subtitle = DEFAULT_PROPS.subtitle,
  backgroundImage = DEFAULT_PROPS.backgroundImage,
  onButtonClick = DEFAULT_PROPS.onButtonClick,
  buttonText = DEFAULT_PROPS.buttonText,
}) {
  const heroStyle = {
    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5) 50%), url(${backgroundImage})`,
  };

  return (
    <div className="hero-section" style={heroStyle}>
      <div className="hero-content">
        <h1>{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <button className="hero-button" onClick={onButtonClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
