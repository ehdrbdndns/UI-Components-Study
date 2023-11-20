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
  // 데이터들의 라벨
  label: string;
  // 데이터 리스트
  data: number[];
  // 데이터들의 최소 값
  min: number;
  // 데이터들의 최대 값
  max: number;
  // 차트 라인의 색깔
  color: string;
  // 차트 라인의 두께
  weight: number;
}

interface ChartPaddingType {
  left: number;
  bottom: number;
  right: number;
  top: number;
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
  private padding: ChartPaddingType = { bottom: 0, left: 0, top: 0, right: 0 };

  private datas: ChartDataType[];
  private labels: string[]; // x축에서 표현되는 라벨 들
  private xAxisCount: number; // x축에서 표현되는 라벨의 개수
  private yAxisCount: number = 10;
  private maxData: number = 0; // y축에서 표현되는 가장 큰 수
  private minData: number = 0; // y축에서 표현되는 가장 작은 수

  constructor(data: ChartType) {
    const { datas, size, targetId, labels } = data;
    this.chart = this.createElement('svg') as SvgInHtml;

    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;

    this.datas = datas;
    this.labels = labels;
    this.xAxisCount = labels.length;
    this.maxData = Math.max(...datas.map((data) => data.max));
    this.minData = Math.min(...datas.map((data) => data.min));

    console.log(datas);
  }

  private createElement(tag: string) {
    return document.createElementNS(this.svgNs, tag);
  }

  private setSVGPadding = () => {
    // 1. Y-Padding
    // find max y-label length
    // mix font-size and y-label length
    // 2. X-Padding
    this.padding = {
      ...this.padding,
      // mix font-size and datas.length
      bottom: this.fontSize + this.datas.length * 30,
      left:
        this.fontSize + Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10,
      top: 0,
      right: 0,
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
    let Axis = this.createElement('g');
    Axis.setAttribute('class', 'axis');
    Axis.setAttribute('stroke', '#fff');
    Axis.setAttribute('stroke-width', '5');

    // 2. Draw X Axis
    let xAxis = this.createElement('line');
    xAxis.setAttribute('x1', this.padding.left + '');
    xAxis.setAttribute('x2', this.width + '');
    xAxis.setAttribute('y1', this.hegiht - this.padding.bottom + '');
    xAxis.setAttribute('y2', this.hegiht - this.padding.bottom + '');
    xAxis.classList.add('axis__x');

    // 3. Draw Y Axis
    let yAxis = this.createElement('line');
    yAxis.setAttribute('x1', this.padding.left + '');
    yAxis.setAttribute('x2', this.padding.left + '');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('y2', this.hegiht - this.padding.bottom + '');
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
    // set Color
    const defsTagOfColor = this.createElement('defs');
    const linearGradientTag = this.createElement('linearGradient');
    const stop1 = this.createElement('stop');
    const stop2 = this.createElement('stop');

    linearGradientTag.setAttribute('id', 'paint1');
    linearGradientTag.setAttribute('gradientTransform', 'rotate(90)');

    stop1.setAttribute('stop-color', '#FA00FF');

    stop2.setAttribute('offset', '1');
    stop2.setAttribute('stop-color', '#0085FF');

    linearGradientTag.appendChild(stop1);
    linearGradientTag.appendChild(stop2);

    defsTagOfColor.appendChild(linearGradientTag);

    this.chart.appendChild(defsTagOfColor);

    // make g container
    const gTagOfPolyLine = this.createElement('g');
    gTagOfPolyLine.classList.add('datas');

    for (let i = 0; i < this.datas.length; i++) {
      let points = this.datas[i].data
        .map((value, j) => {
          let x =
            (j / (this.xAxisCount - 1)) * (this.width - this.padding.left) +
            this.padding.left;
          let y =
            this.hegiht -
            this.padding.bottom -
            (this.hegiht - this.padding.bottom) * (value / this.maxData);

          return `${x},${y}`;
        })
        .join(' ');

      // draw polylines
      const polyLine = this.createElement('polyline');
      polyLine.setAttribute('points', points);
      if (i === 0) {
        polyLine.setAttribute('stroke', "url('#paint1')");
      } else {
        polyLine.setAttribute('stroke', this.datas[i].color);
      }
      polyLine.setAttribute('fill', 'none');
      polyLine.setAttribute('stroke-width', this.datas[i].weight + '');
      polyLine.setAttribute('stroke-linecap', 'round');
      polyLine.setAttribute('stroke-linejoin', 'round');

      gTagOfPolyLine.appendChild(polyLine);
    }

    this.chart.appendChild(gTagOfPolyLine);
  };

  private setLabel = () => {
    const gTagOfText = this.createElement('g');
    const gTagOfXLabel = this.createElement('g');
    const gTagOfYLabel = this.createElement('g');

    gTagOfText.setAttribute('fill', '#fff');
    gTagOfText.setAttribute('font-size', this.fontSize + 'px');
    gTagOfText.classList.add('labels');

    gTagOfXLabel.setAttribute('text-anchor', 'end');

    gTagOfYLabel.setAttribute('text-anchor', 'end');

    // xLabel
    this.labels.map((label, i) => {
      let x =
        (i / (this.xAxisCount - 1)) * (this.width - this.padding.left) +
        this.padding.left;
      let y = this.hegiht - this.padding.bottom + this.fontSize * 2;

      const text = this.createElement('text');
      text.setAttribute('x', x + '');
      text.setAttribute('y', y + '');
      text.append(label);

      gTagOfXLabel.appendChild(text);
    });
    gTagOfText.appendChild(gTagOfXLabel);

    // yLabel
    // 1. 10개의 y lable 데이터 생성
    // 2. x, y좌표 생성
    for (let i = 0; i <= this.yAxisCount; i++) {
      let x =
        this.padding.bottom - Math.ceil(Math.log(this.maxData + 1) / Math.LN10);
      let y = (this.hegiht - this.padding.bottom) * (i / this.yAxisCount);
      let label =
        ((this.yAxisCount - i) / this.yAxisCount) *
          (this.maxData - this.minData) +
        this.minData;

      const text = this.createElement('text');
      text.setAttribute('x', x + '');
      text.setAttribute('y', y + '');
      text.append(label + '');

      gTagOfYLabel.appendChild(text);
    }
    gTagOfText.appendChild(gTagOfYLabel);

    this.chart.appendChild(gTagOfText);
  };

  private setGuideLine = () => {
    const gTagOfLine = this.createElement('g');
    gTagOfLine.setAttribute('stroke', '#fff');
    gTagOfLine.setAttribute('stroke-weight', '1');
    for (let i = 0; i <= this.yAxisCount; i++) {
      const x1 = this.padding.left;
      const x2 = this.width;
      const y = (this.hegiht - this.padding.bottom) * (i / this.yAxisCount);

      const line = this.createElement('line');
      line.setAttribute('x1', x1 + '');
      line.setAttribute('x2', x2 + '');
      line.setAttribute('y1', y + '');
      line.setAttribute('y2', y + '');

      gTagOfLine.appendChild(line);
    }

    this.chart.appendChild(gTagOfLine);
  };

  // rendering for chart
  public render = () => {
    // 컨테이너 크기 및 Axios 구축
    this.setContainer();

    // 데이터 구축
    this.setPoints();

    // 데이터 라벨링
    this.setLabel();

    // 가이드 라인
    this.setGuideLine();

    // 라벨 박스

    // last point

    document.getElementById(this.targetId)?.appendChild(this.chart);
  };
}
