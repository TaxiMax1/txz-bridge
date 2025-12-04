import NotificationWrapper from "./notificationWrapper";
import ProgressWrapper from "./progressWrapper"

function DevIndex() {
  return (
    <>
      <NotificationWrapper />
      <ProgressWrapper />
      <img src="https://i.ytimg.com/vi/P-rSm8ygDV4/maxresdefault.jpg" style={{ width: "100%", height: "100%", backgroundClip: "border-box", backgroundSize: "cover", backgroundPosition: "center" }} alt="Maxresdefault" />
    </>
  );
}

export default DevIndex;