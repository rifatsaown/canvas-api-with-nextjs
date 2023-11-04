"use client";
import { useEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator(); // Create a generator instance for roughjs library to generate shapes on the canvas

// Function to create a draw element (line or rectangle)
function createElement(id, x1, y1, x2, y2, elementType) {
    let roughElement;
    if (elementType === "line") {
        roughElement = generator.line(x1, y1, x2, y2);
    } else if (elementType === "rectangle") {
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    }
    return { id, x1, y1, x2, y2, elementType, roughElement };
}

// Function to calculate the distance between two points
function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Function to check if the mouse cursor is within an element
function isWithinElement(x, y, element) {
    const { elementType, x1, x2, y1, y2 } = element;
    if (elementType === "rectangle") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else {
        const a = { x: x1, y: y1 };
        const b = { x: x2, y: y2 };
        const c = { x, y };
        const offset = distance(a, b) - (distance(a, c) + distance(b, c));
        return Math.abs(offset) < 1;
    }
}

// Function to get the element at a given position (x, y)
function getElementPosition(x, y, elements) {
    return elements.find((element) => isWithinElement(x, y, element));
}

// CanvasDraw component
const CanvasDraw = () => {
    const [elements, setElements] = useState([]); // State to store elements drawn on the canvas
    const [action, setAction] = useState("none"); // State to store the current action status
    const [elementType, setElementType] = useState("line"); // State to store the current element type
    const [selectedElement, setSelectedElement] = useState(null); // State to store the selected element

    // useEffect to set the canvas width and height on window resize and draw shapes on the canvas using roughjs
    useEffect(() => {
        const canvas = document.getElementById("canvas"); // Get the canvas element
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        const rc = rough.canvas(canvas);
        elements.forEach(({ roughElement }) => rc.draw(roughElement)); // Draw shapes on the canvas using roughjs
    }, [elements]);

    // Function to update an element in the elements array
    const updateElement = (id, x1, y1, x2, y2, elementType) => {
        const updatedElement = createElement(id, x1, y1, x2, y2, elementType);
        const elementsCopy = [...elements];
        elementsCopy[id] = updatedElement;
        setElements(elementsCopy);
    };

    // Function to handle mouse down event on the canvas
    const handleMouseDown = (event) => {
        const { clientX, clientY } = event;
        if (elementType === "select") {
            const element = getElementPosition(clientX, clientY, elements);
            if (element) {
                const offsetX = clientX - element.x1;
                const offsetY = clientY - element.y1;
                setSelectedElement({ ...element, offsetX, offsetY });
                setAction("moving");
            }
        } else {
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, elementType);
            setElements((prevState) => [...prevState, element]);
            setAction("drawing");
        }
    };

    // Function to handle mouse move event on the canvas
    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        if (action === "drawing") {
            const index = elements.length - 1;
            const { x1, y1 } = elements[index];
            updateElement(index, x1, y1, clientX, clientY, elementType);
        } else if (action === "moving") {
            const { id, x1, x2, y1, y2, elementType, offsetX, offsetY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1;
            const newX1 = clientX - offsetX;
            const newY1 = clientY - offsetY;
            updateElement(id, newX1, newY1, newX1 + width, newY1 + height, elementType);
        }
    };

    // Function to handle mouse up event on the canvas
    const handleMouseUp = () => {
        setAction("none");
        setSelectedElement(null);
    };

    return (
        <div>
            <div className="fixed p-2">
                <h1 className="text-2xl font-bold text-center bg-black px-3 py-2 rounded-xl text-white mb-6">
                    Next.js Canvas Draw
                </h1>

                <div className="bg-red-100 p-3 rounded-xl">

                    <div className="label cursor-pointer">
                        <label htmlFor="select" className="label-text text-xl">
                            Select Element
                        </label>
                        <input
                            type="radio"
                            className="radio"
                            id="select"
                            checked={elementType === "select"}
                            onChange={() => setElementType("select")}
                        />
                    </div>
                    <div className="label cursor-pointer">
                        <label htmlFor="line" className="label-text text-xl">
                            Line
                        </label>
                        <input
                            type="radio"
                            className="radio"
                            id="line"
                            checked={elementType === "line"}
                            onChange={() => setElementType("line")}
                        />

                    </div>
                    <div className="label cursor-pointer">
                        <label htmlFor="rectangle" className="label-text text-xl">
                            Rectangle
                        </label>
                        <input
                            type="radio"
                            className="radio"
                            id="rectangle"
                            checked={elementType === "rectangle"}
                            onChange={() => setElementType("rectangle")}
                        />

                    </div>
                </div>
            </div>
            <canvas
                className="bg-blue-200"
                id="canvas"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            ></canvas>
        </div>
    );
};

export default CanvasDraw;
