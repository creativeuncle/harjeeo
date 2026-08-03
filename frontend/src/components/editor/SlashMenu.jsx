import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const SlashMenu = forwardRef(function SlashMenu({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  function selectItem(index) {
    const item = items[index];
    if (item) command(item);
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <div className="harjeeo-slash-menu">
        <div className="harjeeo-slash-item">No results</div>
      </div>
    );
  }

  return (
    <div className="harjeeo-slash-menu">
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          data-selected={index === selectedIndex}
          className="harjeeo-slash-item"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => selectItem(index)}
        >
          <span className="harjeeo-slash-item-icon">
            <item.icon size={16} strokeWidth={1.8} />
          </span>
          <span className="harjeeo-slash-item-label">{item.title}</span>
        </button>
      ))}
    </div>
  );
});

export default SlashMenu;
