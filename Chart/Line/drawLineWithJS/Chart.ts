interface ChartType {
  targetId: string;
  size: {
    width: number;
    height: number;
    font: number;
  };
  datas: ChartDataType[];
  labels: string[];
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
  private labels: string[]; // x축에서 표현되는 라벨 들
  private xAxisCount: number; // x축에서 표현되는 라벨의 개수
  private maxData: number = 0; // y축에서 표현되는 가장 큰 수

  constructor(data: ChartType) {
    const { datas, size, targetId, labels } = data;
    this.chart = document.createElementNS(this.svgNs, 'svg') as SvgInHtml;

    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;

    this.datas = datas;
    this.labels = labels;
    this.xAxisCount = labels.length;
    this.maxData = Math.max(...datas.map((data) => data.max));
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

  private setPoints = () => {
    let pointList = [];
    // for each label
    for (let i = 0; i < this.datas.length; i++) {
      let newPoints = '';
      for (let j = 0; j < this.datas[i].data.length; j++) {
        // x label position
        let x = this.padding.y + (j + 1) / this.xAxisCount;
        // y label position
        let y =
          (this.hegiht - this.padding.x) *
          (this.datas[i].data[j] / this.maxData);

        newPoints += `${x} ${y} `;
      }
      pointList.push(newPoints);
    }

    // make g container
    let points = document.createElementNS(this.svgNs, 'g');

    // draw polylines
    for (let i = 0; i < pointList.length; i++) {}
  };

  private setLabel = () => {};

  // rendering for chart
  public render = () => {
    // 컨테이너 크기 및 Axios 구축
    this.setContainer();

    // 데이터 구축
    this.setPoints();

    // 데이터 라벨링
    document.getElementById(this.targetId)?.appendChild(this.chart);
  };
}
