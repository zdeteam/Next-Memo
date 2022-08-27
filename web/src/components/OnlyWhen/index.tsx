import { ReactNode } from "react";

interface OnlyWhenProps {
  children: ReactNode;
  when: boolean;
}

const Index: React.FC<OnlyWhenProps> = (props: OnlyWhenProps) => {
  const { children, when } = props;
  return when ? <>{children}</> : null;
};

const Only = Index;

export default Only;
