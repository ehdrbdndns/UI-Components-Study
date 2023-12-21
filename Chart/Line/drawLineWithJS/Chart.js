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
        this.defaultColor = '#fff';
        this.zoom = false; // 줌인, 줌아웃 기능 추가 여부
        /**
         * Chart의 Padding(상하좌우)를 설정하는 함수
         */
        this.setSVGPadding = function () {
            var textLength = _this.getTextLength(_this.maxData + '');
            _this.padding = __assign(__assign({}, _this.padding), { 
                // mix font-size and datas.length
                bottom: _this.fontSize * 5, top: _this.fontSize * 5 + _this.datas.length * 25, left: textLength * 2, right: textLength });
        };
        /**
         * SVG 기본 값을 설정하는 함수
         */
        this.setSVGElement = function () {
            // Create SVG Container
            _this.chart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            // Set ViewBox
            _this.chart.setAttribute('viewBox', "0 0 ".concat(_this.width, " ").concat(_this.hegiht));
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
            _this.appendToChart(Axis);
        };
        /**
         * X, Y축의 라벨을 설정하는 함수
         */
        this.setLabel = function () {
            var gTagOfText = _this.createSvgElement('g', [
                { property: 'fill', value: '#fff' },
                { property: 'font-size', value: _this.fontSize + 'px' },
                { property: 'class', value: 'labels' },
                { property: 'text-anchor', value: 'end' },
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
            _this.appendChilds(gTagOfText, [gTagOfXLabel, gTagOfYLabel]);
            _this.appendToChart(gTagOfText);
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
            _this.appendToChart(gTagOfLine);
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
                // SET Poly Line
                var _a = _this.datas[i], data = _a.data, customColor = _a.customColor, width = _a.width;
                var pointList = [];
                if (_this.zoom) {
                    // 줌인 줌아웃 기능 활성화한 버전
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
                }
                else {
                    // 줌인 줌아웃 기능 비활성화 버전
                    pointList = data.map(function (value, j) {
                        var x = (j / _this.datas[0].data.length) *
                            (_this.width - _this.padding.left - _this.padding.right) +
                            _this.padding.left;
                        var y = _this.hegiht -
                            _this.padding.top -
                            _this.padding.bottom -
                            (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                                ((value - _this.minData) / (_this.maxData - _this.minData)) +
                            _this.padding.top;
                        return "".concat(x, ",").concat(y);
                    });
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
                    { property: 'r', value: '30' },
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
                                _this.appendChilds(_this.customColorDefs, [radialGradientTag]);
                                color = "url('#".concat(circleId, "')");
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                ]);
                _this.appendChilds(gTagOfPolyLine, [polyLine, lastPoint]);
            };
            for (var i = 0; i < _this.datas.length; i++) {
                _loop_1(i);
            }
            // 데이터의 영역 설정(커서 표시)
            var Area = _this.setArea({
                x: _this.padding.left + '',
                y: _this.padding.top + '',
                width: _this.width - _this.padding.right - _this.padding.left + '',
                height: _this.hegiht - _this.padding.top - _this.padding.bottom + '',
            });
            Area.style.cursor =
                'url("https://www.bithumb.com/react/charting_library/sta…es/crosshair.6c091f7d5427d0c5e6d9dc3a90eb2b20.cur"),crosshair';
            _this.appendChilds(gTagOfPolyLine, [Area]);
            _this.appendToChart(gTagOfPolyLine);
        };
        /**
         * Chart의 데이터 영역을 지정하는 함수
         * 줌인 줌 아웃 등 여러 이벤트 영역에 필요한 범위를 설정함
         * @param {x: string, y: width: string, hegiht: string} param
         * @returns SVGElement
         */
        this.setArea = function (_a) {
            var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
            var Area = _this.createSvgElement('rect', [
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
            _this.appendToChart(gTagOfLegend);
        };
        /**
         * Chart의 Zoom 기능을 설정하는 함수
         */
        this.setZoomAction = function () {
            _this.chart.addEventListener('mousewheel', function (e) {
                var _a, _b, _c;
                e.preventDefault();
                // 데이터 범위 재조정
                if (e.deltaY > 0) {
                    // Scroll Down
                    if (_this.showDataCount > 4)
                        _this.showDataCount -= 3;
                }
                else {
                    // Scroll Up
                    if (_this.showDataCount < _this.maxChartDataCount - 3)
                        _this.showDataCount += 3;
                }
                // TODO 축을 새로 생성할 필요 없이 flowchart_data를 감싸는 또 다른 g태그를 만들자
                // 차트 데이터의 최대 최소 값 재설정
                _this.setMinMaxData();
                // 차트 라벨 다시 그리기
                (_a = document.getElementById('flowbit_label')) === null || _a === void 0 ? void 0 : _a.remove();
                _this.setLabel();
                // 재조정 된 데이터 다시 셋팅
                (_b = document.getElementById('flowbit_datas')) === null || _b === void 0 ? void 0 : _b.remove();
                _this.setPoints();
                // 데이터가 축 위로 올라오는 현상을 방지하기 위해 다시 셋팅
                (_c = document.getElementById('flowbit_axios')) === null || _c === void 0 ? void 0 : _c.remove();
                _this.setAxis();
            });
        };
        /**
         * Chart의 Interaction 기능을 설정하는 함수
         */
        this.setInteraction = function () {
            if (_this.zoom)
                _this.setZoomAction();
        };
        /**
         * Chart를 그리는 함수
         */
        this.render = function () {
            // 컨테이너 크기 및 Axios 구축
            // Make SVG Container
            _this.setSVGElement();
            // 1. Set Padding
            _this.setSVGPadding();
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
        var datas = data.datas, size = data.size, targetId = data.targetId, labels = data.labels, _b = data.zoom, zoom = _b === void 0 ? false : _b, showDataCount = data.showDataCount, showLabelCount = data.showLabelCount;
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
        this.maxChartDataCount = Math.max.apply(Math, datas.map(function (data) { return data.data.length; }));
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
        var randomId = 'flowbitChart' + Math.random().toString(16);
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
        this.customColorDefs.append(colorSvgElement);
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
            var newMax = Math.max.apply(Math, newMaxList_1);
            var newMin = Math.min.apply(Math, newMinList_1);
            var averageOfMinMax = (newMax - newMin) / this.yAxisCount;
            this.maxData = newMax + averageOfMinMax;
            this.minData = newMin - averageOfMinMax;
        }
        else {
            this.maxData = Math.max.apply(Math, this.datas.map(function (data) { return data.max; }));
            this.minData = Math.min.apply(Math, this.datas.map(function (data) { return data.min; }));
        }
    };
    return Chart;
}());
