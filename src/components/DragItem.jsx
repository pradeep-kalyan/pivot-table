import { useDrag } from "react-dnd";

function DragItem({ header, type, moveItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "field", // Use a single type for all draggable items
    item: { header },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Colors based on the type
  const getColors = () => {
    switch (type) {
      case "row":
        return "border-blue-400 bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "column":
        return "border-green-400 bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "border-gray-400 bg-white text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div
      ref={drag}
      className={`p-2 border rounded cursor-move ${getColors()} ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={() => moveItem(header, type === "field" ? "row" : type)}
      title={`Drag to add '${header}' as a ${
        type === "field" ? "dimension" : type
      }`}
    >
      {header}
    </div>
  );
}

export default DragItem;
