import { Backprop } from "./Backprop";
import { Radar } from "./Radar";
import { CanvasResizer } from "./util/CanvasResizer";
import "./util/imgReady";
import { ready } from "./util/ready";
import { setInputBounds } from "./util/setInputBounds";

ready(() => {
  new CanvasResizer(600, 600, "cvs-data-collect");
  new CanvasResizer(600, 140, "cvs-radar-return");
  new CanvasResizer(512, 400, "cvs-rtplot");
  new CanvasResizer(600, 600, "cvs-backproj");
  setInputBounds("tgt-cnt", 1, 20, 1);
  setInputBounds("tgt-sze-cnt", 20, 50, 1);
  const radar = new Radar();
  new Backprop(radar);
});
