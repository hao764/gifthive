type Props = {
  /** 单条文本项，会被循环重复 */
  items: string[];
  /** 分隔符，默认 ✦ */
  separator?: string;
  className?: string;
  /** 反色版（深底用） */
  dark?: boolean;
};

/**
 * 装饰性跑马灯 —— 编辑杂志常见的横向滚动条
 * 内容会被复制一份以保证无缝循环
 */
export default function Marquee({
  items,
  separator = "✦",
  className = "",
  dark = false,
}: Props) {
  const row = (
    <div className="marquee-track" aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`font-display text-sm italic ${
              dark ? "text-cream/70" : "text-ink/55"
            }`}
          >
            {item}
          </span>
          <span
            className={`mx-6 text-[0.6rem] ${
              dark ? "text-ember-soft" : "text-ember-deep"
            }`}
          >
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`mask-fade-x overflow-hidden ${className}`}
      role="presentation"
    >
      {/* 🎯 动画放在外层 flex 上：让两份 track 作为整体平移 -50%，实现无缝循环 */}
      <div className="flex w-max animate-marquee">
        {row}
        {row}
      </div>
    </div>
  );
}
