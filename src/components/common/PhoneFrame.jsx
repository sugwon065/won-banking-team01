import "./phone-frame.css";

// 기기 외형과 상태바는 장식용 목업이며 실제 기기 상태를 나타내지 않습니다.
export default function PhoneFrame({ children }) {
  return (
    <div className="phone-stage">
      <div className="device-frame">
        <span className="device-key device-key-volume" aria-hidden="true" />
        <span className="device-key device-key-power" aria-hidden="true" />
        <div className="device-screen">
          <div className="device-status" aria-hidden="true">
            <span className="device-time">9:41</span>
            <span className="device-camera"><span /></span>
            <span className="device-indicators">
              <svg width="17" height="14" viewBox="0 0 17 14" fill="currentColor">
                <rect x="0" y="9" width="3" height="5" rx="1" />
                <rect x="4.5" y="6" width="3" height="8" rx="1" />
                <rect x="9" y="3" width="3" height="11" rx="1" />
                <rect x="13.5" y="0" width="3" height="14" rx="1" />
              </svg>
              <svg width="17" height="14" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M2 4a13 13 0 0 1 16 0M5 8a8 8 0 0 1 10 0M8 12a3 3 0 0 1 4 0" />
                <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span className="device-battery"><span /></span>
            </span>
          </div>
          {children}
          <div className="device-home-bar" aria-hidden="true"><span /></div>
        </div>
      </div>
    </div>
  );
}
