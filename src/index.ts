import { CanvasResizer } from "./util/CanvasResizer";
import "./util/imgReady";
import { ready } from "./util/ready";

ready(() => {
  new CanvasResizer(600, 400, "demoCanvas");

  const canvas = document.getElementById("demoCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 100, 100);
});
