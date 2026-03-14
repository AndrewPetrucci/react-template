import './ButtonList.css'

/**
 * Renders one button per item in an array.
 * Each item is a JSON object with: display (label), value (key/identifier), backgroundColor, color (text and outline).
 */
export default function ButtonList({
  items = [],
  getLabel = (item) => (typeof item === 'object' && item?.display != null ? item.display : String(item)),
  getKey = (item, index) => (typeof item === 'object' && item?.value != null ? String(item.value) : String(index)),
  onSelect,
  className,
}) {
  if (!items?.length) {
    return null
  }
  return (
    <div className={className ?? 'button-list'} role="group">
      {items.map((item, index) => {
        const backgroundColor = typeof item === 'object' && item?.backgroundColor != null ? item.backgroundColor : undefined
        const color = typeof item === 'object' && item?.color != null ? item.color : undefined
        const hasCustomStyle = backgroundColor || color
        const style = {}
        if (backgroundColor) style['--button-background-color'] = backgroundColor
        if (color) style['--button-color'] = color
        return (
          <button
            key={getKey(item, index)}
            type="button"
            onClick={onSelect ? () => onSelect(item, index) : undefined}
            style={Object.keys(style).length ? style : undefined}
            className={hasCustomStyle ? 'button-list__button--colored' : undefined}
          >
            {getLabel(item)}
          </button>
        )
      })}
    </div>
  )
}
