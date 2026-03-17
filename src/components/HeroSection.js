import React from "react";
import "./HeroSection.css";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const addCityData = async () => {
  const docData = {
    name: "Greater Accra",
    Capital: "Accra",
    country: "Ghana",
    regions: ["Labadi", "socal"],
  };

  try {
    await setDoc(doc(db, "cities", "LA"), docData);
    alert("Data added to Firestore!");
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding data to Firestore. Check the console for details.");
  }
};

const DEFAULT_PROPS = {
  title: "SAMB's LAUNDRY AND KLININ SERVICES",
  subtitle: "The Experts in Cleaning and Laundry Services for your Homes, Offices and Sites.",
  backgroundImage: "/IMG-20260216-WA0000.jpg",
  onButtonClick: addCityData,
  buttonText: "Add City Data to Firestore",
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
