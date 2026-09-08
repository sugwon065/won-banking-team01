const STEPS = [
  { id: "info", no: 1, label: "정보 입력" },
  { id: "review", no: 2, label: "내용 확인" },
  { id: "done", no: 3, label: "완료" },
];

/* 진행 상태만 보여주는 인디케이터입니다.
   클릭으로 단계를 건너뛸 수 없게 button 이 아닌 span 으로 둡니다. */
export default function TransferProgress({ step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="flow-progress" aria-label="이체 단계">
      {STEPS.map((s, i) => (
        <span
          key={s.id}
          className={i <= currentIndex ? "is-active" : undefined}
          aria-current={s.id === step ? "step" : undefined}
        >
          <b>{s.no}</b>
          {s.label}
        </span>
      ))}
    </div>
  );
}