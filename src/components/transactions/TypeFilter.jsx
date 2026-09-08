import { useId } from "react";

const types = [
  { value: "all", label: "전체" },
  { value: "in", label: "입금" },
  { value: "out", label: "출금" },
];

export default function TypeFilter({ value, onChange }) {
  const name = useId();
  return (
    <div className="history-filter" role="group" aria-label="거래 유형">
      {types.map((type) => (
        <label key={type.value}>
          <input className="sr-only" type="radio" name={name}
            value={type.value} checked={value === type.value}
            onChange={(event) => onChange(event.target.value)} />
          {type.label}
        </label>
      ))}
    </div>
  );
}
