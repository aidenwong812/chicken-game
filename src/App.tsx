import "./App.css";
import { play } from "./game";

function App() {
  const getProvider = () => {
    if ("phantom" in window) {
      const provider = (window as any).phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }

    window.open("https://phantom.app/", "_blank");
  };

  const handleGame = async () => {
    const provider = getProvider(); // see "Detecting the Provider"

    provider
      .connect()
      .then(({ publicKey }) => {
        if (publicKey.toBase58()) {
          play(publicKey.toBase58());
          document.getElementById("landing").classList.add("hidden");
        }
      })
      .catch();
  };

  return (
    <div
      className={`w-screen h-screen fixed top-0 left-0 z-[9999] bg-[#DDD]`}
      id="landing"
    >
      <video
        src="videos/landing.mp4"
        autoPlay
        muted
        loop
        className="w-full h-full object-fill"
      ></video>

      <p className="absolute top-0 left-1/2 m-0 p-[20px] text-white bg-[#01010180] text-[2em] font-mono -translate-x-1/2 translate-y-0">
        PLAY 2 EARN COMING 4-12-2024 <br />
        NEW 3D GAME COMING 4-12-2024
      </p>

      <div className="absolute w-full h-1/2 bottom-1/2 left-1/2 flex items-center text-center justify-evenly -translate-x-1/2 translate-y-1/2">
        <div className="w-[40%] h-[190px] flex items-center justify-center aspect-[1.618] bg-[#01010180] rounded-[30px]">
          <img
            src="images/Chick-City.gif"
            className="w-[80%] rounded-[30px] cursor-pointer"
          />
        </div>
        <div className="w-[20%] h-[190px] flex items-center justify-center aspect-[1.618] bg-[#01010180] rounded-[30px]">
          <img
            src="images/Play-Demo.gif"
            className="w-[80%] rounded-[30px] cursor-pointer"
            onClick={handleGame}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
