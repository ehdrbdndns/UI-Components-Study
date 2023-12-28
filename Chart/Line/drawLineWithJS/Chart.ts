interface ChartType {
  targetId: string;
  size: {
    width: number;
    height: number;
    font: number;
  };
  datas: ChartDataType[];
  labels: string[];
  backgroundColor?: string;
  hoverCardBackgroundColor?: string;
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
  // border 사용자 지정 색깔 ID(Defs의 ID 값)
  borderCustomColorId?: string;
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
  private labelContainer: SVGSVGElement;
  private customColorContainer: SVGSVGElement;
  private datasContainer: SVGSVGElement;
  private legendContainer: SVGSVGElement;
  private guideLineContainer: SVGSVGElement;
  private axiosContainer: SVGSVGElement;
  private mouseEventAreaContainer: SVGSVGElement;
  private hoverGuidLineContainer: SVGSVGElement;
  private hoverPointsContainer: SVGSVGElement;
  private hoverCardContainer: HTMLElement;

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

  private maxDataForDatas: number = 0; // 데이터 중 가장 큰 값
  private minDataForDatas: number = 0; // 데이터 중 가장 작은 값
  private maxData: number = 0; // y축에서 표현되는 가장 큰 수 (maxDataForDatas - 평균 값)
  private minData: number = 0; // y축에서 표현되는 가장 작은 수 (minDataForDatas - 평균 값)

  private defaultColor: string = '#fff'; // data Line의 기본 색상
  private backgrondColor: string = '#48519B'; // Chart 배경 색상
  private hoverCardBackgroundColor: string = '#48519B'; // Hover시 생성되는 카드의 배경 색상

  private zoom = false; // 줌인, 줌아웃 기능 추가 여부
  private showDataCount: number = 0; // 화면에 보여줄 데이터 개수 (zoom 모드에서만 사용하는 변수)
  private showLabelCount: number = 0; // 화면에 보여줄 라벨 개수 (zoom 모드에서만 사용하는 변수)

  private guidLineColor: string = '#797979';
  private guidLineWidth: string = '.5px';

  constructor(data: ChartType) {
    const {
      datas,
      size,
      targetId,
      labels,
      backgroundColor,
      zoom = false,
      showDataCount,
      showLabelCount,
      hoverCardBackgroundColor,
    } = data;
    this.targetId = targetId;
    this.width = size.width;
    this.hegiht = size.height;
    this.fontSize = size.font;
    this.backgrondColor = backgroundColor ? backgroundColor : '#48519B';
    this.hoverCardBackgroundColor = hoverCardBackgroundColor
      ? hoverCardBackgroundColor
      : this.backgrondColor;

    this.datas = datas;
    this.labels = labels;
    this.xAxisCount = labels.length;
    this.maxChartDataCount = Math.max(...datas.map((data) => data.data.length));

    this.zoom = zoom;
    this.showDataCount = showDataCount ? showDataCount : this.maxChartDataCount;
    this.showLabelCount = showLabelCount ? showLabelCount : this.labels.length;

    // 줌인 줌 아웃 기능이 활성화 여부가 결정된 이후에 실행시켜야 함
    this.setMinMaxData();

    this.chart = this.createSvgElement('svg', [
      { property: 'id', value: 'flowbit_svg' },
      { property: 'xmlns', value: 'http://www.w3.org/2000/svg' },
      { property: 'viewBox', value: `0 0 ${this.width} ${this.hegiht}` },
    ]);
    this.chart.style.backgroundColor = this.backgrondColor;
    this.chart.style.display = 'block';
    this.getTarget()?.appendChild(this.chart);

    this.labelContainer = this.createSvgElement('g');
    this.customColorContainer = this.createSvgElement('g');
    this.datasContainer = this.createSvgElement('g');
    this.legendContainer = this.createSvgElement('g');
    this.guideLineContainer = this.createSvgElement('g');
    this.axiosContainer = this.createSvgElement('g');
    this.mouseEventAreaContainer = this.createSvgElement('g');
    this.hoverGuidLineContainer = this.createSvgElement('g');
    this.hoverPointsContainer = this.createSvgElement('g');
    this.hoverCardContainer = document.createElement('div');
  }

  /**
   * SVG 태그가 생성되는 부모 태그를 구하는 함수
   * @returns {HTMLElement} SVG 태그가 생성되는 부모 태그 반환
   */
  private getTarget() {
    return document.getElementById(this.targetId);
  }

  /**
   * 문자열을 HTML Element로 변환하는 함수
   * @param {string} str HTML로 변환할 문자열
   * @returns {HTMLElement}
   */
  /**
   * 문자열을 HTML Element로 변환하는 함수
   * @param {string} str HTML로 변환할 문자열
   * @param {classList?: string[], id: string} param1 생성되는 HTML에 적용할 class와 id 값
   * @returns
   */
  private stringToHTML(
    str: string,
    option: { classList?: string[]; id?: string }
  ) {
    const { classList, id } = option;
    const dom = document.createElement('div');
    if (classList) {
      classList.forEach((item) => {
        dom.classList.add(item);
      });
    }
    id && dom.setAttribute('id', id);
    dom.innerHTML = str;
    return dom;
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
   * @param gradientUnits
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
    const randomId = 'flowbit_' + Math.random().toString(16);
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

    this.customColorContainer.append(colorSvgElement);

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
      this.maxDataForDatas = Math.max(...newMaxList);
      this.minDataForDatas = Math.min(...newMinList);
    } else {
      this.maxDataForDatas = Math.max(...this.datas.map((data) => data.max));
      this.minDataForDatas = Math.min(...this.datas.map((data) => data.min));
    }

    const averageOfMinMax =
      (this.maxDataForDatas - this.minDataForDatas) / this.yAxisCount;
    this.maxData = this.maxDataForDatas + averageOfMinMax;
    this.minData = this.minDataForDatas - averageOfMinMax;
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
      left: textLength * 2.5,
      right: textLength,
    };
  };

  /**
   * SVG 기본 값을 설정하는 함수
   */
  private setSVGElement = () => {
    // Create Custom Color Def Container For Chart
    this.customColorContainer = this.createSvgElement('defs', [
      { property: 'class', value: 'customColor' },
    ]);

    // Create Legend Container For Chart
    this.legendContainer = this.createSvgElement('g');

    // Create Axios Container For Chart
    this.axiosContainer = this.createSvgElement('g');

    // Create Label Container For Chart
    this.labelContainer = this.createSvgElement('g', [
      { property: 'fill', value: '#fff' },
      { property: 'font-size', value: this.fontSize + 'px' },
      { property: 'class', value: 'labels' },
      { property: 'text-anchor', value: 'end' },
    ]);

    // Create Data Container For Chart
    this.datasContainer = this.createSvgElement('g');

    // Create Guide Line Container For Chart
    this.guideLineContainer = this.createSvgElement('g');

    // Creat Hover guideLine Container For Chart
    this.hoverGuidLineContainer = this.createSvgElement('path', [
      { property: 'd', value: '' },
      { property: 'stroke', value: this.guidLineColor },
      { property: 'stroke-width', value: this.guidLineWidth },
      { property: 'visibility', value: 'hidden' },
      { property: 'id', value: 'flowbit_hoverLine' },
    ]);

    // Create Hover Data Point(Circle) Container For Chart
    this.hoverPointsContainer = this.createSvgElement('g', [
      { property: 'id', value: 'flowbit_hoverPoint' },
      { property: 'visibility', value: 'hidden' },
    ]);
    this.datas.forEach((_, i) => {
      const point = this.createSvgElement('circle', [
        { property: 'id', value: `flowbit_hoverPoint${i}` },
        { property: 'cx', value: '1' },
        { property: 'cy', value: '1' },
        { property: 'r', value: '5' },
        { property: 'fill', value: `${this.backgrondColor}` },
        { property: 'stroke-width', value: '2' },
        { property: 'stroke', value: '#fff' },
      ]);

      this.appendChilds(this.hoverPointsContainer, [point]);
    });

    this.hoverCardContainer = document.createElement('div');

    // Create Mouse Event Area Container For Chart
    this.mouseEventAreaContainer = this.createSvgElement('rect', [
      { property: 'x', value: `${this.padding.left}` },
      { property: 'y', value: `${this.padding.top}` },
      {
        property: 'width',
        value: `${this.width - this.padding.right - this.padding.left}`,
      },
      {
        property: 'height',
        value: `${this.hegiht - this.padding.bottom - this.padding.top}`,
      },
      {
        property: 'id',
        value: 'flowbit_eventArea',
      },
    ]);
    this.mouseEventAreaContainer.style.cursor =
      'url("https://www.bithumb.com/react/charting_library/sta…es/crosshair.6c091f7d5427d0c5e6d9dc3a90eb2b20.cur"),crosshair';
    this.mouseEventAreaContainer.style.opacity = '0';

    this.appendToChart(this.customColorContainer);
    this.appendToChart(this.labelContainer);
    this.appendToChart(this.legendContainer);
    this.appendToChart(this.guideLineContainer);
    this.appendToChart(this.datasContainer);
    this.appendToChart(this.hoverGuidLineContainer);
    this.appendToChart(this.hoverPointsContainer);
    this.appendToChart(this.axiosContainer);
    this.appendToChart(this.mouseEventAreaContainer);
    this.getTarget()?.appendChild(this.hoverCardContainer);
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
    this.appendChilds(this.axiosContainer, [Axis]);
  };

  /**
   * X, Y축의 라벨을 설정하는 함수
   */
  private setLabel = () => {
    const gTagForLabel = this.createSvgElement('g', [
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

    this.appendChilds(gTagForLabel, [gTagOfXLabel, gTagOfYLabel]);
    this.appendChilds(this.labelContainer, [gTagForLabel]);
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

    this.appendChilds(this.guideLineContainer, [gTagOfLine]);
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

    // SET Poly Line
    for (let i = 0; i < this.datas.length; i++) {
      let { data, customColor, width, color } = this.datas[i];
      let pointList: string[] = [];

      // 가장 긴 데이터 리스트와의 길이 차이
      const diff = this.maxChartDataCount - data.length;
      // custom Color의 y 좌표 값을 구하기 위해 사용되는 변수
      const yList: number[] = [];
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

        yList.push(y);
        pointList.push(`${x},${y}`);
      }

      // set color
      // let customColor = data.customColor().border;``
      // Todo Change objectBoundingBox To userSpaceOnUse
      if (customColor) {
        let customColorElement = customColor().border;
        if (customColorElement) {
          this.datas[i].borderCustomColorId = this.setCustomColor(
            customColorElement,
            {
              x1: `${this.padding.left}`,
              y1: `${Math.min(...yList)}`,
              x2: `${this.padding.left}`,
              y2: `${Math.max(...yList)}`,
            },
            'userSpaceOnUse'
          );
        }
      }

      // draw polylines
      const polyLine = this.createSvgElement('polyline', [
        { property: 'points', value: pointList.join(' ') },
        {
          property: 'stroke',
          value: (() => {
            if (this.datas[i].borderCustomColorId) {
              color = `url('#${this.datas[i].borderCustomColorId}')`;
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
        { property: 'r', value: '20' },
        {
          property: 'fill',
          value: (() => {
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
              this.appendChilds(this.customColorContainer, [radialGradientTag]);
              color = `url('#${circleId}')`;
            }
            return color === undefined ? this.defaultColor : color;
          })(),
        },
      ]);

      this.appendChilds(gTagOfPolyLine, [polyLine, lastPoint]);
    }
    this.appendChilds(this.datasContainer, [gTagOfPolyLine]);
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
    this.appendChilds(this.legendContainer, [gTagOfLegend]);
  };

  /**
   * Chart의 Zoom 기능을 설정하는 함수
   */
  private setZoomAction = (e: any) => {
    e.preventDefault();
    // 데이터 범위 재조정
    if (e.deltaY > 0) {
      // Scroll Up
      if (this.showDataCount < this.maxChartDataCount - 3)
        this.showDataCount += 3;
    } else {
      // Scroll Down
      if (this.showDataCount > 4) this.showDataCount -= 3;
    }

    // 차트 데이터의 최대 최소 값 재설정
    this.setMinMaxData();

    // 차트 라벨 다시 그리기
    document.getElementById('flowbit_label')?.remove();
    this.setLabel();

    // 재조정 된 데이터 다시 셋팅
    document.getElementById('flowbit_datas')?.remove();
    this.setPoints();
  };

  /**
   * Chart의 Mouse Hover 기능을 설정하는 함수
   * 마우스를 올린 지점에 데이터의 Info 창을 보여줌
   */
  private setMouseHoverAction = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const persent = mouseX / rect.width;
    const index = Math.abs(Math.round((this.showDataCount - 1) * persent));
    const dataValueList: {
      cur: number;
      prev: number;
      legend: string;
    }[] = [];

    // 2. Draw Hover line Like Y Axios Guidline
    const xPositionOfIndex =
      (index / (this.showDataCount - 1)) *
        (this.width - this.padding.left - this.padding.right) +
      this.padding.left;
    const yPositionOfGuidLine = `M ${xPositionOfIndex},${
      this.padding.top
    }L${xPositionOfIndex},${this.hegiht - this.padding.bottom}`;
    this.hoverGuidLineContainer.setAttribute('d', yPositionOfGuidLine);
    this.hoverGuidLineContainer.setAttribute('visibility', 'visible');

    // 3. Point from data line
    this.datas.forEach((_, i) => {
      const { data, color, borderCustomColorId, label } = _;
      const diff = this.maxChartDataCount - data.length;
      const indexOfData = data.length - this.showDataCount + index + diff;
      const dataOfIndex = data[indexOfData];
      const hoverPoint = document.getElementById(`flowbit_hoverPoint${i}`);

      // Todo 라이브러리 화를 고려하지 않고 특정 기능에만 작동되는 hover Card로 우선 개발됨
      // 추후 커스텀화를 고려해 코드를 수정해야 함, 우선 여기서는 실제 가격이 먼저 나옴
      dataValueList.push({
        cur: dataOfIndex,
        prev: data[indexOfData - 1],
        legend: label,
      });

      this.hoverPointsContainer.setAttribute('visibility', 'visible');

      // data가 전체 길이상에 존재하지 않을 경우에는 point를 생성하지 않음
      if (dataOfIndex === undefined) {
        hoverPoint?.setAttribute('cx', '0');
        hoverPoint?.setAttribute('cy', '0');
        return;
      }

      // get yPosition Of Point
      const yPositionOfIndex =
        this.hegiht -
        this.padding.top -
        this.padding.bottom -
        (this.hegiht - this.padding.bottom - this.padding.top) *
          ((dataOfIndex - this.minData) / (this.maxData - this.minData)) +
        this.padding.top;

      // Set Point Property
      hoverPoint?.setAttribute('cx', `${xPositionOfIndex}`);
      hoverPoint?.setAttribute('cy', `${yPositionOfIndex}`);
      hoverPoint?.setAttribute(
        'stroke',
        (() => {
          return borderCustomColorId
            ? `url(#${borderCustomColorId})`
            : color
            ? color
            : this.defaultColor;
        })()
      );
    });

    // 4. Pop info dialog for datas
    // TODO 라이브러리 화를 고려하지 않고 특정 기능에만 작동되는 hover Card로 우선 개발됨
    // 추후 커스텀화를 고려해 코드를 수정해야 함, 우선 여기서는 실제 가격이 먼저 나옴
    if (dataValueList[0].cur === undefined) {
      this.hoverCardContainer.remove();
      return;
    }

    const actualData = dataValueList[0];
    const predictedData = dataValueList[1];
    const dataDiff =
      predictedData.cur - actualData.cur > 0
        ? `<span>예측 오차: <b class="green">+${(
            predictedData.cur - actualData.cur
          ).toLocaleString()} KRW</b></span>`
        : `<span>예측 오차: <b class="red">${(
            predictedData.cur - actualData.cur
          ).toLocaleString()} KRW</b></span>`;
    // const predictedDiff = predictedData.cur - predictedData.prev;
    // const actualDiff = actualData.cur - actualData.prev;
    // const isCorrect =
    //   (predictedDiff > 0 && actualDiff > 0) ||
    //   (predictedDiff < 0 && actualDiff < 0)
    //     ? `<span>플로우빗 상승 추세 예측에 <b class="green">성공</b>했어요!</span>`
    //     : `<span>플로우빗 상승 추세 예측에 <b class="red">실패</b>했어요!</span>`;
    const isCorrect =
      (actualData.prev - actualData.cur) *
        (actualData.prev - predictedData.cur) >
      0
        ? `<span>플로우빗 상승 추세 예측에 <b class="green">성공</b>했어요!</span>`
        : `<span>플로우빗 상승 추세 예측에 <b class="red">실패</b>했어요!</span>`;
    const hoverCardString = `
        <style>
          .flowbit_card {
            background: linear-gradient(
              107deg,
              rgba(250, 0, 255, 0.48) -36.41%,
              rgba(72, 81, 155, 0.78) 75.37%
            );
            padding: 10px 15px;
            border-radius: 8px;
            visibility: hidden;
            position: absolute;

            font-size: 12px;
            color: white;
          }
          .flowbit_card-contents {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .flowbit_card-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .flowbit_card-labels {
            display: flex;
            gap: 12px;
          }
          .flowbit_card-label {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .flowbit_card-label > span {
            font-weight: 300;
          }
          .flowbit_card-label > strong {
            font-weight: 700;
          }
          .flowbit_card-content > span {
            font-weight: 400;
          }
          .flowbit_card-content b {
            font-weight: 600;
          }
          .flowbit_card-content .green {
            color: #00ff29;
          }
          .flowbit_card-content .red {
            color: #f00;
          }
        </style>
        <div class="flowbit_card-contents">
          <div class="flowbit_card-content">
            <div class="flowbit_card-labels">
              <div class="flowbit_card-label">
                <span>BTC 예측가격</span>
                <strong>${predictedData.cur.toLocaleString()} KRW</strong>
              </div>
              <div class="flowbit_card-label">
                <span>BTC 실제가격</span>
                <strong>${actualData.cur.toLocaleString()} KRW</strong>
              </div>
            </div>
          </div>
          <div class="flowbit_card-content">
          ${dataDiff}
          ${isCorrect}
          </div>
        </div>
    </div>
      `;
    this.hoverCardContainer.remove();
    this.hoverCardContainer = this.stringToHTML(hoverCardString, {
      classList: ['flowbit_card'],
    });
    this.getTarget()?.append(this.hoverCardContainer);

    this.hoverCardContainer.style.visibility = 'visible';
    this.hoverCardContainer.style.top = `${e.pageY + 10}px`;
    if (persent > 0.5) {
      this.hoverCardContainer.style.left = `${e.pageX - 10}px`;
      this.hoverCardContainer.style.translate = '-100%';
    } else {
      this.hoverCardContainer.style.left = `${e.pageX + 10}px`;
      this.hoverCardContainer.style.translate = '0';
    }
  };

  /**
   * Chart의 Interaction 기능을 설정하는 함수
   */
  private setInteraction = () => {
    // Make Interaction Area

    // Set Scroll Event
    // Zoom in, out 기능
    if (this.zoom) {
      this.mouseEventAreaContainer.addEventListener('mousewheel', (e) => {
        this.setZoomAction(e);
        this.hoverGuidLineContainer.setAttribute('visibility', 'hidden');
        this.hoverPointsContainer.setAttribute('visibility', 'hidden');
        this.hoverCardContainer.style.visibility = 'hidden';
      });
    }

    // Set Mouse Hover Event
    this.mouseEventAreaContainer.addEventListener(
      'mousemove',
      this.setMouseHoverAction
    );
    this.mouseEventAreaContainer.addEventListener('mouseleave', () => {
      this.hoverGuidLineContainer.setAttribute('visibility', 'hidden');
      this.hoverPointsContainer.setAttribute('visibility', 'hidden');
      this.hoverCardContainer.style.visibility = 'hidden';
    });
  };

  /**
   * Chart를 그리는 함수
   */
  public render = () => {
    // Set SVG Padding
    this.setSVGPadding();

    // Set SVG Container
    this.setSVGElement();

    // Draw X and Y Label
    this.setLabel();

    // Draw Legend
    this.setLegend();

    // Draw GuideLine
    this.setGuideLine();

    // 데이터 구축
    this.setPoints();

    // Draw X and Y Axis
    this.setAxis();

    // Set Interaction
    this.setInteraction();
  };
}
