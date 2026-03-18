import logo from './logo_white.png';

const Banner = () => (
  <>
    {/* header shadow shapes */}
    <div className="absolute top-0 left-0 pointer-events-none z-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="absolute w-[150vw] -translate-x-1/6"
        style={{ height: '45vh' }}
      >
        <path d="M0,0 H200 Q200,60 100,60 Q0,60 0,0 Z" fill="rgba(0,0,0,0.4)" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="absolute w-[150vw] -translate-x-1/6"
        style={{ height: '50vh' }}
      >
        <path d="M0,0 H200 Q200,60 100,60 Q0,60 0,0 Z" fill="rgba(0,0,0,0.4)" />
      </svg>
    </div>

    {/* logo above the svg shapes */}
    <img
      src={logo}
      alt="logo"
      className="absolute top-0 left-0 w-screen h-[25vh] object-contain z-20"
    />
  </>
);

export default Banner;
