import { useDrop } from "react-dnd";

function DropZone({ children, type, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "field", // Accept items with type "field"
    drop: (item) => {
      // Handle the drop with the item's data
      onDrop(item);
      return { name: type, dropped: true };
    },
    canDrop: (item) => {
      // Prevent dropping an item from rows onto rows or columns onto columns
      // This prevents duplicate fields in the same section
      return item.sourceType !== type;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && monitor.isOver(),
    }),
  }));

  // Different highlight styles based on the drop zone type
  const getHighlightStyle = () => {
    if (!isOver) return "";
    
    if (!canDrop) {
      return "ring-4 ring-red-300"; // Visual feedback for invalid drops
    }

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
        isOver && !canDrop ? "cursor-no-drop" : ""
      } ${getHighlightStyle()}`}
    >
      {children}
    </div>
  );
}

export default DropZone;