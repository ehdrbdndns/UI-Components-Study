export interface ChartType {
  targetId: string;
  size: {
    width: number;
    height: number;
    font: number;
  };
  datas: ChartDataType[];
  labels: string[];
}

export interface ChartDataType {
  // 데이터들의 라벨
  label: string;
  // 데이터 리스트
  data: number[];
  // 데이터들의 최소 값
  min: number;
  // 데이터들의 최대 값
  max: number;
  // 사용자 지정 색깔
  customColor?: () => {
    border?: HTMLElement | Element;
    legend?: HTMLElement | Element;
    lastPoint?: HTMLElement | Element;
  };
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

interface AttributeType {
  property: string;
  value: string;
}

class Chart {
  // SVG Container
  private chart: SVGSVGElement;
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
  private customColorDefs: SVGSVGElement;

  constructor(data: ChartType) {
    const { datas, size, targetId, labels } = data;
    this.chart = this.createSvgElement('svg');

    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;

    this.datas = datas;
    this.labels = labels;
    this.xAxisCount = labels.length;
    this.maxData = Math.max(...datas.map((data) => data.max));
    this.minData = Math.min(...datas.map((data) => data.min));
    this.customColorDefs = this.createSvgElement('defs', [
      { property: 'class', value: 'customColor' },
    ]);

    this.appendToChart(this.customColorDefs);
    this.getTarget()?.appendChild(this.chart);
  }

  /**
   * SVG 태그가 생성되는 부모 태그를 구하는 함수
   * @returns {HTMLElement} SVG 태그가 생성되는 부모 태그 반환
   */
  private getTarget() {
    return document.getElementById(this.targetId);
  }

  /**
   * Svg Element의 좌표(x, y) 및 크기(width, height)을 구하는 함수
   * @param {SVGSVGElement} element DOM Rect 정보를 확인할 SVGSVGElement
   * @returns {DOMRect} SVG Element의 위치 및 크기 값
   */
  private getBBox(element: SVGSVGElement): DOMRect {
    this.appendToChart(element);
    return element.getBBox();
  }

  /**
   * Element의 속성들을 지정하는 함수
   * @param {SVGSVGElement} element 속성을 지정할 Element 매개변수
   * @param {AttributeType[]} attributes 지정될 속성들인 매개변수 [{ property: string, value: string }]
   */
  private setAttributes(
    element: SVGSVGElement | Element,
    attributes: AttributeType[]
  ) {
    attributes.forEach((attribute) => {
      element.setAttribute(attribute.property, attribute.value);
    });
  }

  /**
   * 사용자가 따로 지정한 Color(Gradient 등)를 지정하는 함수
   * @param colorSvgElement
   * @param position
   * @returns {string} Defs에 지정된 Color ID 값
   */
  private setCustomColor(
    colorSvgElement: SVGSVGElement | HTMLElement | Element,
    position: { x1: string; y1: string; x2: string; y2: string } = {
      x1: '',
      y1: '',
      x2: '',
      y2: '',
    },
    gradientUnits: 'userSpaceOnUse' | 'objectBoundingBox' = 'objectBoundingBox'
  ) {
    const randomId = 'flowbitChart' + Math.random().toString(16);
    if (gradientUnits === 'userSpaceOnUse') {
      this.setAttributes(colorSvgElement, [
        { property: 'gradientUnits', value: gradientUnits },
        { property: 'id', value: randomId },
        { property: 'x1', value: position.x1 },
        { property: 'x2', value: position.x2 },
        { property: 'y1', value: position.y1 },
        { property: 'y2', value: position.y2 },
      ]);
    } else {
      this.setAttributes(colorSvgElement, [
        { property: 'gradientUnits', value: gradientUnits },
        { property: 'id', value: randomId },
      ]);
    }

    this.customColorDefs.append(colorSvgElement);

    return randomId;
  }

  /**
   * SVG Element을 생성하는 함수
   * @param {string} svgTag 생성할 SVG Tag 이름인 매개변수
   * @param {AttributeType[]} attributes 만들어진 SVG Tag에 적용될 속성들인 매개변수 [{ property: string, value: string }]
   * @returns {SVGSVGElement} 생성된 SVG Tag를 반환
   */
  private createSvgElement(
    svgTag: string,
    attributes?: AttributeType[]
  ): SVGSVGElement {
    const newTag = document.createElementNS(
      this.svgNs,
      svgTag
    ) as SVGSVGElement;
    if (attributes !== undefined) {
      this.setAttributes(newTag, attributes);
    }
    return newTag;
  }

  /**
   * 부모 Element에 자식 Element들을 추가하는 함수
   * @param {SVGSVGElement | Element} parent 부노
   * @param {SVGSVGElement[] | Element[]} childs
   * @returns
   */
  private appendChilds(
    parent: SVGSVGElement | Element,
    childs: SVGSVGElement[] | Element[]
  ) {
    childs.forEach((child) => parent.appendChild(child));
  }

