import React, { useRef, useEffect, useState } from 'react';
import space from 'color-space';

const ColorPicker = () => {
  const canvasRef = useRef(null);
  const [colorArray, setColorArray] = useState(Array(10).fill('#ffffff'));
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [distance, setDistance] = useState(0);
  const [angle, setAngle] = useState(0);
  const [colorNum, setColorNum] = useState(10);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const imageData = ctx.createImageData(width, height);
  
    // 只在第一次渲染時初始化 startX 和 startY
    const startX = Math.random() * radius;
    const startY = Math.random() * radius;
    setDistance(Math.sqrt(startX * startX + startY * startY));
    setAngle(Math.atan2(startY, startX));
    setMousePosition({ x: startX, y: startY });


  
    // 將 startX 和 startY 存入狀態或者做其他處理
  }, []); // 空陣列表示只在組件第一次渲染時執行

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    // 計算滑鼠位置相對於圓心的距離


    
    // Draw color wheel
    const drawColorWheel = () => {      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - radius;
          const dy = y - radius;
          const d = dx * dx + dy * dy;
          if (d <= radius * radius) {
            const angle = Math.atan2(dy, dx);
            // const hue = (angle + Math.PI) / (2 * Math.PI);
            // const saturation = Math.sqrt(d) / radius;
            // const value = 1;
            // // const rgb = hsvToRgb(hue, saturation, value);

            const l = 67.1;
            const u = 21.1 + 75*Math.cos(angle );
            const v = 11.2 + 75*Math.sin(angle );
            // console.log(angle + 2 * Math.PI, l,u,v);
            const rgb = space.luv.rgb([l,u,v]);
            const index = (y * width + x) * 4;
            pixels[index] = rgb[0];
            pixels[index + 1] = rgb[1];
            pixels[index + 2] = rgb[2];
            pixels[index + 3] = 255;
          } else {
            const index = (y * width + x) * 4;
            pixels[index] = 255;
            pixels[index + 1] = 255;
            pixels[index + 2] = 255;
            pixels[index + 3] = 0;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };

    drawColorWheel();


    // Event handlers
    const handleMouseDown = (e) => {
      setIsDragging(true);
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // pickColor(x, y);
      redraw(e);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - radius;
        const dy = y - radius;
        const d = Math.sqrt(dx * dx + dy * dy);
        setMousePosition({ x, y });
        setDistance(d);
        setAngle(Math.atan2(dy, dx));
        // pickColor(x, y);
        redraw(e)
      }
    };
    

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Cleanup event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    const redraw = (e) => {
      // Draw line and point function
      const drawLineAndPoint = (markerX, markerY) => {
        // Clear canvas
        // ctx.clearRect(0, 0, width, height);
        // drawColorWheel();

        // Draw point
        ctx.beginPath();
        ctx.font = "normal 100px Times New Roman";
        ctx.fillStyle = 'white';
        ctx.fillText("○", markerX+radius-30, markerY+radius+30)

        // 計算起點到終點的向量
        var dx = markerX + radius - radius;
        var dy = markerY + radius - radius;

        // 將向量的長度縮短一半
        var length = Math.sqrt(dx * dx + dy * dy);
        var newLength = length / 1.15;

        // 調整向量的長度
        dx *= newLength / length;
        dy *= newLength / length;

        // 新的終點位置
        var newX = radius + dx;
        var newY = radius + dy;

        // Draw line from center to point
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.lineTo(newX, newY);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        // ctx.closePath();
        
        
      };

      const calculateMarkerRGB = (x, y) => {
        const l = 67.1;
        // Calculate distance from the center
        var distanceFromCenter = Math.sqrt(x * x + y * y);
        // Calculate angle from the center
        var angleFromCenter = Math.atan2(y, x);
        // Calculate u (angle normalized between 0 and 1)
        var u = 21.1 + distanceFromCenter * Math.sin(angleFromCenter);
        // Calculate v (distance normalized between 0 and 1)
        var v = 11.2 + distanceFromCenter * Math.cos(angleFromCenter);
        // Return the RGB value
        return space.luv.rgb([l,u,v]);
      };

      const drawGeneral = (markerCount) => {
        const newColorsArray = [];
        const markerAngleIncrement = (2 * Math.PI) / markerCount;
        
        const x = mousePosition.x;
        const y = mousePosition.y;

        const dx = x - radius;
        const dy = y - radius;
        const d = Math.sqrt(dx * dx + dy * dy);
        setDistance(d);
        setAngle(Math.atan2(dy, dx));

        let angle = Math.atan2(dy, dx);
      
        for (let i = 0; i < markerCount; i++) {
          // 計算標記的最終位置
          const markerX = distance * Math.cos(angle);
          const markerY = distance * Math.sin(angle);
          const markerRGB = calculateMarkerRGB(markerX, markerY);
      
          // 在畫布上繪製標記
          drawLineAndPoint(markerX, markerY);
      
          // 將顏色加入顏色陣列
          newColorsArray.push(markerRGB);
      
          angle += markerAngleIncrement; // 更新角度
        }
      
        // 更新顏色陣列狀態
        setColorArray(newColorsArray);
      };
      
      // Draw line and point when mouse position changes
      // drawLineAndPoint();
      drawGeneral(colorNum);

    }

    redraw(0);
  
    
    // Cleanup function
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, mousePosition, colorNum]);

  

  // 生成新的隨機位置的函數
  const generateRandomPosition = () => {
    const canvas = canvasRef.current;
    const radius = canvas.width / 2;
    var startX = Math.random() * (2 * radius) - radius;
    var startY = Math.random() * (2 * radius) - radius;
    var minDistance = 50;

    do {
      startX = Math.random() * (2 * radius) - radius;
      startY = Math.random() * (2 * radius) - radius;
    } while (Math.sqrt(startX * startX + startY * startY) < minDistance);

    setDistance(Math.sqrt(startX * startX + startY * startY));
    setAngle(Math.atan2(startY, startX));
    setMousePosition({ x: startX, y: startY });


  }

  // rgb to hex
  function rgbToHex(r,g,b) {
    let redValue = parseInt(Number(r)).toString(16)
    let greenValue = parseInt(Number(g)).toString(16)
    let blueValue = parseInt(Number(b)).toString(16)

    
    return `#${redValue.padStart(2, '0')}${greenValue.padStart(2, '0')}${blueValue.padStart(2, '0')}`
  }

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={300} style={{ cursor: 'crosshair' }} />
      <br/>
      <button onClick={() => {
        generateRandomPosition(); // 調用生成新位置的函數
      }}>Randomize Position</button>
      <div style={{ display: 'flex', marginTop: '20px' }}>
        {colorArray.map((color, index) => (
          <div
            key={index}
            style={{ width: '100px', height: '50px', backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`, marginRight: '5px', width: '50%'}}
          >{rgbToHex(color[0], color[1], color[2])}</div>
        ))}
      </div>
      <br/>
      <label htmlFor="colorNumInput">Numbers of Color you want: </label>
      <input type="number" value={colorNum} onChange={(e) => setColorNum(parseInt(e.target.value))}/>
    </div>  );
};

export default ColorPicker;
