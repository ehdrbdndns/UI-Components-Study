interface ChartType {
  targetId: string;
  size: {
    width: number;
    height: number;
    font: number;
  };
  datas: ChartDataType[];
  labels: string[];
  zoom?: boolean;
  showDataCount?: number;
  showLabelCount?: number;
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
  private labels: string[]; // x축에서 표현되는 라벨들

  private xAxisCount: number; // x축에서 표현되는 라벨의 개수
  private yAxisCount: number = 10; // y축에서 표현되는 라벨의 개수

  private maxChartDataCount: number; // 차트 데이터 개수 중 가장 큰 수

  private maxData: number = 0; // y축에서 표현되는 가장 큰 수
  private minData: number = 0; // y축에서 표현되는 가장 작은 수

  private defaultColor = '#fff';
  private customColorDefs: SVGSVGElement;

  private zoom = false; // 줌인, 줌아웃 기능 추가 여부
  private showDataCount: number; // 화면에 보여줄 데이터 개수 (zoom 모드에서만 사용하는 변수)
  private showLabelCount: number; // 화면에 보여줄 라벨 개수 (zoom 모드에서만 사용하는 변수)

  constructor(data: ChartType) {
    const {
      datas,
      size,
      targetId,
      labels,
      zoom = false,
      showDataCount,
      showLabelCount,
    } = data;
    this.chart = this.createSvgElement('svg', [
      { property: 'id', value: 'flowbit_svg' },
    ]);

    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;

    this.datas = datas;
    this.labels = labels;
    this.xAxisCount = labels.length;
    this.maxChartDataCount = Math.max(...datas.map((data) => data.data.length));
    this.customColorDefs = this.createSvgElement('defs', [
      { property: 'class', value: 'customColor' },
    ]);

    // 줌인 줌아웃 기능 활성화
    if (zoom) {
      this.showDataCount = showDataCount ? showDataCount : this.xAxisCount;
      this.showLabelCount = showLabelCount
        ? showLabelCount
        : this.labels.length;

      this.zoom = zoom;
    }

    // 줌인 줌 아웃 기능이 활성화 여부가 결정된 이후에 실행시켜야 함
    this.setMinMaxData();

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
   * SVG 태그에 생성되는 문자의 길이를 구하는 함수
   * @param {string} text 길이를 조회할 문자
   * @returns {number} 문자의 길이 값
   */
  private getTextLength(text: string) {
    const element = this.createSvgElement('text');
    element.append(text);
    return this.getBBox(element).width;
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
   * Y 라벨에 표시되는 최대 값 최소 값 범위를 설정하는 함수
   * @param max Y 라벨에 표시되는 최대 값
   * @param min Y 라벨에 표시되는 최소 값
   */
  private setMinMaxData() {
    if (this.zoom) {
      // 줌인 줌 아웃 기능 활성화 시에 사용됨
      // Set min, max data for datas
      const newMaxList: number[] = [];
      const newMinList: number[] = [];

      this.datas.forEach((_) => {
        const { data } = _;
        const startIndex = this.maxChartDataCount - this.showDataCount;
        newMinList.push(Math.min(...data.slice(startIndex)));
        newMaxList.push(Math.max(...data.slice(startIndex)));
      });
      // Set average of the range of min and max
      let newMax = Math.max(...newMaxList);
      let newMin = Math.min(...newMinList);
      const averageOfMinMax = (newMax - newMin) / this.yAxisCount;
      this.maxData = newMax + averageOfMinMax;
      this.minData = newMin - averageOfMinMax;
    } else {
      this.maxData = Math.max(...this.datas.map((data) => data.max));
      this.minData = Math.min(...this.datas.map((data) => data.min));
    }
  }

  /**
   * Chart의 Padding(상하좌우)를 설정하는 함수
   */
  private setSVGPadding = () => {
    const textLength = this.getTextLength(this.maxData + '');

    this.padding = {
      ...this.padding,
      // mix font-size and datas.length
      bottom: this.fontSize * 5,
      top: this.fontSize * 5 + this.datas.length * 25,
      left: textLength * 2,
      right: textLength,
    };
  };

  /**
   * SVG 기본 값을 설정하는 함수
   */
  private setSVGElement = () => {
    // Create SVG Container
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
      { property: 'id', value: 'flowbit_axios' },
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
      { property: 'id', value: 'flowbit_label' },
    ]);
    const gTagOfXLabel = this.createSvgElement('g', [
      { property: 'text-anchor', value: 'middle' },
    ]);
    const gTagOfYLabel = this.createSvgElement('g', [
      { property: 'id', value: 'flowbit_yLabel' },
      { property: 'dominant-baseline', value: 'central' },
    ]);

    // x label
    if (this.zoom) {
      // 줌인 줌 아웃 모드일 경우
      const increment =
        this.showLabelCount > this.showDataCount
          ? 1
          : Math.ceil(this.showDataCount / this.showLabelCount);
      console.log(this.showDataCount, this.showLabelCount, increment);
      for (let i = 0; i < this.showDataCount; i += increment) {
        let x =
          (i / (this.showDataCount - 1)) *
            (this.width - this.padding.left - this.padding.right) +
          this.padding.left;
        let y = this.hegiht - this.padding.bottom + this.fontSize * 2;
        const text = this.createSvgElement('text', [
          { property: 'x', value: x + '' },
          { property: 'y', value: y + '' },
        ]);

        // TODO labels 위치 변경
        text.append(this.labels[this.xAxisCount - this.showDataCount + i]);
        gTagOfXLabel.appendChild(text);
      }
    } else {
      this.labels.forEach((label, i) => {
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
    }

    // y label
    for (let i = 0; i <= this.yAxisCount; i++) {
      // X 좌표 생성
      const gapFromAxiosAndLabel = 20; // 축과 라벨의 사이 값
      const x = this.padding.left - gapFromAxiosAndLabel;

      // Y 좌표 생성
      const y =
        (this.hegiht - this.padding.bottom - this.padding.top) *
          (i / this.yAxisCount) +
        this.padding.top;

      // 텍스트 생성
      const label =
        ((this.yAxisCount - i) / this.yAxisCount) *
          (this.maxData - this.minData) +
        this.minData;
      const text = this.createSvgElement('text');
      text.append(Math.floor(label) + '');

      this.setAttributes(text, [
        { property: 'x', value: x + '' },
        { property: 'y', value: y + '' },
      ]);

      gTagOfYLabel.appendChild(text);
    }

    this.appendChilds(gTagOfText, [gTagOfXLabel, gTagOfYLabel]);
    this.appendToChart(gTagOfText);
  };

  /**
   * Chart의 가이드 라인을 그리는 함수
   */
  private setGuideLine = () => {
    const gTagOfLine = this.createSvgElement('g', [
      { property: 'class', value: 'guideLine' },
      { property: 'stroke', value: '#797979' },
      { property: 'stroke-width', value: '0.5px' },
    ]);

    // x축 가이드 라인
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

    // y축 가이드 라인
    // for (let i = 0; i <= this.xAxisCount - 1; i++) {
    //   const x =
    //     (i / (this.xAxisCount - 1)) *
    //       (this.width - this.padding.left - this.padding.right) +
    //     this.padding.left;
    //   const y1 = this.hegiht - this.padding.bottom;
    //   const y2 = this.padding.top;

    //   const line = this.createSvgElement('line', [
    //     { property: 'x1', value: x + '' },
    //     { property: 'x2', value: x + '' },
    //     { property: 'y1', value: y1 + '' },
    //     { property: 'y2', value: y2 + '' },
    //   ]);

    //   gTagOfLine.appendChild(line);
    // }

    this.appendToChart(gTagOfLine);
  };

  /**
   * Chart의 데이터 라인을 그리는 함수
   */
  private setPoints = () => {
    // make g container
    const gTagOfPolyLine = this.createSvgElement('g', [
      { property: 'id', value: 'flowbit_datas' },
    ]);
    gTagOfPolyLine.classList.add('datas');

    for (let i = 0; i < this.datas.length; i++) {
      // SET Poly Line
      const { data, customColor, width } = this.datas[i];

      let pointList: string[] = [];
      if (this.zoom) {
        // 줌인 줌아웃 기능 활성화한 버전
        // 가장 긴 데이터 리스트와의 길이 차이
        const diff = this.maxChartDataCount - data.length;
        for (
          let j = data.length - this.showDataCount + diff;
          j < data.length;
          j++
        ) {
          const value = data[j];
          let x =
            ((j - (data.length - this.showDataCount + diff)) /
              (this.showDataCount - 1)) *
              (this.width - this.padding.left - this.padding.right) +
            this.padding.left;
          let y =
            this.hegiht -
            this.padding.top -
            this.padding.bottom -
            (this.hegiht - this.padding.bottom - this.padding.top) *
              ((value - this.minData) / (this.maxData - this.minData)) +
            this.padding.top;

          pointList.push(`${x},${y}`);
        }
      } else {
        // 줌인 줌아웃 기능 비활성화 버전
        pointList = data.map((value, j) => {
          let x =
            (j / this.datas[0].data.length) *
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
      }

      // set color
      // let customColor = data.customColor().border;
      let borderCustomColor = '';
      if (customColor) {
        let customColorElement = customColor().border;
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
              color = color;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
        { property: 'fill', value: 'none' },
        { property: 'stroke-width', value: width + '' },
        { property: 'stroke-linecap', value: 'round' },
        { property: 'stroke-linejoin', value: 'round' },
      ]);

      // Draw last point circle
      let lastPointCustomColor = '';
      if (customColor) {
        let customColorElement = customColor().lastPoint;
        if (customColorElement) {
          lastPointCustomColor = this.setCustomColor(customColorElement);
        }
      }

      // lase Circle에 사용될 좌표 값
      const lastPointPosition = pointList
        .slice(-1)[0]
        .split(',')
        .map((point) => Number(point));

      // Set LastPoint Gradient
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
                  value: color === undefined ? this.defaultColor : color,
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
                  value: color === undefined ? this.defaultColor : color,
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

    // 데이터의 영역 설정(커서 표시)
    const Area = this.setArea({
      x: this.padding.left + '',
      y: this.padding.top + '',
      width: this.width - this.padding.right - this.padding.left + '',
      height: this.hegiht - this.padding.top - this.padding.bottom + '',
    });

    Area.style.cursor =
      'url("https://www.bithumb.com/react/charting_library/sta…es/crosshair.6c091f7d5427d0c5e6d9dc3a90eb2b20.cur"),crosshair';
    this.appendChilds(gTagOfPolyLine, [Area]);
    this.appendToChart(gTagOfPolyLine);
  };

  /**
   * Chart의 데이터 영역을 지정하는 함수
   * 줌인 줌 아웃 등 여러 이벤트 영역에 필요한 범위를 설정함
   * @param {x: string, y: width: string, hegiht: string} param
   * @returns SVGElement
   */
  private setArea = ({ x, y, width, height }) => {
    const Area = this.createSvgElement('rect', [
      { property: 'x', value: x },
      { property: 'y', value: y },
      {
        property: 'width',
        value: width,
      },
      {
        property: 'height',
        value: height,
      },
      {
        property: 'fill-opacity',
        value: '0',
      },
    ]);

    return Area;
  };

  /**
   * Chart의 Legend를 설정하는 함수
   */
  private setLegend = () => {
    const legendHeight = 25;
    const lineWidth = 28;
    const gap = 8;
    const fontSize = 14;

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
        { property: 'stroke-width', value: `4px` },
        { property: 'stroke-linecap', value: 'round' },
        { property: 'stroke-linejoin', value: 'round' },
      ]);
      this.appendChilds(gTagOfLegend, [text, line]);
    }
    this.appendToChart(gTagOfLegend);
  };

  /**
   * Chart의 Zoom 기능을 설정하는 함수
   */
  private setZoomAction = () => {
    this.chart.addEventListener('mousewheel', (e: any) => {
      e.preventDefault();
      // 데이터 범위 재조정
      if (e.deltaY > 0) {
        // Scroll Down
        if (this.showDataCount > 4) this.showDataCount -= 3;
      } else {
        // Scroll Up
        if (this.showDataCount < this.maxChartDataCount - 3)
          this.showDataCount += 3;
      }

      // TODO 축을 새로 생성할 필요 없이 flowchart_data를 감싸는 또 다른 g태그를 만들자

      // 차트 데이터의 최대 최소 값 재설정
      this.setMinMaxData();

      // 차트 라벨 다시 그리기
      document.getElementById('flowbit_label')?.remove();
      this.setLabel();

      // 재조정 된 데이터 다시 셋팅
      document.getElementById('flowbit_datas')?.remove();
      this.setPoints();

      // 데이터가 축 위로 올라오는 현상을 방지하기 위해 다시 셋팅
      document.getElementById('flowbit_axios')?.remove();
      this.setAxis();
    });
  };

  /**
   * Chart의 Interaction 기능을 설정하는 함수
   */
  private setInteraction = () => {
    if (this.zoom) this.setZoomAction();
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

    // Draw X and Y Label
    this.setLabel();

    // Draw Legend
    this.setLegend();

    // Draw GuideLine
    this.setGuideLine();

    // Draw X and Y Axis
    this.setAxis();

    // 데이터 구축
    this.setPoints();

    // Set Interaction
    this.setInteraction();
  };
}