  /**
   * Chart에 자식 Element를 추가하는 함수
   * @param {SVGSVGElement | Element} child Chart에 추가할 Element
   */
  private appendToChart(child: SVGSVGElement | Element) {
    this.chart.appendChild(child);
  }

  /**
   * Chart의 Padding(상하좌우)를 설정하는 함수
   */
  private setSVGPadding = () => {
    // 1. Y-Padding
    // find max y-label length
    // mix font-size and y-label length
    // 2. X-Padding
    this.padding = {
      ...this.padding,
      // mix font-size and datas.length
      bottom: this.fontSize * 5,
      top: this.fontSize * 5 + this.datas.length * 25,
      left:
        (this.fontSize +
          Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10) *
        2,
      right:
        this.fontSize + Math.ceil(Math.log(this.maxData + 1) / Math.LN10) * 10,
    };
  };

  /**
   * SVG 기본 값을 설정하는 함수
   */
  private setSVGElement = () => {
    // Make SVG Container
    this.chart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Set ViewBox
    this.chart.setAttribute('viewBox', `0 0 ${this.width} ${this.hegiht}`);
  };

  /**
   * X축 Y축 선을 긋는 함수
   */
  private setAxis = () => {
    // 1. Create G Tag
    let Axis = this.createSvgElement('g', [
      { property: 'class', value: 'axis' },
      { property: 'stroke', value: '#fff' },
      { property: 'stroke-width', value: '5' },
    ]);

    // 2. Draw X Axis
    let xAxis = this.createSvgElement('line', [
      { property: 'x1', value: this.padding.left + '' },
      { property: 'x2', value: this.width - this.padding.right + '' },
      { property: 'y1', value: this.hegiht - this.padding.bottom + '' },
      { property: 'y2', value: this.hegiht - this.padding.bottom + '' },
      { property: 'class', value: 'axis__x' },
    ]);

    // 3. Draw Y Axis
    let yAxis = this.createSvgElement('line', [
      { property: 'x1', value: this.padding.left + '' },
      { property: 'x2', value: this.padding.left + '' },
      { property: 'y1', value: this.padding.top + '' },
      { property: 'y2', value: this.hegiht - this.padding.bottom + '' },
      { property: 'class', value: 'axis__y' },
    ]);

    // insert To C
    this.appendChilds(Axis, [xAxis, yAxis]);
    this.appendToChart(Axis);
  };

