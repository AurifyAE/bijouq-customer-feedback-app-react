import { useState, useEffect } from "react";
import WelcomeImg from "/images/Welcome.webp";
import Logo from "/images/bludiamond jewellery logo copy (2).svg";

function Welcome() {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setHasLoaded(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div className="welcome-container">
        <div className="content">
          <div className={`text-section h-full w-full ${hasLoaded ? "loaded" : ""}`}>
            <div className="h-full w-full flex flex-col items-center justify-center" style={{ backgroundImage: 'url("/images/background.webp")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative' }}>
              <img
                src={Logo}
                alt="Blue Diamond Logo"
                className="animate-text"
                style={{ width: "400px", height: "200px", marginBottom: "1rem", animationDelay: "0.2s" }}
              />
              <h1
                className="animate-text"
                style={{ animationDelay: "0.4s", fontFamily: "KugileDemo" }}
              >
                Welcome
              </h1>
              <h3
                className="animate-text"
                style={{ animationDelay: "0.6s", fontFamily: "KugileDemo" }}
              >
                to
              </h3>
              <h2
                className="animate-text"
                style={{ animationDelay: "0.8s", fontFamily: "KugileDemo" }}
              >
                Blue Diamond
              </h2>
            </div>
          </div>
          <div className={`image-section ${hasLoaded ? "loaded" : ""}`}>
            <img src={WelcomeImg} alt="Welcome" />
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className={`scroll-indicator ${hasLoaded ? "loaded" : ""}`}>
          <div className="scroll-text" style={{fontFamily:'KugileDemo'}}>Scroll Down</div>
          <div className="arrow-down"></div>
        </div>
      </div>

      <style jsx>{`
        .welcome-container {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          top: 0;
          left: 0;
          z-index: 1000;
          position: relative;
        }

        .content {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
          position: relative;
        }

        /* Text animations - slide down from top */
        .animate-text {
          opacity: 0;
          transform: translateY(-50px);
          animation: slideDownFade 0.8s ease-out forwards;
        }

        @keyframes slideDownFade {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .image-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          opacity: 0;
          transform: translateX(100px);
          transition: all 1s ease-out;
        }

        .image-section.loaded {
          opacity: 1;
          transform: translateX(0);
        }

        .image-section img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Scroll Down Indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
          opacity: 0;
          animation: floatUp 2s ease-out 1.2s forwards;
        }

        .scroll-indicator.loaded {
          animation: floatUp 2s ease-out 1.2s forwards, float 3s ease-in-out 3.2s infinite;
        }

        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-10px);
          }
        }

        .scroll-text {
          font-size: 0.9rem;
          margin-bottom: 8px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .arrow-down {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }

        h1,
        h2,
        h3 {
          margin: 0.5rem 0;
          text-align: center;
        }

        p {
          margin: 1rem 0;
          text-align: center;
          font-size: 1.1rem;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .welcome-container {
            background-image: url(${WelcomeImg});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }

          .welcome-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.7);
            z-index: 1;
          }

          .content {
            flex-direction: column;
            justify-content: center;
          }

          .text-section {
            flex: none;
            z-index: 2;
          }

          .image-section {
            display: none;
          }

          /* Mobile text animations - slide down from top */
          .animate-text {
            opacity: 0;
            transform: translateY(-30px);
            animation: slideDownFade 0.6s ease-out forwards;
          }

          h1 {
            font-size: 2.5rem;
            color: #333;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          }

          h2 {
            font-size: 2rem;
            color: #333;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          }

          h3 {
            font-size: 1.5rem;
            color: #666;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          }

          p {
            color: #333;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
          }

          .scroll-text {
            color: #333;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
          }

          .arrow-down {
            border-top-color: #333;
          }
        }

        /* Desktop styles */
        @media (min-width: 769px) {
          h1 {
            font-size: 3rem;
            color: #f1dabd;
          }

          h2 {
            font-size: 2.5rem;
            color: #f1dabd;
          }

          h3 {
            font-size: 1.8rem;
            color: #f1dabd;
          }

          .scroll-text {
            color: #363636ff;
          }

          .arrow-down {
            border-top-color: #363636ff;
          }
        }
      `}</style>
    </>
  );
}

export default Welcome;