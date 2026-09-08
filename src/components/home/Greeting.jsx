export default function Greeting({ name = "김민준" }) {
  return (
    <div className="greeting">
      <div>
        <p>안녕하세요 👋</p>
        <h1 id="home-title">{name}님</h1>
      </div>
    </div>
  );
}
