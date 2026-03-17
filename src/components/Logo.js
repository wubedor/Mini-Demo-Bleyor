import React from "react";

const DEFAULT_PROPS = {
  src: "/SAMBS.png",
  alt: "SAMB's Laundry and Cleaning Services Logo",
};

export default function Logo({ src = DEFAULT_PROPS.src, alt = DEFAULT_PROPS.alt }) {
  return (
    <div className="logo">
      <img src={src} alt={alt} className="logo-image" />
    </div>
  );
}
