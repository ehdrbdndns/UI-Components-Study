interface ChartType {
  targetId: string;
  size: {
    width: number;
    height: number;
    font: number;
  };
  datas: ChartDataType[];
}

interface ChartDataType {
  label: string;
  data: number[];
  min: number;
  max: number;
}

interface ChartPaddingType {
  x: number;
  y: number;
}

type SvgInHtml = HTMLElement & SVGElement;

class Chart {
  // SVG Container
  private chart: SvgInHtml;
  private svgNs: string = 'http://www.w3.org/2000/svg';

  private targetId: string;

  private width: number;
  private hegiht: number;
  private fontSize: number;
  private padding: ChartPaddingType = { x: 0, y: 0 };

  private datas: ChartDataType[];
  private xAxisCount: number;
  private maxData: number = 0;

  constructor(data: ChartType) {
    const { datas, size, targetId } = data;
    this.chart = document.createElementNS(this.svgNs, 'svg') as SvgInHtml;

    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;

    this.datas = datas;
    this.xAxisCount = datas[0].data.length;
    datas.map((data) => {
      data.max > this.maxData ? (this.maxData = data.max) : null;
    });
  }

  private setSVGPadding = () => {
    // 1. Y-Padding
    // find max y-label length
    // mix font-size and y-label length
    this.padding = {
      ...this.padding,
      y: this.fontSize + Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10,
    };

    // 2. X-Padding
    // mix font-size and datas.length
    this.padding = {
      ...this.padding,
      x: this.fontSize + this.datas.length * 30,
    };
  };

  private setSVGElement = () => {
    // Make SVG Container
    this.chart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Set ViewBox
    this.chart.setAttribute('viewBox', `0 0 ${this.width} ${this.hegiht}`);
  };

  private setAxis = () => {
    // 1. Create G Tag
    let Axis = document.createElementNS(this.svgNs, 'g');
    Axis.setAttribute('class', 'axis');
    Axis.setAttribute('stroke', '#fff');
    Axis.setAttribute('stroke-width', '5');

    // 2. Draw X Axis
    let xAxis = document.createElementNS(this.svgNs, 'line');
    xAxis.setAttribute('x1', this.padding.y + '');
    xAxis.setAttribute('x2', this.width + '');
    xAxis.setAttribute('y1', this.hegiht - this.padding.x + '');
    xAxis.setAttribute('y2', this.hegiht - this.padding.x + '');
    xAxis.classList.add('axis__x');

    // 3. Draw Y Axis
    let yAxis = document.createElementNS(this.svgNs, 'line');
    yAxis.setAttribute('x1', this.padding.y + '');
    yAxis.setAttribute('x2', this.padding.y + '');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('y2', this.hegiht - this.padding.x + '');
    yAxis.classList.add('axis__y');

    Axis.appendChild(xAxis);
    Axis.appendChild(yAxis);
    this.chart.appendChild(Axis);
  };

  private setContainer = () => {
    // 1. Make SVG Container
    this.setSVGElement();
    // 2. Set Padding
    this.setSVGPadding();
    // 3. Draw X and Y Axis
    this.setAxis();
  };

  private setLabel = () => {};

  private setData = () => {};

  // rendering for chart
  public render = () => {
    this.setContainer();

    document.getElementById(this.targetId)?.appendChild(this.chart);
  };
}
