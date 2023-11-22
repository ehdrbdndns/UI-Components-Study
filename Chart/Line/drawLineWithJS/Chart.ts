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
  // 사용자 지정 색깔
  customColor?: (chart: Element, ns: string) => string;
  // 기본 color
  color?: string;
  // 차트 라인의 두께
  width: number;
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

  private defaultColor = '#fff';

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
      top: this.fontSize + this.datas.length * 30,
      left:
        (this.fontSize +
          Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10) *
        2,
      right:
        this.fontSize + Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10,
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
      { property: 'x2', value: this.width - this.padding.right + '' },
      { property: 'y1', value: this.hegiht - this.padding.bottom + '' },
      { property: 'y2', value: this.hegiht - this.padding.bottom + '' },
      { property: 'class', value: 'axis__x' },
    ]);

    // 3. Draw Y Axis
    let yAxis = this.createElement('line', [
      { property: 'x1', value: this.padding.left + '' },
      { property: 'x2', value: this.padding.left + '' },
      { property: 'y1', value: this.padding.top + '' },
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
        (i / (this.xAxisCount - 1)) *
          (this.width - this.padding.left - this.padding.right) +
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
    for (let i = 0; i <= this.yAxisCount; i++) {
      let x =
        this.padding.left -
        Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 3;
      let y =
        (this.hegiht - this.padding.bottom - this.padding.top) *
          (i / this.yAxisCount) +
        this.padding.top;
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
      const x2 = this.width - this.padding.right;
      const y =
        (this.hegiht - this.padding.bottom - this.padding.top) *
          (i / this.yAxisCount) +
        this.padding.top;

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
    // make g container
    const gTagOfPolyLine = this.createElement('g');
    gTagOfPolyLine.classList.add('datas');

    for (let i = 0; i < this.datas.length; i++) {
      let points = this.datas[i].data
        .map((value, j) => {
          let x =
            (j / (this.xAxisCount - 1)) *
              (this.width - this.padding.left - this.padding.right) +
            this.padding.left;
          let y =
            this.hegiht -
            this.padding.top -
            this.padding.bottom -
            (this.hegiht - this.padding.bottom - this.padding.top) *
              ((value - this.minData) / (this.maxData - this.minData)) +
            this.padding.top;

          return `${x},${y}`;
        })
        .join(' ');

      // draw polylines
      const polyLine = this.createElement('polyline', [
        { property: 'points', value: points },
        {
          property: 'stroke',
          value: (() => {
            let color: string | undefined;
            if (this.datas[i].customColor) {
              color = `url('#${this.datas[i].customColor?.(
                this.chart,
                this.svgNs
              )}')`;
            } else if (this.datas[i].color) {
              color = this.datas[i].color;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
        { property: 'fill', value: 'none' },
        { property: 'stroke-width', value: this.datas[i].width + '' },
        { property: 'stroke-linecap', value: 'round' },
        { property: 'stroke-linejoin', value: 'round' },
      ]);

      gTagOfPolyLine.appendChild(polyLine);
    }

    this.appendToChart(gTagOfPolyLine);
  };

  protected setContainer = () => {
    // 1. Make SVG Container
    this.setSVGElement();
    // 3. Draw X and Y Axis
    this.setAxis();
    // 4. Draw Label
    this.setLabel();
    // 5. Draw GuideLine
    this.setGuideLine();
  };

  // rendering for chart
  public render = () => {
    // 1. Set Padding
    this.setSVGPadding();
    // 데이터 구축
    this.setPoints();
    // 컨테이너 크기 및 Axios 구축
    this.setContainer();

    // last point
    document.getElementById(this.targetId)?.appendChild(this.chart);
  };
}
