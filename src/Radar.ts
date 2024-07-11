type Pair = [number, number];
type Triple = [number, number, number];

export class Radar {
  private lastMax: number = -1;
  private currentSample: number[] = [];
  private targets: Triple[] = [];
  private sampleCount = 0;
  private collecting = false;
  private interval: any;
  public data: number[][] = [];
  static sampleMax = 200;

  constructor() {
    this.data = [];
    this.currentSample = [];

    this.bindHandlers();
    this.generateTargets();
    this.scan();
    this.render();
  }

  private computePosition(): Pair {
    //samples Q1 are on top edge
    //samples Q2 are on right edge
    //samples Q3 are on bottom edge
    //samples Q4 are on left edge
    const Q1 = Math.floor(Radar.sampleMax * 0.25);
    const Q2 = Math.floor(Radar.sampleMax * 0.5);
    const Q3 = Math.floor(Radar.sampleMax * 0.75);

    if (this.sampleCount < Q1) {
      return [50 + this.sampleCount * 10, 50];
    } else if (this.sampleCount < Q2) {
      return [550, 50 + (this.sampleCount - Q1) * 10];
    } else if (this.sampleCount < Q3) {
      return [550 - (this.sampleCount - Q2) * 10, 550];
    } else {
      return [50, 550 - (this.sampleCount - Q3) * 10];
    }
  }

  private bindHandlers(): void {
    const setTargetBtn = document.getElementById("set-btn");
    setTargetBtn?.addEventListener("click", () => {
      this.generateTargets();
      this.reset();
    });

    const startBtn = document.getElementById("collect-start");
    startBtn?.addEventListener("click", () => {
      this.startCollecting();
    });
  }

  private startCollecting(): void {
    if (this.collecting) {
      this.reset();
    }
    this.collecting = true;
    this.interval = setInterval(() => {
      this.scan();
      this.render();
      this.sampleCount++;
      if (this.sampleCount >= Radar.sampleMax) {
        clearInterval(this.interval);
      }
    }, 100);
  }

  private reset(): void {
    this.sampleCount = 0;
    this.lastMax = -1;
    this.data = [];
    this.currentSample = [];
    this.collecting = false;
    clearInterval(this.interval);
    this.resetRTPlot();
    this.scan();
    this.render();
  }

  private scan(): void {
    //we will use 128 bucket of size 5
    const buckets = new Array(128).fill(0);
    const bID = (dist: number): number => Math.floor(dist / 5);

    for (let i = 0; i < this.targets.length; i++) {
      const [tX, tY, tR] = this.targets[i];
      const [rX, rY] = this.computePosition();

      const distMid = Math.sqrt((tX - rX) ** 2 + (tY - rY) ** 2);
      const distMidBucket = bID(distMid);
      const distMinBucket = bID(distMid - tR);
      const distMaxBucket = bID(distMid + tR);

      const sweepSize = distMaxBucket - distMinBucket + 1;

      //we want to make a hat pattern with the strongest return in the middle
      for (let j = 0; j < sweepSize; j++) {
        const bucket = distMinBucket + j;
        if (bucket <= distMidBucket) {
          buckets[bucket] += j;
        } else {
          buckets[bucket] += sweepSize - j;
        }
      }
    }

    this.currentSample = buckets;
    this.data.push(buckets);
    this.renderRTPlot();
  }

  private generateTargets(): void {
    const targetCountElem = document.getElementById(
      "tgt-cnt"
    ) as HTMLInputElement;
    const targetSizeElem = document.getElementById(
      "tgt-sze-cnt"
    ) as HTMLInputElement;
    const targetCount = parseInt(targetCountElem.value);
    const targetSize = parseInt(targetSizeElem.value);

    const bounds = 400 - targetSize;
    const corner = 100 + targetSize / 2;

    this.targets = [];
    for (let i = 0; i < targetCount; i++) {
      this.targets.push([
        Math.random() * bounds + corner,
        Math.random() * bounds + corner,
        targetSize,
      ]);
    }
  }

