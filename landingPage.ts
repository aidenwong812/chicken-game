import { play } from "./index";

// const instructions = document.createElement("div");
// instructions.style.width = "100%";
// instructions.style.height = "100%";
// instructions.style.display = "flex";
// instructions.style.flexDirection = "column";
// instructions.style.alignItems = "center";
// instructions.style.justifyContent = "center";
// instructions.style.textAlign = "center";
// instructions.style.cursor = "pointer";

const landingPagePane = document.createElement("div");
landingPagePane.style.width = "100vw";
landingPagePane.style.height = "100vh";
landingPagePane.style.backgroundColor = "white";
landingPagePane.style.position = "fixed";
landingPagePane.style.top = "0";
landingPagePane.style.left = "0";
landingPagePane.style.zIndex = "9999";

const demoVideo = document.createElement("video");
demoVideo.src = "/landing.mp4";
demoVideo.style.width = "100%";
demoVideo.style.height = "100%";
demoVideo.style.objectFit = "fill";
demoVideo.muted = true;
demoVideo.loop = true;
demoVideo.autoplay = true;
landingPagePane.append(demoVideo);

const startButton = document.createElement("img");
startButton.src = "/start.gif";
startButton.style.width = "300px";
startButton.style.position = "absolute";
startButton.style.borderRadius = "30px";
startButton.style.bottom = "20%";
startButton.style.left = "50%";
startButton.style.transform = "translate(-50%, -50%)";
startButton.style.cursor = "pointer";
startButton.onclick = () => {
  play();
  landingPagePane.remove();
};
landingPagePane.append(startButton);

document.body.append(landingPagePane);

// play();
