"use client";
import { useEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator(); // generator instance for roughjs library to generate shapes on canvas

// function to create element to draw on canvas
const createDrawElement = (x1, y1, x2, y2, elementType) => {
  let roughElement;
  if (elementType === "line") {
    roughElement = generator.line(x1, y1, x2, y2);
  } else if (elementType === "rectengle") {
    roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  }
  return { x1, y1, x2, y2, elementType, roughElement };
};

// function to get distance between two points using pythagoras theorem
const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// function to check if mouse is withen element
const isWithenElement = (x, y, element) => {
  const { elementType, x1, x2, y1, y2 } = element;
  if (elementType === "rectengle") {
    // check if point is withen rectengle //
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
};

// function to get element at position x and y
const getElementPosition = (x, y, elements) => {
  return elements.find(element => isWithenElement(x, y, element));
};

/* ------------------------ */

/*---- Canvas component to draw shapes on canvas Start----*/
const CanvasDraw = () => {
  const [elements, setElements] = useState([]); //State to store elements drawn on canvas
  const [action, setAction] = useState("none"); //State to store action status
  const [elementType, setElementType] = useState("line"); //State to store element type to draw on canvas
  const [selectedElement, setSelectedElement] = useState(null); //State to store selected element
  // useEffect to set canvas width and height on window resize and draw shapes on canvas using roughjs
  useEffect(() => {
    const canvas = document.getElementById("canvas"); // get canvas element
    // set canvas width and height on window resize
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // draw shapes on canvas using roughjs
    const rc = rough.canvas(canvas);

    elements.forEach(({ roughElement }) => rc.draw(roughElement));
  }, [elements]);

  //function to handle mouse down event on canvas
  const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
    if (elementType === "select") {
      const element = getElementPosition(clientX, clientY, elements);
      console.log(element);
      if (element) {
        setSelectedElement(element);
        setAction("moving");
      }
    } else {
      const element = createDrawElement(
        clientX,
        clientY,
        clientX,
        clientY,
        elementType
      );
      setElements((prevState) => [...prevState, element]);

      setAction("drawing"); // set action status to true
    }
  };

  // function to handle mouse move event on canvas
  const handleMouseMove = (e) => {
    if (action !== "drawing") {
      return;
    }
    // get clientX and clientY from event and update last element in elements array with updated x2 and y2 values //
    const { clientX, clientY } = e; // get clientX and clientY from event
    const index = elements.length - 1; // get index of last element from elements array
    const { x1, y1 } = elements[index]; // get x1 and y1 from last element
    const updatedElement = createDrawElement(
      x1,
      y1,
      clientX,
      clientY,
      elementType
    ); // create updated element
    const elementsCopy = [...elements]; // create copy of elements array
    elementsCopy[index] = updatedElement; // update element at index
    setElements(elementsCopy); // set elements array with updated element
  };

  //function to handle mouse up event on canvas
  const handleMouseUp = (e) => {
    setAction("none");
  };

  /*----- return canvas element to draw shapes on canvas--------- */
  return (
    <div>
      <div className="fixed p-2">
        <h1 className="text-2xl font-bold text-center bg-black px-3 py-2 rounded-xl text-white mb-6">
          Nextjs Canvas Draw
        </h1>

        <div className="bg-red-100 p-3 rounded-xl">
          <div className="label cursor-pointer">
            <span className="label-text  text-xl mr-3">Select Element</span>
            <input
              type="radio"
              className="radio"
              id="select"
              checked={elementType === "select"}
              onChange={() => setElementType("select")}
            />
          </div>
          <div className="label cursor-pointer">
            <span className="label-text  text-xl mr-3">Line</span>
            <input
              type="radio"
              className="radio"
              id="line"
              checked={elementType === "line"}
              onChange={() => setElementType("line")}
            />
          </div>
          <div className="cursor-pointer label">
            <span className="label-text text-xl mr-3">Rectengle</span>
            <input
              type="radio"
              className="radio"
              id="line"
              checked={elementType === "rectengle"}
              onChange={() => setElementType("rectengle")}
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
