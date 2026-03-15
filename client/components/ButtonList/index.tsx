import './ButtonList.css'

export interface ButtonListItem {
  display?: string
  value?: string | number
  backgroundColor?: string
  color?: string
  [key: string]: unknown
}

export interface ButtonListProps {
  items?: ButtonListItem[] | string[]
  getLabel?: (item: ButtonListItem | string, index: number) => string
  getKey?: (item: ButtonListItem | string, index: number) => string
  onSelect?: (item: ButtonListItem | string, index: number) => void
  className?: string
}

/**
 * Renders one button per item in an array.
 * Each item is a JSON object with: display (label), value (key/identifier), backgroundColor, color (text and outline).
 */
export default function ButtonList({
  items = [],
  getLabel = (item) =>
    typeof item === 'object' && item?.display != null ? item.display : String(item),
  getKey = (item, index) =>
    typeof item === 'object' && item?.value != null ? String(item.value) : String(index),
  onSelect,
  className,
}: ButtonListProps) {
  if (!items?.length) {
    return null
  }
  return (
    <div className={className ?? 'button-list'} role="group">
      {items.map((item, index) => {
        const obj = item as ButtonListItem
        const backgroundColor =
          typeof obj === 'object' && obj?.backgroundColor != null ? obj.backgroundColor : undefined
        const color =
          typeof obj === 'object' && obj?.color != null ? obj.color : undefined
        const hasCustomStyle = !!backgroundColor || !!color
        const style: Record<string, string> = {}
        if (backgroundColor) style['--button-background-color'] = backgroundColor
        if (color) style['--button-color'] = color
        return (
          <button
            key={getKey(obj, index)}
            type="button"
            onClick={onSelect ? () => onSelect(obj, index) : undefined}
            style={Object.keys(style).length ? style : undefined}
            className={hasCustomStyle ? 'button-list__button--colored' : undefined}
          >
            {getLabel(obj, index)}
          </button>
        )
      })}
    </div>
  )
}
