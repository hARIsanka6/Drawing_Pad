const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let color = 'black';
let size = 20;
let isPressed = false;
let currentTool = 'brush';
let shapes = []; 
let currentBrushStroke = null; 
let previewShape = null; 

const sizeDisplay = document.getElementById('sizeDisplay');
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const resetBtn = document.getElementById('reset');
const colorPicker = document.getElementById('colorPicker');
const brushBtn = document.getElementById('brush');
const rectBtn = document.getElementById('rectangle');
const circleBtn = document.getElementById('circle');
const lineBtn = document.getElementById('line');

updateSizeDisplay();


increaseBtn.addEventListener('click', () => {
    size += 5;
    if (size > 50) size = 50;
    updateSizeDisplay();
});

decreaseBtn.addEventListener('click', () => {
    size -= 5;
    if (size < 5) size = 5;
    updateSizeDisplay();
});

resetBtn.addEventListener('click', resetCanvas);
colorPicker.addEventListener('input', (e) => color = e.target.value);


brushBtn.addEventListener('click', () => {
    currentTool = 'brush';
    setActiveButton(brushBtn);
});
rectBtn.addEventListener('click', () => {
    currentTool = 'rectangle';
    setActiveButton(rectBtn);
});
circleBtn.addEventListener('click', () => {
    currentTool = 'circle';
    setActiveButton(circleBtn);
});
lineBtn.addEventListener('click', () => {
    currentTool = 'line';
    setActiveButton(lineBtn);
});


canvas.addEventListener('mousedown', (e) => {
    isPressed = true;
    const pos = getMousePos(canvas, e);
    
    if (currentTool === 'brush') {
        
        currentBrushStroke = {
            type: 'brush',
            points: [{ x: pos.x, y: pos.y }],
            color,
            size
        };
        shapes.push(currentBrushStroke);
        drawCircle(pos.x, pos.y);
    } else {
        
        previewShape = {
            type: currentTool,
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y,
            color,
            size
        };
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!isPressed) return;
    isPressed = false;
    
    const pos = getMousePos(canvas, e);
    
    if (currentTool !== 'brush' && previewShape) {
        
        shapes.push({
            type: currentTool,
            startX: previewShape.startX,
            startY: previewShape.startY,
            endX: pos.x,
            endY: pos.y,
            color,
            size
        });
    }
    
    currentBrushStroke = null;
    previewShape = null;
    redrawCanvas();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isPressed) return;
    const pos = getMousePos(canvas, e);
    
    if (currentTool === 'brush' && currentBrushStroke) {
        
        currentBrushStroke.points.push({ x: pos.x, y: pos.y });
        
        
        drawCircle(pos.x, pos.y);
        
        
        if (currentBrushStroke.points.length > 1) {
            const prevPoint = currentBrushStroke.points[currentBrushStroke.points.length - 2];
            drawLine(prevPoint.x, prevPoint.y, pos.x, pos.y);
        }
    } else if (previewShape) {
        
        previewShape.endX = pos.x;
        previewShape.endY = pos.y;
        redrawCanvas();
    }
});


function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}


function drawCircle(x, y, radius = size, fillColor = color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 2;
    ctx.stroke();
}

function drawRectangle(shape) {
    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;
    ctx.beginPath();
    ctx.rect(shape.startX, shape.startY, width, height);
    ctx.fillStyle = shape.color;
    ctx.fill();
}

function drawShapeCircle(shape) {
    const radius = Math.sqrt(
        Math.pow(shape.endX - shape.startX, 2) + 
        Math.pow(shape.endY - shape.startY, 2)
    );
    ctx.beginPath();
    ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
    ctx.fillStyle = shape.color;
    ctx.fill();
}

function drawShapeLine(shape) {
    ctx.beginPath();
    ctx.moveTo(shape.startX, shape.startY);
    ctx.lineTo(shape.endX, shape.endY);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.stroke();
}


function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    shapes.forEach(shape => {
        ctx.fillStyle = shape.color;
        ctx.strokeStyle = shape.color;
        
        switch(shape.type) {
            case 'brush':
                
                shape.points.forEach(point => {
                    drawCircle(point.x, point.y, shape.size, shape.color);
                });
                
                
                ctx.lineWidth = shape.size * 2;
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                ctx.stroke();
                break;
                
            case 'rectangle':
                drawRectangle(shape);
                break;
                
            case 'circle':
                drawShapeCircle(shape);
                break;
                
            case 'line':
                drawShapeLine(shape);
                break;
        }
    });
    
    
    if (previewShape) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        switch(previewShape.type) {
            case 'rectangle':
                drawRectangle(previewShape);
                break;
            case 'circle':
                drawShapeCircle(previewShape);
                break;
            case 'line':
                drawShapeLine(previewShape);
                break;
        }
        
        ctx.restore();
    }
}

function resetCanvas() {
    shapes = [];
    redrawCanvas();
    size = 20;
    updateSizeDisplay();
}

function updateSizeDisplay() {
    sizeDisplay.textContent = size;
}

function setActiveButton(button) {
    
    document.querySelectorAll('.tool-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
}