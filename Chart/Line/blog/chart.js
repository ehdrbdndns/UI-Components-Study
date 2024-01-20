(() => {
  const svg = document.getElementById('chart');
  const ns = 'http://www.w3.org/2000/svg';

  const width = 1200;
  const height = 600;
  const padding = { left: 100, right: 100, top: 100, bottom: 100 };
  const data = [100, 150, 200, 70, 120, 190, 300, 310, 280, 400];
  const guidLineCount = 12;

  function createAxios() {
    const { left, right, top, bottom } = padding;
    const positionOfAxios = {
      xAxios: {
        x1: left,
        y1: height - bottom,
        x2: width - right,
        y2: height - bottom,
      },
      yAxios: {
        x1: left,
        y1: height - bottom,
        x2: left,
        y2: top,
      },
    };

    const xAxios = document.createElementNS(ns, 'line');
    const yAxios = document.createElementNS(ns, 'line');

    // X축 세팅
    xAxios.setAttribute('x1', positionOfAxios.xAxios.x1);
    xAxios.setAttribute('y1', positionOfAxios.xAxios.y1);
    xAxios.setAttribute('x2', positionOfAxios.xAxios.x2);
    xAxios.setAttribute('y2', positionOfAxios.xAxios.y2);
    xAxios.setAttribute('stroke', '#ccc');
    xAxios.setAttribute('strokeWidth', '.5');
    svg.appendChild(xAxios);

    // Y축 셋팅
    yAxios.setAttribute('x1', positionOfAxios.yAxios.x1);
    yAxios.setAttribute('y1', positionOfAxios.yAxios.y1);
    yAxios.setAttribute('x2', positionOfAxios.yAxios.x2);
    yAxios.setAttribute('y2', positionOfAxios.yAxios.y2);
    yAxios.setAttribute('stroke', '#ccc');
    yAxios.setAttribute('strokeWidth', '.5');
    svg.appendChild(yAxios);
  }

  function createGuidLine() {
    for (let i = 0; i < guidLineCount; i++) {
      const { left, right, top, bottom } = padding;

      const positionOfGuidLine = {
        x1: left,
        x2: width - right,
        y: (height - bottom - top) * (i / guidLineCount) + top,
      };

      const guidLine = document.createElementNS(ns, 'line');
      guidLine.setAttribute('x1', positionOfGuidLine.x1);
      guidLine.setAttribute('y1', positionOfGuidLine.y);
      guidLine.setAttribute('x2', positionOfGuidLine.x2);
      guidLine.setAttribute('y2', positionOfGuidLine.y);
      guidLine.setAttribute('stroke', '#ccc');
      guidLine.setAttribute('strokeWidth', '.5');

      svg.appendChild(guidLine);
    }
  }

  function createDataLine() {
    const { left, right, top, bottom } = padding;
    const maxData = Math.max(...data);

    let positionOfDataLine = [];
    for (let i = 0; i < data.length; i++) {
      let x = (i / (data.length - 1)) * (width - left - right) + left;
      let y = height - (data[i] / maxData) * (height - top - bottom) - bottom;
      positionOfDataLine.push(`${x},${y}`);
    }

    const polyLine = document.createElementNS(ns, 'polyline');
    polyLine.setAttribute('points', positionOfDataLine.join(' '));
    polyLine.setAttribute('stroke', 'hsla(170, 70%, 57%)');
    polyLine.setAttribute('fill', 'none');

    svg.appendChild(polyLine);
  }

  function draw() {
    createAxios();
    createGuidLine();
    createDataLine();
  }

  draw();
})();
