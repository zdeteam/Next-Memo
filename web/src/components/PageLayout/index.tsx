import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Sticky } from "@/components";
import "./index.less";

interface Props {
  children: ReactNode;
  className: string;
  title?: string;
  hiddenBar?: boolean;
  onClickLeft?: () => void;
}

const PageLayout = (props: Props) => {
  const navigate = useNavigate();

  return (
    <div className="page-layout">
      {!props.hiddenBar && (
        <Sticky>
          <NavBar title={props.title} leftText="返回" onClickLeft={() => navigate(-1)} />
        </Sticky>
      )}
      <div className={"body " + props.className}>{props.children}</div>
    </div>
  );
};

export default PageLayout;
