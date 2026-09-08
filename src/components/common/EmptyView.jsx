import "./common.css";

export default function EmptyView({ message = "조회된 내역이 없습니다." }) {
  return <div className="common-state" role="status"><p>{message}</p></div>;
}