  private renderVis(): void {
    const visCanvas = document.getElementById(
      "cvs-data-collect"
    ) as HTMLCanvasElement;
    const ctx = visCanvas.getContext("2d") as CanvasRenderingContext2D;

    //clear the canvas
    ctx.clearRect(0, 0, visCanvas.width, visCanvas.height);

    //get the current position
    const [rX, rY] = this.computePosition();
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);

    //draw lines from robot to targets
    ctx.strokeStyle = "#00916E";
    ctx.beginPath();
    for (let i = 0; i < this.targets.length; i++) {
      ctx.moveTo(rX, rY);
      ctx.lineTo(this.targets[i][0], this.targets[i][1]);
    }
    ctx.stroke();

    //draw targets
    ctx.fillStyle = "#00916E";
    for (let i = 0; i < this.targets.length; i++) {
      ctx.beginPath();
      ctx.arc(
        this.targets[i][0],
        this.targets[i][1],
        this.targets[i][2] / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
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

    //draw the robot
    ctx.fillStyle = "#1E1E1Ecc";
    ctx.fillRect(rX - 10, rY - 10, 20, 20);
  }

  private renderReturn(): void {
    const returnCanvas = document.getElementById(
      "cvs-radar-return"
    ) as HTMLCanvasElement;
    const ctx = returnCanvas.getContext("2d") as CanvasRenderingContext2D;

    //clear the canvas
    ctx.clearRect(0, 0, returnCanvas.width, returnCanvas.height);

    //draw the axes
    ctx.strokeStyle = "#1E1E1E";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    //x axis
    ctx.moveTo(20, 120);
    ctx.lineTo(580, 120);
    //y axis
    ctx.moveTo(20, 10);
    ctx.lineTo(20, 120);
    ctx.stroke();

    //draw markers
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "12px sans-serif";
    ctx.fillText("0", 20, 122);
    ctx.fillText("640", 580, 122);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("0", 17, 120);
    ctx.fillText("1", 17, 10);

    //draw labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Radar Return (Relative Strength vs Distance)", 300, 10);
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("Distance (m)", 300, 122);
    ctx.save();
    ctx.translate(5, 65);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = "top";
    ctx.fillText("Strength (rel.)", 0, 0);
    ctx.restore();

    //prepare the data
    const max = Math.max(...this.currentSample);

    //draw the data
    ctx.strokeStyle = "#736CED";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 120 - (this.currentSample[0] / max) * 100);
    for (let i = 1; i < this.currentSample.length; i++) {
      ctx.lineTo(20 + i * 4.375, 120 - (this.currentSample[i] / max) * 100);
    }
    ctx.stroke();
  }

  private render(): void {
    this.renderVis();
    this.renderReturn();
  }

  private renderRTPlot(): void {
    const canvas = document.getElementById("cvs-rtplot") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const currentMax = Math.max(...this.currentSample);
    let newMax = false;
    if (currentMax > this.lastMax) {
      this.lastMax = currentMax;
      newMax = true;
    }
    const max = newMax ? currentMax : this.lastMax;

    const colorScale = (val: number): string => {
      return `rgb(0, ${(val * 255) / max},0)`;
    };

    if (!newMax) {
      //render the current line
      for (let i = 0; i < this.currentSample.length; i++) {
        ctx.fillStyle = colorScale(this.currentSample[i]);
        ctx.fillRect(i * 4, this.sampleCount * 2, 4, 2);
      }
    } else {
      //re-render with new max
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].length; j++) {
          ctx.fillStyle = colorScale(this.data[i][j]);
          ctx.fillRect(j * 4, i * 2, 4, 2);
        }
      }
    }
  }

  private resetRTPlot(): void {
    const canvas = document.getElementById("cvs-rtplot") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
