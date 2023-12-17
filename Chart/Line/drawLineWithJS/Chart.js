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
        this.yAxisCount = 10;
        this.maxData = 0; // y축에서 표현되는 가장 큰 수
        this.minData = 0; // y축에서 표현되는 가장 작은 수
        this.defaultColor = '#fff';
        /**
         * Chart의 Padding(상하좌우)를 설정하는 함수
         */
        this.setSVGPadding = function () {
            // 1. Y-Padding
            // find max y-label length
            // mix font-size and y-label length
            // 2. X-Padding
            _this.padding = __assign(__assign({}, _this.padding), { 
                // mix font-size and datas.length
                bottom: _this.fontSize * 5, top: _this.fontSize * 5 + _this.datas.length * 25, left: (_this.fontSize +
                    Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10) *
                    2, right: _this.fontSize + Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10 });
        };
        /**
         * SVG 기본 값을 설정하는 함수
         */
        this.setSVGElement = function () {
            // Make SVG Container
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
            ]);
            var gTagOfXLabel = _this.createSvgElement('g', [
                { property: 'text-anchor', value: 'middle' },
            ]);
            var gTagOfYLabel = _this.createSvgElement('g', [
                { property: 'dominant-baseline', value: 'central' },
            ]);
            // xLabel
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
            // yLabel
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x = _this.padding.left -
                    Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 3;
                var y = (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                    (i / _this.yAxisCount) +
                    _this.padding.top;
                var label = ((_this.yAxisCount - i) / _this.yAxisCount) *
                    (_this.maxData - _this.minData) +
                    _this.minData;
                var text = _this.createSvgElement('text', [
                    { property: 'x', value: x + '' },
                    { property: 'y', value: y + '' },
                ]);
                text.append(Math.floor(label) + '');
                gTagOfYLabel.appendChild(text);
            }
            // label box
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
            for (var i = 0; i <= _this.xAxisCount - 1; i++) {
                var x = (i / (_this.xAxisCount - 1)) *
                    (_this.width - _this.padding.left - _this.padding.right) +
                    _this.padding.left;
                var y1 = _this.hegiht - _this.padding.bottom;
                var y2 = _this.padding.top;
                var line = _this.createSvgElement('line', [
                    { property: 'x1', value: x + '' },
                    { property: 'x2', value: x + '' },
                    { property: 'y1', value: y1 + '' },
                    { property: 'y2', value: y2 + '' },
                ]);
                gTagOfLine.appendChild(line);
            }
            _this.appendToChart(gTagOfLine);
        };
        /**
         * Chart의 데이터 라인을 그리는 함수
         */
        this.setPoints = function () {
            // make g container
            var gTagOfPolyLine = _this.createSvgElement('g');
            gTagOfPolyLine.classList.add('datas');
            var _loop_1 = function (i) {
                var data = _this.datas[i];
                var pointList = data.data.map(function (value, j) {
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
                // set color
                // let customColor = data.customColor().border;
                var borderCustomColor = '';
                if (data.customColor) {
                    var customColorElement = data.customColor().border;
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
                                color = data.color;
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                    { property: 'fill', value: 'none' },
                    { property: 'stroke-width', value: data.width + '' },
                    { property: 'stroke-linecap', value: 'round' },
                    { property: 'stroke-linejoin', value: 'round' },
                ]);
                // draw last point circle
                var lastPointCustomColor = '';
                if (data.customColor) {
                    var customColorElement = data.customColor().lastPoint;
                    if (customColorElement) {
                        lastPointCustomColor = _this.setCustomColor(customColorElement);
                    }
                }
                // lase Circle에 사용될 좌표 값
                var lastPointPosition = pointList
                    .slice(-1)[0]
                    .split(',')
                    .map(function (point) { return Number(point); });
                // Gradient
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
                                        value: data.color === undefined ? _this.defaultColor : data.color,
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
                                        value: data.color === undefined ? _this.defaultColor : data.color,
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
            // set line
            for (var i = 0; i < _this.datas.length; i++) {
                _loop_1(i);
            }
            _this.appendToChart(gTagOfPolyLine);
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
         * Chart를 그리는 함수
         */
        this.render = function () {
            // 컨테이너 크기 및 Axios 구축
            // Make SVG Container
            _this.setSVGElement();
            // 1. Set Padding
            _this.setSVGPadding();
            // Draw GuideLine
            _this.setGuideLine();
            // 데이터 구축
            _this.setPoints();
            // Draw X and Y Axis
            _this.setAxis();
            // Draw X and Y Label
            _this.setLabel();
            // Draw Legend
            _this.setLegend();
        };
        var datas = data.datas, size = data.size, targetId = data.targetId, labels = data.labels;
        this.chart = this.createSvgElement('svg');
        this.targetId = targetId;
        this.width = size.width;
        this.hegiht = size.height;
        this.fontSize = size.font;
        this.datas = datas;
        this.labels = labels;
        this.xAxisCount = labels.length;
        this.maxData = Math.max.apply(Math, datas.map(function (data) { return data.max; }));
        this.minData = Math.min.apply(Math, datas.map(function (data) { return data.min; }));
        this.customColorDefs = this.createSvgElement('defs', [
            { property: 'class', value: 'customColor' },
        ]);
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
    return Chart;
}());
