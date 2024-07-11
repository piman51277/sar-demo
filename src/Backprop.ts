import { Radar } from "./Radar";

export class Backprop {
  private radarUnit: Radar;
  private samples: number[][];
  private targets: number[][];
  private dataBuffer: Uint16Array;
  private currentSample: number;
  private anim: boolean;
  private interval: any;

  constructor(radarUnit: Radar) {
    this.radarUnit = radarUnit;
    this.samples = [];
    this.targets = [];
    this.dataBuffer = new Uint16Array(200 * 200).fill(0);
    this.currentSample = 0;
    this.anim = false;

    this.bindHandlers();
    this.getRadarData(); //for initial target locations
    this.render();
  }

  private bindHandlers(): void {
    //reset if any of these buttons are clicked
    const collectStartBtn = document.getElementById("collect-start");
    const collectSetBtn = document.getElementById("set-btn");
    const rstBtn = document.getElementById("rst-btn");
    const resets = [collectStartBtn, collectSetBtn, rstBtn];
    resets.forEach((btn) => {
      btn?.addEventListener("click", () => {
        this.reset();
        this.getRadarData(); //for initial target locations
        this.render();
      });
    });

    const nextSampleBtn = document.getElementById("nxt-btn");
    nextSampleBtn?.addEventListener("click", () => {
      if (this.currentSample == 0) this.getRadarData();
      if (!this.checkReady()) {
        alert("Please finish collecting data first.");
        return;
      }
      if (this.currentSample >= Radar.sampleMax) return;
      this.process();
      this.render();
      this.currentSample++;
    });

    const playBtn = document.getElementById("ply-btn");
    playBtn?.addEventListener("click", () => {
      if (this.currentSample == 0) this.getRadarData();
      if (!this.checkReady()) {
        alert("Please finish collecting data first.");
        return;
      }
      if (this.anim) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        this.process();
        this.render();
        this.currentSample++;
        if (this.currentSample >= Radar.sampleMax) {
          clearInterval(this.interval);
          this.anim = false;
        }
      }, 50);
      this.anim = true;
    });

    const doOutlinesChk = document.getElementById("outlines-chk");
    doOutlinesChk?.addEventListener("change", () => {
      this.render();
    });
  }

  private checkReady(): boolean {
    return this.samples.length >= Radar.sampleMax;
  }

  private getRadarData(): void {
    this.samples = structuredClone(this.radarUnit.data);
    this.targets = structuredClone(this.radarUnit.targets);
  }

  private render(): void {
    const canvas = document.getElementById("cvs-backproj") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //get the current position
    const [rX, rY] = this.radarUnit.computePosition(this.currentSample);

    //draw the robot
    ctx.fillStyle = "#1E1E1ECC";
    ctx.fillRect(rX - 10, rY - 10, 20, 20);

    //render the backprojected image
    const max = Math.max(...this.dataBuffer) || -1;
    for (let i = 0; i < this.dataBuffer.length; i++) {
      const x = i % 200;
      const y = Math.floor(i / 200);
      const val = this.dataBuffer[i];
      const color = Math.floor((val / max) * 255);
      ctx.fillStyle = `rgb(0, ${color},  0)`;
      ctx.fillRect(x * 2 + 100, y * 2 + 100, 2, 2);
    }

    //draw the target area
    ctx.setLineDash([10, 2]);
    ctx.strokeStyle = "#FC814A";
    ctx.fillStyle = "#FC814A";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 20px sans-serif";
    ctx.strokeRect(100, 100, 400, 400);
    ctx.fillText("Target Area", 500, 100);

    //draw the collection path
    ctx.setLineDash([10, 2]);
    ctx.strokeStyle = "#736CED";
    ctx.fillStyle = "#736CED";
    ctx.strokeRect(50, 50, 500, 500);
    ctx.fillText("Robot Path", 550, 50);

    //check whether or not to draw outlines
    const doOutlines = (
      document.getElementById("outlines-chk") as HTMLInputElement
    ).checked;

    if (doOutlines) {
      //draw the outlines
      ctx.strokeStyle = "#d9dcd6";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      for (let i = 0; i < this.targets.length; i++) {
        const [tX, tY, tS] = this.targets[i];
        ctx.beginPath();
        ctx.arc(tX, tY, tS / 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }

  private process(): void {
    //get the current sample
    const sample = this.samples[this.currentSample];
    //get the current position
    const [rX, rY] = this.radarUnit.computePosition(this.currentSample);

    const bID = (dist: number): number => Math.floor(dist / 5);

    //iterate over the buffer
    for (let i = 0; i < this.dataBuffer.length; i++) {
      const x = (i % 200) * 2 + 100;
      const y = Math.floor(i / 200) * 2 + 100;
      const dist = Math.sqrt((x - rX) ** 2 + (y - rY) ** 2);
      const b = bID(dist);
      this.dataBuffer[i] += sample[b];
    }
  }

  private reset(): void {
    this.samples = [];
    this.targets = [];
    this.currentSample = 0;
    this.dataBuffer = this.dataBuffer.fill(0);
  }
}
