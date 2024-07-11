# SAR Demo
### A Demonstration of Synthetic Aperature Radar using Backprojection

> This demonstration isn't intended to teach you how about Synthetic Aperature Radar (SAR), nor how to implement the Backprojection algorithm. Instead, it is meant to help one visualize the various processing steps needed to obtain an image from raw radar data. As such, it is assumed that you already have a basic understanding of SAR, Backprojection, and relevant concepts.

## Data Collection
> For the purposes of this demo, we will be using a magical radar mounted on a robot that exists on the 2D plane. As a magical radar, it naturally has some magical properties: It can detect targets in all directions and at any range, even those for which it doesn't have line-of sight. It can also magically eliminate all noise and clutter from the data and get perfect returns from all targets. This is to simplify the demonstration and focus on the processing steps.

Before we can start analyzing data, we need data to analyze! Use the demo below to set up targets and collect data.

## Range-Time Plot
Below is the range-time plot generated from the radar data. Range is plotted on the x-axis, while sample number is plotted on the y-axis. The intensity of each pixel correlates to the relative strength of the return at that range and sample number.

> While it isn't nessesary to generate an RTI plot to generate an image, it can be helpful to visually inspect the data before processing it.

## Backprojection

Use the buttons to step through the backprojection process and see how the image is generated from the raw radar data.
