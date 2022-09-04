import { useEffect, useState } from "react";
import * as utils from "../../../../helpers/utils";
import useI18n from "../../../../hooks/useI18n";
import useLoading from "../../../../hooks/useLoading";
import { resourceService } from "../../../../services";
import Dropdown from "../../../../components/Dropdown";
import { generateDialog } from "../../../../components/Dialog";
import { showCommonDialog } from "../../../../components/Dialog/CommonDialog";
import { Toast } from "@/components";
import "./index.less";

type Props = DialogProps;

interface State {
  resources: Resource[];
  isUploadingResource: boolean;
}

const Index: React.FC<Props> = (props: Props) => {
  const { destroy } = props;
  const { t } = useI18n();
  const loadingState = useLoading();
  const [state, setState] = useState<State>({
    resources: [],
    isUploadingResource: false,
  });

  useEffect(() => {
    fetchResources()
      .catch((error) => {
        console.error(error);
        Toast.info(error.response.data.message);
      })
      .finally(() => {
        loadingState.setFinish();
      });
  }, []);

  const fetchResources = async () => {
    const data = await resourceService.getResourceList();
    setState({
      ...state,
      resources: data,
    });
  };

  const handleUploadFileBtnClick = async () => {
    if (state.isUploadingResource) {
      return;
    }

    const inputEl = document.createElement("input");
    inputEl.style.position = "fixed";
    inputEl.style.top = "-100vh";
    inputEl.style.left = "-100vw";
    document.body.appendChild(inputEl);
    inputEl.type = "file";
    inputEl.multiple = true;
    inputEl.accept = "image/*";
    inputEl.onchange = async () => {
      if (!inputEl.files || inputEl.files.length === 0) {
        return;
      }

      setState({
        ...state,
        isUploadingResource: true,
      });

      const file = inputEl.files[0];
      try {
        await resourceService.upload(file);
      } catch (error: any) {
        console.error(error);
        Toast.info(error.response.data.message);
      } finally {
        setState({
          ...state,
          isUploadingResource: false,
        });
        await fetchResources();
      }
    };
    inputEl.click();
  };

  // const handlPreviewBtnClick = (resource: Resource) => {
  //   showPreviewImageDialog(`${window.location.origin}/h/r/${resource.id}/${resource.filename}`);
  // };

  const handleCopyResourceLinkBtnClick = (resource: Resource) => {
    utils.copyTextToClipboard(`${window.location.origin}/h/r/${resource.id}/${resource.filename}`);
    Toast.info("Succeed to copy resource link to clipboard");
  };

  const handleDeleteResourceBtnClick = (resource: Resource) => {
    showCommonDialog({
      title: `Delete Resource`,
      content: `Are you sure to delete this resource? THIS ACTION IS IRREVERSIABLE.❗️`,
      style: "warning",
      onConfirm: async () => {
        await resourceService.deleteResourceById(resource.id);
        await fetchResources();
      },
    });
  };

  return (
    <>
      <div className="dialog-content-container">
        <div className="upload-resource-container" onClick={() => handleUploadFileBtnClick()}>
          <div className="upload-resource-btn">
            {/*<Icon.File className="icon-img" />*/}
            <span>Upload</span>
          </div>
        </div>
        {loadingState.isLoading ? (
          <div className="loading-text-container">
            <p className="tip-text">fetching data...</p>
          </div>
        ) : (
          <div className="resource-table-container">
            <div className="fields-container">
              <span className="field-text">ID</span>
              <span className="field-text name-text">NAME</span>
              <span className="field-text">TYPE</span>
              <span></span>
            </div>
            {state.resources.length === 0 ? (
              <p className="tip-text">No resource.</p>
            ) : (
              state.resources.map((resource) => (
                <div key={resource.id} className="resource-container">
                  <span className="field-text">{resource.id}</span>
                  <span className="field-text name-text">{resource.filename}</span>
                  <span className="field-text">{resource.type}</span>
                  <div className="buttons-container">
                    <Dropdown className="actions-dropdown">
                      {/* <button onClick={() => handlPreviewBtnClick(resource)}>Preview</button> */}
                      <button onClick={() => handleCopyResourceLinkBtnClick(resource)}>Copy Link</button>
                      <button className="delete-btn" onClick={() => handleDeleteResourceBtnClick(resource)}>
                        Delete
                      </button>
                    </Dropdown>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default function showResourcesDialog() {
  generateDialog(
    {
      className: "resources-dialog",
      title: "回收站",
    },
    Index,
    {}
  );
}
