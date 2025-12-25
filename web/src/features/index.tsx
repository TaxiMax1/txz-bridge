import NotificationWrapper from "./notificationWrapper";
import ProgressWrapper from "./progressWrapper"
import TextUIWrapper from "./textuiWrapper"
import ContextUIWrapper from "./contextWrapper"
import TimeLine from "./timeline";

function DevIndex() {
  return (
    <>
      <NotificationWrapper />
      <ProgressWrapper />
      <TextUIWrapper />
      <ContextUIWrapper />
      <TimeLine />
      {/* <img src="https://i.ytimg.com/vi/P-rSm8ygDV4/maxresdefault.jpg" style={{ width: "100%", height: "100%", backgroundClip: "border-box", backgroundSize: "cover", backgroundPosition: "center" }} alt="Maxresdefault" /> */}
    </>
  );
}

export default DevIndex;