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

interface AttributeType {
  property: string;
  value: string;
}

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

  private setAttributes(element: Element, attributes: AttributeType[]) {
    attributes.forEach((attribute) => {
      element.setAttribute(attribute.property, attribute.value);
    });
  }

  private createElement(tag: string): Element;
  private createElement(tag: string, attributes: AttributeType[]): Element;
  private createElement(tag: string, attributes?: AttributeType[]): Element {
    const newTag = document.createElementNS(this.svgNs, tag);
    if (attributes !== undefined) {
      this.setAttributes(newTag, attributes);
    }
    return newTag;
  }

  private appendChilds(element: Element, childs: Element[]): Element {
    childs.forEach((child) => element.appendChild(child));
    return element;
  }

  private appendToChart(child: Element) {
    this.chart.appendChild(child);
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
    let Axis = this.createElement('g', [
      { property: 'class', value: 'axis' },
      { property: 'stroke', value: '#fff' },
      { property: 'stroke-width', value: '5' },
    ]);

    // 2. Draw X Axis
    let xAxis = this.createElement('line', [
      { property: 'x1', value: this.padding.left + '' },
      { property: 'x2', value: this.width + '' },
      { property: 'y1', value: this.hegiht - this.padding.bottom + '' },
      { property: 'y2', value: this.hegiht - this.padding.bottom + '' },
      { property: 'class', value: 'axis__x' },
    ]);

    // 3. Draw Y Axis
    let yAxis = this.createElement('line', [
      { property: 'x1', value: this.padding.left + '' },
      { property: 'x2', value: this.padding.left + '' },
      { property: 'y1', value: '0' },
      { property: 'y2', value: this.hegiht - this.padding.bottom + '' },
      { property: 'class', value: 'axis__y' },
    ]);

    // insert To C
    this.appendToChart(this.appendChilds(Axis, [xAxis, yAxis]));
  };

  private setLabel = () => {
    const gTagOfText = this.createElement('g', [
      { property: 'fill', value: '#fff' },
      { property: 'font-size', value: this.fontSize + 'px' },
      { property: 'class', value: 'labels' },
      { property: 'text-anchor', value: 'end' },
    ]);
    const gTagOfXLabel = this.createElement('g');
    const gTagOfYLabel = this.createElement('g');

    // xLabel
    this.labels.map((label, i) => {
      let x =
        (i / (this.xAxisCount - 1)) * (this.width - this.padding.left) +
        this.padding.left;
      let y = this.hegiht - this.padding.bottom + this.fontSize * 2;

      const text = this.createElement('text', [
        { property: 'x', value: x + '' },
        { property: 'y', value: y + '' },
      ]);

      text.append(label);

      gTagOfXLabel.appendChild(text);
    });

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

      const text = this.createElement('text', [
        { property: 'x', value: x + '' },
        { property: 'y', value: y + '' },
      ]);
      text.append(label + '');

      gTagOfYLabel.appendChild(text);
    }

    // label box

    this.appendToChart(
      this.appendChilds(gTagOfText, [gTagOfXLabel, gTagOfYLabel])
    );
  };

  private setGuideLine = () => {
    const gTagOfLine = this.createElement('g', [
      { property: 'stroke', value: '#fff' },
      { property: 'stroke-wight', value: '1' },
    ]);

    for (let i = 0; i <= this.yAxisCount; i++) {
      const x1 = this.padding.left;
      const x2 = this.width;
      const y = (this.hegiht - this.padding.bottom) * (i / this.yAxisCount);

      const line = this.createElement('line', [
        { property: 'x1', value: x1 + '' },
        { property: 'x2', value: x2 + '' },
        { property: 'y1', value: y + '' },
        { property: 'y2', value: y + '' },
      ]);

      gTagOfLine.appendChild(line);
    }

    this.appendToChart(gTagOfLine);
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

  protected setContainer = () => {
    // 1. Make SVG Container
    this.setSVGElement();
    // 2. Set Padding
    this.setSVGPadding();
    // 3. Draw X and Y Axis
    this.setAxis();
    // 4. Draw Label
    this.setLabel();
    // 5. Draw GuideLine
    this.setGuideLine();
  };

  // rendering for chart
  public render = () => {
    // 컨테이너 크기 및 Axios 구축
    this.setContainer();

    // 데이터 구축
    this.setPoints();

    // last point

    document.getElementById(this.targetId)?.appendChild(this.chart);
  };
}
