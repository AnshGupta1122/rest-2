export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Spice Garden</h3>
          <p>
            Experience the authentic taste of Indian cuisine. 
            Prepared with fresh ingredients and traditional recipes 
            passed down through generations.
          </p>
        </div>
        
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/menu">Our Menu</a>
          <a href="/cart">Your Cart</a>
        </div>
        
        <div className="footer-links">
          <h4>Contact Us</h4>
          <p>📍 123 Food Street, Mumbai</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ hello@spicegarden.com</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Spice Garden. All rights reserved.</p>
      </div>
    </footer>
  );
}