  /**
   * X, Y축의 라벨을 설정하는 함수
   */
  private setLabel = () => {
    const gTagOfText = this.createSvgElement('g', [
      { property: 'fill', value: '#fff' },
      { property: 'font-size', value: this.fontSize + 'px' },
      { property: 'class', value: 'labels' },
      { property: 'text-anchor', value: 'end' },
    ]);
    const gTagOfXLabel = this.createSvgElement('g');
    const gTagOfYLabel = this.createSvgElement('g', [
      { property: 'dominant-baseline', value: 'central' },
    ]);

    // xLabel
    // eslint-disable-next-line array-callback-return
    this.labels.map((label, i) => {
      let x =
        (i / (this.xAxisCount - 1)) *
          (this.width - this.padding.left - this.padding.right) +
        this.padding.left;
      let y = this.hegiht - this.padding.bottom + this.fontSize * 2;

      const text = this.createSvgElement('text', [
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

      const text = this.createSvgElement('text', [
        { property: 'x', value: x + '' },
        { property: 'y', value: y + '' },
      ]);

      text.append(label + '');

      gTagOfYLabel.appendChild(text);
    }

    // label box

    this.appendChilds(gTagOfText, [gTagOfXLabel, gTagOfYLabel]);
    this.appendToChart(gTagOfText);
  };

  /**
   * Chart의 가이드 라인을 그리는 함수
   */
  private setGuideLine = () => {
    const gTagOfLine = this.createSvgElement('g', [
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

      const line = this.createSvgElement('line', [
        { property: 'x1', value: x1 + '' },
        { property: 'x2', value: x2 + '' },
        { property: 'y1', value: y + '' },
        { property: 'y2', value: y + '' },
      ]);

      gTagOfLine.appendChild(line);
    }

    this.appendToChart(gTagOfLine);
  };

  /**
   * Chart의 데이터 라인을 그리는 함수
   */
  private setPoints = () => {
    // make g container
    const gTagOfPolyLine = this.createSvgElement('g');
    gTagOfPolyLine.classList.add('datas');

    // set line
    for (let i = 0; i < this.datas.length; i++) {
      const data = this.datas[i];
      let pointList = data.data.map((value, j) => {
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
      });

      // set color
      // let customColor = data.customColor().border;
      let borderCustomColor = '';
      if (data.customColor) {
        let customColorElement = data.customColor().border;
        if (customColorElement) {
          borderCustomColor = this.setCustomColor(customColorElement);
        }
      }

      // draw polylines
      const polyLine = this.createSvgElement('polyline', [
        { property: 'points', value: pointList.join(' ') },
        {
          property: 'stroke',
          value: (() => {
            let color: string | undefined;
            if (borderCustomColor !== '') {
              color = `url('#${borderCustomColor}')`;
            } else {
              color = data.color;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
        { property: 'fill', value: 'none' },
        { property: 'stroke-width', value: data.width + '' },
        { property: 'stroke-linecap', value: 'round' },
        { property: 'stroke-linejoin', value: 'round' },
      ]);

      // draw last point circle
      let lastPointCustomColor = '';
      if (data.customColor) {
        let customColorElement = data.customColor().lastPoint;
        if (customColorElement) {
          lastPointCustomColor = this.setCustomColor(customColorElement);
        }
      }

      // lase Circle에 사용될 좌표 값
      const lastPointPosition = pointList
        .slice(-1)[0]
        .split(',')
        .map((point) => Number(point));

      // Gradient
      const lastPoint = this.createSvgElement('circle', [
        { property: 'cx', value: lastPointPosition[0] + '' },
        { property: 'cy', value: lastPointPosition[1] + '' },
        { property: 'r', value: '30' },
        {
          property: 'fill',
          value: (() => {
            let color: string | undefined;
            if (lastPointCustomColor !== '') {
              color = `url('#${lastPointCustomColor}')`;
            } else {
              const circleId =
                Math.random().toString(16).slice(2) + '-lastpoint';
              const radialGradientTag = this.createSvgElement(
                'radialGradient',
                [
                  {
                    property: 'id',
                    value: circleId,
                  },
                ]
              );
              const radialStop1 = this.createSvgElement('stop', [
                {
                  property: 'stop-color',
                  value:
                    data.color === undefined ? this.defaultColor : data.color,
                },
                {
                  property: 'offset',
                  value: '.3',
                },
              ]);
              const radialStop2 = this.createSvgElement('stop', [
                { property: 'offset', value: '1' },
                { property: 'stop-opacity', value: '0' },
                {
                  property: 'stop-color',
                  value:
                    data.color === undefined ? this.defaultColor : data.color,
                },
              ]);
              radialGradientTag.appendChild(radialStop1);
              radialGradientTag.appendChild(radialStop2);
              this.appendChilds(this.customColorDefs, [radialGradientTag]);
              color = `url('#${circleId}')`;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
      ]);

      this.appendChilds(gTagOfPolyLine, [polyLine, lastPoint]);
    }

    this.appendToChart(gTagOfPolyLine);
  };

  /**
   * Chart의 Legend를 설정하는 함수
   */
  private setLegend = () => {
    const legendHeight = 25;
    const lineWidth = 22;
    const gap = 8;
    const fontSize = 12;

    const gTagOfLegend = this.createSvgElement('g', [
      { property: 'class', value: `legend` },
    ]);

    for (let i = 0; i < this.datas.length; i++) {
      let data = this.datas[i];

      const x = this.width - this.padding.right;
      const y = this.padding.top - this.padding.bottom / 2 - i * legendHeight;
      const text = this.createSvgElement('text', [
        { property: 'font-size', value: `${fontSize}` },
        { property: 'fill', value: `#fff` },
        { property: 'stroke-width', value: `3` },
        { property: 'text-anchor', value: `end` },
        { property: 'x', value: `${x}` },
        { property: 'y', value: `${y}` },
        { property: 'dominant-baseline', value: 'middle' },
      ]);
      text.append(data.label);

      // let customColor = data.customColor?.(this.chart, this.svgNs);
      const bbox = this.getBBox(text);
      const textLength = bbox.width;

      // set color
      let legendCustomColor = '';
      if (data.customColor) {
        let customColorElement = data.customColor().legend;
        if (customColorElement) {
          legendCustomColor = this.setCustomColor(
            customColorElement,
            {
              x1: `${x - gap - lineWidth - textLength}`,
              x2: `${x - gap - textLength}`,
              y1: `${y}`,
              y2: `${y}`,
            },
            'userSpaceOnUse'
          );
        }
      }

      const line = this.createSvgElement('line', [
        { property: 'x1', value: `${x - gap - lineWidth - textLength}` },
        { property: 'y1', value: `${y}` },
        { property: 'x2', value: `${x - gap - textLength}` },
        { property: 'y2', value: `${y}` },
        {
          property: 'stroke',
          value: (() => {
            let color: string | undefined;
            if (legendCustomColor !== '') {
              color = `url('#${legendCustomColor}')`;
            } else {
              color = data.color;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
        { property: 'stroke-width', value: `3px` },
        { property: 'stroke-linecap', value: 'round' },
        { property: 'stroke-linejoin', value: 'round' },
      ]);
      this.appendChilds(gTagOfLegend, [text, line]);
    }
    this.appendToChart(gTagOfLegend);
  };

  /**
   * Chart를 그리는 함수
   */
  public render = () => {
    // 컨테이너 크기 및 Axios 구축
    // Make SVG Container
    this.setSVGElement();

    // 1. Set Padding
    this.setSVGPadding();

    // Draw GuideLine
    this.setGuideLine();

    // 데이터 구축
    this.setPoints();

    // Draw X and Y Axis
    this.setAxis();

    // Draw X and Y Label
    this.setLabel();

    // Draw Legend
    this.setLegend();
  };
}

export default Chart;
