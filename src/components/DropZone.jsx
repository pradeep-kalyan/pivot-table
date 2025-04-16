import { useDrop } from "react-dnd";

function DropZone({ children, type, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "field", // Accept the type from draggable items
    drop: (item) => {
      onDrop(item);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Different highlight styles based on the drop zone type
  const getHighlightStyle = () => {
    if (!isOver) return "";

    if (type === "row") {
      return "ring-4 ring-blue-300 bg-blue-50";
    } else if (type === "column") {
      return "ring-4 ring-green-300 bg-green-50";
    }

    return "ring-4 ring-gray-300";
  };

  return (
    <div
      ref={drop}
      className={`flex-1 transition-all duration-200 ${
        isOver ? getHighlightStyle() : ""
      }`}
    >
      {children}
    </div>
  );
}

export default DropZone;
