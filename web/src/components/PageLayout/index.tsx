import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Sticky } from "@/components";
import "./index.less";

interface Props {
  children: ReactNode;
  className: string;
  title?: string;
  onClickLeft?: () => void;
}

const PageLayout = (props: Props) => {
  const navigation = useNavigate();

  return (
    <div className="page-layout">
      {props.title && (
        <Sticky>
          <NavBar title={props.title} leftText="返回" onClickLeft={props.onClickLeft} />
        </Sticky>
      )}
      <div className={"body " + props.className}>{props.children}</div>
    </div>
  );
};

export default PageLayout;
