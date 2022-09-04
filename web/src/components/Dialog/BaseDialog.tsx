import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { GoX } from "react-icons/go";
import { ANIMATION_DURATION, DAILY_TIMESTAMP } from "../../helpers/consts";
import store from "../../store";
import "../../less/base-dialog.less";
import { ThemeProvider } from "@strapi/design-system/ThemeProvider";
import { lightTheme } from "@strapi/design-system/themes";

interface DialogConfig {
  className: string;
  title?: string;
  clickSpaceDestroy?: boolean;
}

interface Props extends DialogConfig, DialogProps {
  children: React.ReactNode;
}

const BaseDialog: React.FC<Props> = (props: Props) => {
  const { children, className, clickSpaceDestroy, destroy, title } = props;
  console.log('props',props)
  const handleSpaceClicked = () => {
    if (clickSpaceDestroy) {
      destroy();
    }
  };

  return (
    <div className={`dialog-wrapper ${className}`} onClick={handleSpaceClicked}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header-container">
          <span>{title}</span>
          <GoX onClick={destroy} />
        </div>
        {children}
      </div>
    </div>
  );
};

export function generateDialog<T extends DialogProps>(
  config: DialogConfig,
  DialogComponent: React.FC<T>,
  props?: Omit<T, "destroy">
): DialogCallback {
  const tempDiv = document.createElement("div");
  const dialog = createRoot(tempDiv);
  document.body.append(tempDiv);

  setTimeout(() => {
    tempDiv.firstElementChild?.classList.add("showup");
  }, 0);

  const cbs: DialogCallback = {
    destroy: () => {
      tempDiv.firstElementChild?.classList.remove("showup");
      tempDiv.firstElementChild?.classList.add("showoff");
      setTimeout(() => {
        dialog.unmount();
        tempDiv.remove();
      }, ANIMATION_DURATION);
    },
  };

  const dialogProps = {
    ...props,
    destroy: cbs.destroy,
  } as T;

  const Fragment = (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <BaseDialog destroy={cbs.destroy} clickSpaceDestroy={true} {...config}>
          <DialogComponent {...dialogProps} />
        </BaseDialog>
      </ThemeProvider>
    </Provider>
  );

  dialog.render(Fragment);

  return cbs;
}
