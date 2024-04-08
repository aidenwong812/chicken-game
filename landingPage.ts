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
landingPagePane.style.backgroundColor = "#DDD";
landingPagePane.style.position = "fixed";
landingPagePane.style.top = "0";
landingPagePane.style.left = "0";
landingPagePane.style.zIndex = "9999";

const logoText = document.createElement("p");
logoText.style.fontSize = "2em";
logoText.style.position = "absolute";
logoText.style.color = "white";
logoText.style.fontFamily = "Monospace";
logoText.style.top = "0%";
logoText.style.left = "50%";
logoText.style.padding = "20px";
logoText.style.margin = "0";
logoText.style.backgroundColor = "rgba(1,1,1,0.5)";
logoText.style.transform = "translate(-50%, 0)";
logoText.style.fontFamily = "Monospace";
logoText.innerHTML = "2nd GAME 3D COMING 4-12-2024";
landingPagePane.append(logoText);

const demoVideo = document.createElement("video");
demoVideo.src = "/landing.mp4";
demoVideo.style.width = "100%";
demoVideo.style.height = "100%";
demoVideo.style.objectFit = "fill";
demoVideo.muted = true;
demoVideo.loop = true;
demoVideo.autoplay = true;
landingPagePane.append(demoVideo);

const navPane = document.createElement("div");
navPane.style.width = "100%";
navPane.style.height = "50%";
navPane.style.position = "absolute";
navPane.style.bottom = "50%";
navPane.style.left = "50%";
navPane.style.transform = "translate(-50%, 50%)";
navPane.style.display = "flex";
navPane.style.alignItems = "center";
navPane.style.justifyContent = "space-evenly";
navPane.style.textAlign = "center";
landingPagePane.append(navPane);

const navItem1 = document.createElement("div");
navItem1.style.width = "20%";
navItem1.style.display = "flex";
navItem1.style.alignItems = "center";
navItem1.style.justifyContent = "center";
navItem1.style.aspectRatio = "1.618";
navItem1.style.borderRadius = "30px";
navItem1.style.backgroundColor = "rgba(1,1,1,0.5)";
navPane.append(navItem1);

const navButton1 = document.createElement("img");
navButton1.src = "/Chick-City.gif";
navButton1.style.width = "80%";
navButton1.style.borderRadius = "30px";
navButton1.style.cursor = "pointer";
navItem1.append(navButton1);

const navItem2 = document.createElement("div");
navItem2.style.width = "20%";
navItem2.style.display = "flex";
navItem2.style.alignItems = "center";
navItem2.style.justifyContent = "center";
navItem2.style.aspectRatio = "1.618";
navItem2.style.borderRadius = "30px";
navItem2.style.backgroundColor = "rgba(1,1,1,0.5)";
navPane.append(navItem2);

const navButton2 = document.createElement("img");
navButton2.src = "/Play-Demo.gif";
navButton2.style.width = "80%";
navButton2.style.borderRadius = "30px";
navButton2.style.cursor = "pointer";
navButton2.onclick = () => {
  play();
  landingPagePane.remove();
};
navItem2.append(navButton2);

const navItem3 = document.createElement("div");
navItem3.style.width = "20%";
navItem3.style.display = "flex";
navItem3.style.alignItems = "center";
navItem3.style.justifyContent = "center";
navItem3.style.aspectRatio = "1.618";
navItem3.style.borderRadius = "30px";
navItem3.style.backgroundColor = "rgba(1,1,1,0.5)";
navPane.append(navItem3);

const navButton3 = document.createElement("img");
navButton3.src = "/Play-Game.gif";
navButton3.style.width = "80%";
navButton3.style.borderRadius = "30px";
navButton3.style.cursor = "pointer";
navItem3.append(navButton3);

document.body.append(landingPagePane);

// play();
