import * as utils from "../../../../helpers/utils";
import { generateDialog } from "../../../../components/Dialog";
import "./index.less";

interface Props extends DialogProps {
  imgUrl: string;
}

const Index: React.FC<Props> = ({ destroy, imgUrl }: Props) => {
  const handleCloseBtnClick = () => {
    destroy();
  };

  const handleDownloadBtnClick = () => {
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `memos-${utils.getDateTimeString(Date.now())}.png`;
    a.click();
  };

  const handleImgContainerClick = () => {
    destroy();
  };

  return (
    <>
      <div className="btns-container">
        <button className="btn" onClick={handleCloseBtnClick}>
          {/*<Icon.X className="icon-img" />*/}
        </button>
        <button className="btn" onClick={handleDownloadBtnClick}>
          {/*<Icon.Download className="icon-img" />*/}
        </button>
      </div>
      <div className="img-container" onClick={handleImgContainerClick}>
        <img onClick={(e) => e.stopPropagation()} src={imgUrl} />
      </div>
    </>
  );
};

export default function showPreviewImageDialog(imgUrl: string): void {
  generateDialog(
    {
      className: "preview-image-dialog",
    },
    Index,
    { imgUrl }
  );
}
