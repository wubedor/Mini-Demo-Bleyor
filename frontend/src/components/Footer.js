import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h1 className="logo-text">
            <span>SAMB's</span> Laundry & <span>Cleaning</span> Services
          </h1>
          <p>
            Professional laundry and cleaning services with dedicated care for your clothes.
          </p>
          <div className="contact">
            <span>
              <i className="fas fa-phone"></i> 0540240754 | 0207760173
            </span>
            <span>
              <i className="fas fa-envelope"></i> sambsKlinin@gmail.com
            </span>
          </div>
          <div className="socials">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="/icons8-facebook-logo-64.png" alt="Facebook"/>
            </a>
            <a href="https://www.instagram.com/sambs_klinin?igsh=MXJtOHBkbmYwMnIzdA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="/icons8-instagram-logo-94.png" alt="Instagram"/>
            </a>
            <a href="https://www.linkedin.com/in/sambs-klinin-aa11a83b3?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="linkedin-icon">
              <span className="linkedin-logo">in</span>
            </a>
            <a href="https://www.tiktok.com/@sambs.laundryklinin?_r=1&_t=ZS-94dEOAxMaur" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="tiktok-icon">
              <span className="tiktok-logo">TT</span>
            </a>
            <a href="https://wa.me/233540240754" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <img src="/icons8-whatsapp-logo-94.png" alt="Whatsapp"/>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} SAMB's Laundry | All Rights Reserved
      </div>
    </footer>
  );
}
