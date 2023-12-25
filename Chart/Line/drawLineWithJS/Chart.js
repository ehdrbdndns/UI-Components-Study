var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Chart = /** @class */ (function () {
    function Chart(data) {
        var _this = this;
        var _a;
        this.svgNs = 'http://www.w3.org/2000/svg';
        this.padding = { bottom: 0, left: 0, top: 0, right: 0 };
        this.yAxisCount = 10; // y축에서 표현되는 라벨의 개수
        this.maxData = 0; // y축에서 표현되는 가장 큰 수
        this.minData = 0; // y축에서 표현되는 가장 작은 수
        this.defaultColor = '#fff'; // data Line의 기본 색상
        this.backgrondColor = '#48519B'; // Chart 배경 색상
        this.zoom = false; // 줌인, 줌아웃 기능 추가 여부
        this.showDataCount = 0; // 화면에 보여줄 데이터 개수 (zoom 모드에서만 사용하는 변수)
        this.showLabelCount = 0; // 화면에 보여줄 라벨 개수 (zoom 모드에서만 사용하는 변수)
        this.guidLineColor = '#797979';
        this.guidLineWidth = '.5px';
        /**
         * Chart의 Padding(상하좌우)를 설정하는 함수
         */
        this.setSVGPadding = function () {
            var textLength = _this.getTextLength(_this.maxData + '');
            _this.padding = __assign(__assign({}, _this.padding), { 
                // mix font-size and datas.length
                bottom: _this.fontSize * 5, top: _this.fontSize * 5 + _this.datas.length * 25, left: textLength * 2.5, right: textLength });
        };
        /**
         * SVG 기본 값을 설정하는 함수
         */
        this.setSVGElement = function () {
            // Create Custom Color Def Container For Chart
            _this.customColorContainer = _this.createSvgElement('defs', [
                { property: 'class', value: 'customColor' },
            ]);
            // Create Legend Container For Chart
            _this.legendContainer = _this.createSvgElement('g');
            // Create Axios Container For Chart
            _this.axiosContainer = _this.createSvgElement('g');
            // Create Label Container For Chart
            _this.labelContainer = _this.createSvgElement('g', [
                { property: 'fill', value: '#fff' },
                { property: 'font-size', value: _this.fontSize + 'px' },
                { property: 'class', value: 'labels' },
                { property: 'text-anchor', value: 'end' },
            ]);
            // Create Data Container For Chart
            _this.datasContainer = _this.createSvgElement('g');
            // Create Guide Line Container For Chart
            _this.guideLineContainer = _this.createSvgElement('g');
            // Creat Hover guideLine Container For Chart
            _this.hoverGuidLineContainer = _this.createSvgElement('path', [
                { property: 'd', value: '' },
                {
                    property: 'stroke',
                    value: _this.guidLineColor,
                },
                {
                    property: 'stroke-width',
                    value: _this.guidLineWidth,
                },
                {
                    property: 'visibility',
                    value: 'hidden',
                },
                {
                    property: 'id',
                    value: 'flowbit_hoverLine',
                },
            ]);
            // Create Mouse Event Area Container For Chart
            _this.mouseEventAreaContainer = _this.createSvgElement('rect', [
                { property: 'x', value: "".concat(_this.padding.left) },
                { property: 'y', value: "".concat(_this.padding.top) },
                {
                    property: 'width',
                    value: "".concat(_this.width - _this.padding.right - _this.padding.left),
                },
                {
                    property: 'height',
                    value: "".concat(_this.hegiht - _this.padding.bottom - _this.padding.top),
                },
                {
                    property: 'id',
                    value: 'flowbit_eventArea',
                },
            ]);
            _this.mouseEventAreaContainer.style.cursor =
                'url("https://www.bithumb.com/react/charting_library/sta…es/crosshair.6c091f7d5427d0c5e6d9dc3a90eb2b20.cur"),crosshair';
            _this.mouseEventAreaContainer.style.opacity = '0';
            _this.appendToChart(_this.customColorContainer);
            _this.appendToChart(_this.labelContainer);
            _this.appendToChart(_this.legendContainer);
            _this.appendToChart(_this.guideLineContainer);
            _this.appendToChart(_this.datasContainer);
            _this.appendToChart(_this.hoverGuidLineContainer);
            _this.appendToChart(_this.axiosContainer);
            _this.appendToChart(_this.mouseEventAreaContainer);
        };
        /**
         * X축 Y축 선을 긋는 함수
         */
        this.setAxis = function () {
            // 1. Create G Tag
            var Axis = _this.createSvgElement('g', [
                { property: 'class', value: 'axis' },
                { property: 'stroke', value: '#fff' },
                { property: 'stroke-width', value: '5' },
                { property: 'id', value: 'flowbit_axios' },
            ]);
            // 2. Draw X Axis
            var xAxis = _this.createSvgElement('line', [
                { property: 'x1', value: _this.padding.left + '' },
                { property: 'x2', value: _this.width - _this.padding.right + '' },
                { property: 'y1', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'y2', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'class', value: 'axis__x' },
            ]);
            // 3. Draw Y Axis
            var yAxis = _this.createSvgElement('line', [
                { property: 'x1', value: _this.padding.left + '' },
                { property: 'x2', value: _this.padding.left + '' },
                { property: 'y1', value: _this.padding.top + '' },
                { property: 'y2', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'class', value: 'axis__y' },
            ]);
            // insert To C
            _this.appendChilds(Axis, [xAxis, yAxis]);
            _this.appendChilds(_this.axiosContainer, [Axis]);
        };
        /**
         * X, Y축의 라벨을 설정하는 함수
         */
        this.setLabel = function () {
            var gTagForLabel = _this.createSvgElement('g', [
                { property: 'id', value: 'flowbit_label' },
            ]);
            var gTagOfXLabel = _this.createSvgElement('g', [
                { property: 'text-anchor', value: 'middle' },
            ]);
            var gTagOfYLabel = _this.createSvgElement('g', [
                { property: 'id', value: 'flowbit_yLabel' },
                { property: 'dominant-baseline', value: 'central' },
            ]);
            // x label
            if (_this.zoom) {
                // 줌인 줌 아웃 모드일 경우
                var increment = _this.showLabelCount > _this.showDataCount
                    ? 1
                    : Math.ceil(_this.showDataCount / _this.showLabelCount);
                for (var i = 0; i < _this.showDataCount; i += increment) {
                    var x = (i / (_this.showDataCount - 1)) *
                        (_this.width - _this.padding.left - _this.padding.right) +
                        _this.padding.left;
                    var y = _this.hegiht - _this.padding.bottom + _this.fontSize * 2;
                    var text = _this.createSvgElement('text', [
                        { property: 'x', value: x + '' },
                        { property: 'y', value: y + '' },
                    ]);
                    // TODO labels 위치 변경
                    text.append(_this.labels[_this.xAxisCount - _this.showDataCount + i]);
                    gTagOfXLabel.appendChild(text);
                }
            }
            else {
                _this.labels.forEach(function (label, i) {
                    var x = (i / (_this.xAxisCount - 1)) *
                        (_this.width - _this.padding.left - _this.padding.right) +
                        _this.padding.left;
                    var y = _this.hegiht - _this.padding.bottom + _this.fontSize * 2;
                    var text = _this.createSvgElement('text', [
                        { property: 'x', value: x + '' },
                        { property: 'y', value: y + '' },
                    ]);
                    text.append(label);
                    gTagOfXLabel.appendChild(text);
                });
            }
            // y label
            for (var i = 0; i <= _this.yAxisCount; i++) {
                // X 좌표 생성
                var gapFromAxiosAndLabel = 20; // 축과 라벨의 사이 값
                var x = _this.padding.left - gapFromAxiosAndLabel;
                // Y 좌표 생성
                var y = (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                    (i / _this.yAxisCount) +
                    _this.padding.top;
                // 텍스트 생성
                var label = ((_this.yAxisCount - i) / _this.yAxisCount) *
                    (_this.maxData - _this.minData) +
                    _this.minData;
                var text = _this.createSvgElement('text');
                text.append(Math.floor(label) + '');
                _this.setAttributes(text, [
                    { property: 'x', value: x + '' },
                    { property: 'y', value: y + '' },
                ]);
                gTagOfYLabel.appendChild(text);
            }
            _this.appendChilds(gTagForLabel, [gTagOfXLabel, gTagOfYLabel]);
            _this.appendChilds(_this.labelContainer, [gTagForLabel]);
        };
        /**
         * Chart의 가이드 라인을 그리는 함수
         */
        this.setGuideLine = function () {
            var gTagOfLine = _this.createSvgElement('g', [
                { property: 'class', value: 'guideLine' },
                { property: 'stroke', value: '#797979' },
                { property: 'stroke-width', value: '0.5px' },
            ]);
            // x축 가이드 라인
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x1 = _this.padding.left;
                var x2 = _this.width - _this.padding.right;
                var y = (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                    (i / _this.yAxisCount) +
                    _this.padding.top;
                var line = _this.createSvgElement('line', [
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
            _this.appendChilds(_this.guideLineContainer, [gTagOfLine]);
        };
        /**
         * Chart의 데이터 라인을 그리는 함수
         */
        this.setPoints = function () {
            // make g container
            var gTagOfPolyLine = _this.createSvgElement('g', [
                { property: 'id', value: 'flowbit_datas' },
            ]);
            gTagOfPolyLine.classList.add('datas');
            var _loop_1 = function (i) {
                var _a = _this.datas[i], data = _a.data, customColor = _a.customColor, width = _a.width;
                var pointList = [];
                // 가장 긴 데이터 리스트와의 길이 차이
                var diff = _this.maxChartDataCount - data.length;
                for (var j = data.length - _this.showDataCount + diff; j < data.length; j++) {
                    var value = data[j];
                    var x = ((j - (data.length - _this.showDataCount + diff)) /
                        (_this.showDataCount - 1)) *
                        (_this.width - _this.padding.left - _this.padding.right) +
                        _this.padding.left;
                    var y = _this.hegiht -
                        _this.padding.top -
                        _this.padding.bottom -
                        (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                            ((value - _this.minData) / (_this.maxData - _this.minData)) +
                        _this.padding.top;
                    pointList.push("".concat(x, ",").concat(y));
                }
                // set color
                // let customColor = data.customColor().border;
                var borderCustomColor = '';
                if (customColor) {
                    var customColorElement = customColor().border;
                    if (customColorElement) {
                        borderCustomColor = _this.setCustomColor(customColorElement);
                    }
                }
                // draw polylines
                var polyLine = _this.createSvgElement('polyline', [
                    { property: 'points', value: pointList.join(' ') },
                    {
                        property: 'stroke',
                        value: (function () {
                            var color;
                            if (borderCustomColor !== '') {
                                color = "url('#".concat(borderCustomColor, "')");
                            }
                            else {
                                // eslint-disable-next-line no-self-assign
                                color = color;
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                    { property: 'fill', value: 'none' },
                    { property: 'stroke-width', value: width + '' },
                    { property: 'stroke-linecap', value: 'round' },
                    { property: 'stroke-linejoin', value: 'round' },
                ]);
                // Draw last point circle
                var lastPointCustomColor = '';
                if (customColor) {
                    var customColorElement = customColor().lastPoint;
                    if (customColorElement) {
                        lastPointCustomColor = _this.setCustomColor(customColorElement);
                    }
                }
                // lase Circle에 사용될 좌표 값
                var lastPointPosition = pointList
                    .slice(-1)[0]
                    .split(',')
                    .map(function (point) { return Number(point); });
                // Set LastPoint Gradient
                var lastPoint = _this.createSvgElement('circle', [
                    { property: 'cx', value: lastPointPosition[0] + '' },
                    { property: 'cy', value: lastPointPosition[1] + '' },
                    { property: 'r', value: '20' },
                    {
                        property: 'fill',
                        value: (function () {
                            var color;
                            if (lastPointCustomColor !== '') {
                                color = "url('#".concat(lastPointCustomColor, "')");
                            }
                            else {
                                var circleId = Math.random().toString(16).slice(2) + '-lastpoint';
                                var radialGradientTag = _this.createSvgElement('radialGradient', [
                                    {
                                        property: 'id',
                                        value: circleId,
                                    },
                                ]);
                                var radialStop1 = _this.createSvgElement('stop', [
                                    {
                                        property: 'stop-color',
                                        value: color === undefined ? _this.defaultColor : color,
                                    },
                                    {
                                        property: 'offset',
                                        value: '.3',
                                    },
                                ]);
                                var radialStop2 = _this.createSvgElement('stop', [
                                    { property: 'offset', value: '1' },
                                    { property: 'stop-opacity', value: '0' },
                                    {
                                        property: 'stop-color',
                                        value: color === undefined ? _this.defaultColor : color,
                                    },
                                ]);
                                radialGradientTag.appendChild(radialStop1);
                                radialGradientTag.appendChild(radialStop2);
                                _this.appendChilds(_this.customColorContainer, [radialGradientTag]);
                                color = "url('#".concat(circleId, "')");
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                ]);
                _this.appendChilds(gTagOfPolyLine, [polyLine, lastPoint]);
            };
            // SET Poly Line
            for (var i = 0; i < _this.datas.length; i++) {
                _loop_1(i);
            }
            _this.appendChilds(_this.datasContainer, [gTagOfPolyLine]);
        };
        /**
         * Chart의 Legend를 설정하는 함수
         */
        this.setLegend = function () {
            var legendHeight = 25;
            var lineWidth = 28;
            var gap = 8;
            var fontSize = 14;
            var gTagOfLegend = _this.createSvgElement('g', [
                { property: 'class', value: "legend" },
            ]);
            var _loop_2 = function (i) {
                var data = _this.datas[i];
                var x = _this.width - _this.padding.right;
                var y = _this.padding.top - _this.padding.bottom / 2 - i * legendHeight;
                var text = _this.createSvgElement('text', [
                    { property: 'font-size', value: "".concat(fontSize) },
                    { property: 'fill', value: "#fff" },
                    { property: 'text-anchor', value: "end" },
                    { property: 'x', value: "".concat(x) },
                    { property: 'y', value: "".concat(y) },
                    { property: 'dominant-baseline', value: 'middle' },
                ]);
                text.append(data.label);
                // let customColor = data.customColor?.(this.chart, this.svgNs);
                var bbox = _this.getBBox(text);
                var textLength = bbox.width;
                // set color
                var legendCustomColor = '';
                if (data.customColor) {
                    var customColorElement = data.customColor().legend;
                    if (customColorElement) {
                        legendCustomColor = _this.setCustomColor(customColorElement, {
                            x1: "".concat(x - gap - lineWidth - textLength),
                            x2: "".concat(x - gap - textLength),
                            y1: "".concat(y),
                            y2: "".concat(y),
                        }, 'userSpaceOnUse');
                    }
                }
                var line = _this.createSvgElement('line', [
                    { property: 'x1', value: "".concat(x - gap - lineWidth - textLength) },
                    { property: 'y1', value: "".concat(y) },
                    { property: 'x2', value: "".concat(x - gap - textLength) },
                    { property: 'y2', value: "".concat(y) },
                    {
                        property: 'stroke',
                        value: (function () {
                            var color;
                            if (legendCustomColor !== '') {
                                color = "url('#".concat(legendCustomColor, "')");
                            }
                            else {
                                color = data.color;
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                    { property: 'stroke-width', value: "4px" },
                    { property: 'stroke-linecap', value: 'round' },
                    { property: 'stroke-linejoin', value: 'round' },
                ]);
                _this.appendChilds(gTagOfLegend, [text, line]);
            };
            for (var i = 0; i < _this.datas.length; i++) {
                _loop_2(i);
            }
            _this.appendChilds(_this.legendContainer, [gTagOfLegend]);
        };
        /**
         * Chart의 Zoom 기능을 설정하는 함수
         */
        this.setZoomAction = function (e) {
            var _a, _b;
            e.preventDefault();
            // 데이터 범위 재조정
            if (e.deltaY > 0) {
                // Scroll Up
                if (_this.showDataCount < _this.maxChartDataCount - 3)
                    _this.showDataCount += 3;
            }
            else {
                // Scroll Down
                if (_this.showDataCount > 4)
                    _this.showDataCount -= 3;
            }
            // 차트 데이터의 최대 최소 값 재설정
            _this.setMinMaxData();
            // 차트 라벨 다시 그리기
            (_a = document.getElementById('flowbit_label')) === null || _a === void 0 ? void 0 : _a.remove();
            _this.setLabel();
            // 재조정 된 데이터 다시 셋팅
            (_b = document.getElementById('flowbit_datas')) === null || _b === void 0 ? void 0 : _b.remove();
            _this.setPoints();
        };
        /**
         * Chart의 Mouse Hover 기능을 설정하는 함수
         * 마우스를 올린 지점에 데이터의 Info 창을 보여줌
         */
        this.setMouseHoverAction = function (e) {
            var rect = e.target.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var persent = mouseX / rect.width;
            var index = Math.abs(Math.round((_this.showDataCount - 1) * persent));
            // 2. Draw Hover line Like Y Axios Guidline
            var xOfGuidLine = (index / (_this.showDataCount - 1)) *
                (_this.width - _this.padding.left - _this.padding.right) +
                _this.padding.left;
            var pathOfGuidLine = "M ".concat(xOfGuidLine, ",").concat(_this.padding.top, "L").concat(xOfGuidLine, ",").concat(_this.hegiht - _this.padding.bottom);
            _this.hoverGuidLineContainer.setAttribute('d', pathOfGuidLine);
            _this.hoverGuidLineContainer.setAttribute('visibility', 'visible');
            // 3. Point from data line
            // 4. Pop info dialog for datas
        };
        /**
         * Chart의 Interaction 기능을 설정하는 함수
         */
        this.setInteraction = function () {
            // Make Interaction Area
            // Set Scroll Event
            // Zoom in, out 기능
            if (_this.zoom) {
                _this.mouseEventAreaContainer.addEventListener('mousewheel', _this.setZoomAction);
            }
            // Set Mouse Hover Event
            _this.mouseEventAreaContainer.addEventListener('mousemove', _this.setMouseHoverAction);
            _this.mouseEventAreaContainer.addEventListener('mouseleave', function () {
                _this.hoverGuidLineContainer.setAttribute('visibility', 'hidden');
            });
        };
        /**
         * Chart를 그리는 함수
         */
        this.render = function () {
            // Set SVG Padding
            _this.setSVGPadding();
            // Set SVG Container
            _this.setSVGElement();
            // Draw X and Y Label
            _this.setLabel();
            // Draw Legend
            _this.setLegend();
            // Draw GuideLine
            _this.setGuideLine();
            // 데이터 구축
            _this.setPoints();
            // Draw X and Y Axis
            _this.setAxis();
            // Set Interaction
            _this.setInteraction();
        };
        var datas = data.datas, size = data.size, targetId = data.targetId, labels = data.labels, backgroundColor = data.backgroundColor, _b = data.zoom, zoom = _b === void 0 ? false : _b, showDataCount = data.showDataCount, showLabelCount = data.showLabelCount;
        this.targetId = targetId;
        this.width = size.width;
        this.hegiht = size.height;
        this.fontSize = size.font;
        this.backgrondColor = backgroundColor;
        this.datas = datas;
        this.labels = labels;
        this.xAxisCount = labels.length;
        this.maxChartDataCount = Math.max.apply(Math, datas.map(function (data) { return data.data.length; }));
        this.zoom = zoom;
        this.showDataCount = showDataCount ? showDataCount : this.maxChartDataCount;
        this.showLabelCount = showLabelCount ? showLabelCount : this.labels.length;
        // 줌인 줌 아웃 기능이 활성화 여부가 결정된 이후에 실행시켜야 함
        this.setMinMaxData();
        this.chart = this.createSvgElement('svg', [
            { property: 'id', value: 'flowbit_svg' },
            { property: 'xmlns', value: 'http://www.w3.org/2000/svg' },
            { property: 'viewBox', value: "0 0 ".concat(this.width, " ").concat(this.hegiht) },
        ]);
        this.chart.style.backgroundColor = this.backgrondColor;
        this.chart.style.display = 'block';
        (_a = this.getTarget()) === null || _a === void 0 ? void 0 : _a.appendChild(this.chart);
    }
    /**
     * SVG 태그가 생성되는 부모 태그를 구하는 함수
     * @returns {HTMLElement} SVG 태그가 생성되는 부모 태그 반환
     */
    Chart.prototype.getTarget = function () {
        return document.getElementById(this.targetId);
    };
    /**
     * SVG 태그에 생성되는 문자의 길이를 구하는 함수
     * @param {string} text 길이를 조회할 문자
     * @returns {number} 문자의 길이 값
     */
    Chart.prototype.getTextLength = function (text) {
        var element = this.createSvgElement('text');
        element.append(text);
        return this.getBBox(element).width;
    };
    /**
     * Svg Element의 좌표(x, y) 및 크기(width, height)을 구하는 함수
     * @param {SVGSVGElement} element DOM Rect 정보를 확인할 SVGSVGElement
     * @returns {DOMRect} SVG Element의 위치 및 크기 값
     */
    Chart.prototype.getBBox = function (element) {
        this.appendToChart(element);
        return element.getBBox();
    };
    /**
     * Element의 속성들을 지정하는 함수
     * @param {SVGSVGElement} element 속성을 지정할 Element 매개변수
     * @param {AttributeType[]} attributes 지정될 속성들인 매개변수 [{ property: string, value: string }]
     */
    Chart.prototype.setAttributes = function (element, attributes) {
        attributes.forEach(function (attribute) {
            element.setAttribute(attribute.property, attribute.value);
        });
    };
    /**
     * 사용자가 따로 지정한 Color(Gradient 등)를 지정하는 함수
     * @param colorSvgElement
     * @param position
     * @param gradientUnits
     * @returns {string} Defs에 지정된 Color ID 값
     */
    Chart.prototype.setCustomColor = function (colorSvgElement, position, gradientUnits) {
        if (position === void 0) { position = {
            x1: '',
            y1: '',
            x2: '',
            y2: '',
        }; }
        if (gradientUnits === void 0) { gradientUnits = 'objectBoundingBox'; }
        var randomId = 'flowbit_' + Math.random().toString(16);
        if (gradientUnits === 'userSpaceOnUse') {
            this.setAttributes(colorSvgElement, [
                { property: 'gradientUnits', value: gradientUnits },
                { property: 'id', value: randomId },
                { property: 'x1', value: position.x1 },
                { property: 'x2', value: position.x2 },
                { property: 'y1', value: position.y1 },
                { property: 'y2', value: position.y2 },
            ]);
        }
        else {
            this.setAttributes(colorSvgElement, [
                { property: 'gradientUnits', value: gradientUnits },
                { property: 'id', value: randomId },
            ]);
        }
        this.customColorContainer.append(colorSvgElement);
        return randomId;
    };
    /**
     * SVG Element을 생성하는 함수
     * @param {string} svgTag 생성할 SVG Tag 이름인 매개변수
     * @param {AttributeType[]} attributes 만들어진 SVG Tag에 적용될 속성들인 매개변수 [{ property: string, value: string }]
     * @returns {SVGSVGElement} 생성된 SVG Tag를 반환
     */
    Chart.prototype.createSvgElement = function (svgTag, attributes) {
        var newTag = document.createElementNS(this.svgNs, svgTag);
        if (attributes !== undefined) {
            this.setAttributes(newTag, attributes);
        }
        return newTag;
    };
    /**
     * 부모 Element에 자식 Element들을 추가하는 함수
     * @param {SVGSVGElement | Element} parent 부노
     * @param {SVGSVGElement[] | Element[]} childs
     * @returns
     */
    Chart.prototype.appendChilds = function (parent, childs) {
        childs.forEach(function (child) { return parent.appendChild(child); });
    };
    /**
     * Chart에 자식 Element를 추가하는 함수
     * @param {SVGSVGElement | Element} child Chart에 추가할 Element
     */
    Chart.prototype.appendToChart = function (child) {
        this.chart.appendChild(child);
    };
    /**
     * Y 라벨에 표시되는 최대 값 최소 값 범위를 설정하는 함수
     * @param max Y 라벨에 표시되는 최대 값
     * @param min Y 라벨에 표시되는 최소 값
     */
    Chart.prototype.setMinMaxData = function () {
        var _this = this;
        var newMax = 0;
        var newMin = 0;
        if (this.zoom) {
            // 줌인 줌 아웃 기능 활성화 시에 사용됨
            // Set min, max data for datas
            var newMaxList_1 = [];
            var newMinList_1 = [];
            this.datas.forEach(function (_) {
                var data = _.data;
                var startIndex = _this.maxChartDataCount - _this.showDataCount;
                newMinList_1.push(Math.min.apply(Math, data.slice(startIndex)));
                newMaxList_1.push(Math.max.apply(Math, data.slice(startIndex)));
            });
            // Set average of the range of min and max
            newMax = Math.max.apply(Math, newMaxList_1);
            newMin = Math.min.apply(Math, newMinList_1);
        }
        else {
            newMax = Math.max.apply(Math, this.datas.map(function (data) { return data.max; }));
            newMin = Math.min.apply(Math, this.datas.map(function (data) { return data.min; }));
        }
        var averageOfMinMax = (newMax - newMin) / this.yAxisCount;
        this.maxData = newMax + averageOfMinMax;
        this.minData = newMin - averageOfMinMax;
    };
    return Chart;
}());
