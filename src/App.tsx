import { ToastContainer, toast } from "react-toastify";
import "./App.css";
import { play } from "./game";

import "react-toastify/dist/ReactToastify.css";
import WalletConnection from "./wallet";

function App() {

  const handleGame = async (demo) => {
    if (demo) {
      play(true);
      document.getElementById("landing").classList.add("hidden");
    } else {
      try {
        const publicKey = await WalletConnection();
        if (publicKey) {
          play(false, publicKey.toBase58());
          document.getElementById("landing").classList.add("hidden");
        }
      } catch (err) {
        console.log(err);
        toast.error("Please create wallet");
      }
    }
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

      <div className="absolute w-full h-1/2 bottom-1/2 left-1/2 flex max-md:flex-col items-center text-center justify-evenly -translate-x-1/2 translate-y-1/2">
        <div className="w-[40%] h-[20vh] mb-4 max-md:w-[80%] flex items-center justify-center aspect-[1.618] bg-[#01010180] rounded-[30px]">
          <img
            src="images/Chick-City.gif"
            className="w-[80%] rounded-[30px] cursor-pointer"
          />
        </div>
        <div className="w-[20%] h-[20vh] mb-4 max-md:w-[80%] flex items-center justify-center aspect-[1.618] bg-[#01010180] rounded-[30px]">
          <img
            src="images/Play-Demo.gif"
            className="w-[80%] rounded-[30px] cursor-pointer"
            onClick={() => handleGame(true)}
          />
        </div>
        <div className="w-[20%] h-[20vh] mb-4 max-md:w-[80%] flex items-center justify-center aspect-[1.618] bg-[#01010180] rounded-[30px]">
          <img
            src="images/Play-Game.gif"
            className="w-[80%] rounded-[30px] cursor-pointer"
            onClick={() => handleGame(false)}
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
