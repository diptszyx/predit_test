import Joyride, { type Props as JoyrideProps } from "react-joyride";

const JoyrideComponent = Joyride as unknown as React.ComponentType<JoyrideProps>;

export default function JoyrideCustom(props: JoyrideProps) {
  return <JoyrideComponent {...props} />;
}