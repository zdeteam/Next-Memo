import { memo, useCallback, useEffect, useState } from "react";
import { memoService, shortcutService } from "../../../../services";
import { checkShouldShowMemoWithFilters, filterConsts, getDefaultFilter, relationConsts } from "../../../../helpers/filter";
import useLoading from "../../../../hooks/useLoading";
import { generateDialog } from "../../../../components/Dialog";
import { Toast } from "@/components";
import Selector from "../../../../components/Selector";
import "./index.less";

interface Props extends DialogProps {
  shortcutId?: ShortcutId;
}

const Index: React.FC<Props> = (props: Props) => {
  const { destroy, shortcutId } = props;

  const [title, setTitle] = useState<string>("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const requestState = useLoading(false);

  const shownMemoLength = memoService.getState().memos.filter((memo) => {
    return checkShouldShowMemoWithFilters(memo, filters);
  }).length;

  useEffect(() => {
    if (shortcutId) {
      const shortcutTemp = shortcutService.getShortcutById(shortcutId);
      if (shortcutTemp) {
        setTitle(shortcutTemp.title);
        const temp = JSON.parse(shortcutTemp.payload);
        if (Array.isArray(temp)) {
          setFilters(temp);
        }
      }
    }
  }, [shortcutId]);

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setTitle(text);
  };

  const handleSaveBtnClick = async () => {
    if (!title) {
      Toast.info("Title is required");
      return;
    }

    try {
      if (shortcutId) {
        await shortcutService.patchShortcut({
          id: shortcutId,
          title,
          payload: JSON.stringify(filters),
        });
      } else {
        await shortcutService.createShortcut({
          title,
          payload: JSON.stringify(filters),
        });
      }
    } catch (error: any) {
      console.error(error);
      Toast.info(error.response.data.message);
    }
    destroy();
  };

  const handleAddFilterBenClick = () => {
    if (filters.length > 0) {
      const lastFilter = filters[filters.length - 1];
      if (lastFilter.value.value === "") {
        Toast.info("Please fill in previous filter value");
        return;
      }
    }

    setFilters([...filters, getDefaultFilter()]);
  };

  const handleFilterChange = useCallback((index: number, filter: Filter) => {
    setFilters((filters) => {
      const temp = [...filters];
      temp[index] = filter;
      return temp;
    });
  }, []);

  const handleFilterRemove = useCallback((index: number) => {
    setFilters((filters) => {
      const temp = filters.filter((_, i) => i !== index);
      return temp;
    });
  }, []);

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">
          <span className="icon-text">🚀</span>
          {shortcutId ? "Edit Shortcut" : "Create Shortcut"}
        </p>
        <button className="btn close-btn" onClick={destroy}>
          {/*<Icon.X />*/}
        </button>
      </div>
      <div className="dialog-content-container">
        <div className="form-item-container input-form-container">
          <span className="normal-text">Title</span>
          <input className="title-input" type="text" placeholder="shortcut title" value={title} onChange={handleTitleInputChange} />
        </div>
        <div className="form-item-container filter-form-container">
          <span className="normal-text">Filters</span>
          <div className="filters-wrapper">
            {filters.map((f, index) => {
              return (
                <MemoFilterInputer
                  key={index}
                  index={index}
                  filter={f}
                  handleFilterChange={handleFilterChange}
                  handleFilterRemove={handleFilterRemove}
                />
              );
            })}
            <div className="create-filter-btn" onClick={handleAddFilterBenClick}>
              New Filter
            </div>
          </div>
        </div>
      </div>
      <div className="dialog-footer-container">
        <div></div>
        <div className="btns-container">
          <span className={`tip-text ${filters.length === 0 && "hidden"}`}>
            <strong>{shownMemoLength}</strong> eligible memo
          </span>
          <button className={`btn save-btn ${requestState.isLoading ? "requesting" : ""}`} onClick={handleSaveBtnClick}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

interface MemoFilterInputerProps {
  index: number;
  filter: Filter;
  handleFilterChange: (index: number, filter: Filter) => void;
  handleFilterRemove: (index: number) => void;
}

const MemoFilterInputer: React.FC<MemoFilterInputerProps> = (props: MemoFilterInputerProps) => {
  const { index, filter, handleFilterChange, handleFilterRemove } = props;
  const [value, setValue] = useState<string>(filter.value.value);

  const tags = Array.from(memoService.getState().tags);
  const { type } = filter;
  const dataSource =
    type === "TYPE"
      ? filterConsts["TYPE"].values
      : tags.sort().map((t) => {
          return { text: t, value: t };
        });

  useEffect(() => {
    setValue(filter.value.value);
  }, [type]);

  const handleRelationChange = (value: string) => {
    if (["AND", "OR"].includes(value)) {
      handleFilterChange(index, {
        ...filter,
        relation: value as MemoFilterRalation,
      });
    }
  };

  const handleTypeChange = (value: string) => {
    if (filter.type !== value) {
      const ops = Object.values(filterConsts[value as FilterType].operators);
      handleFilterChange(index, {
        ...filter,
        type: value as FilterType,
        value: {
          operator: ops[0].value,
          value: "",
        },
      });
    }
  };

  const handleOperatorChange = (value: string) => {
    handleFilterChange(index, {
      ...filter,
      value: {
        ...filter.value,
        operator: value,
      },
    });
  };

  const handleValueChange = (value: string) => {
    setValue(value);
    handleFilterChange(index, {
      ...filter,
      value: {
        ...filter.value,
        value,
      },
    });
  };

  const handleRemoveBtnClick = () => {
    handleFilterRemove(index);
  };

  return (
    <div className="memo-filter-input-wrapper">
      {index > 0 ? (
        <Selector
          className="relation-selector"
          dataSource={relationConsts}
          value={filter.relation}
          handleValueChanged={handleRelationChange}
        />
      ) : null}
      <Selector
        className="type-selector"
        dataSource={Object.values(filterConsts)}
        value={filter.type}
        handleValueChanged={handleTypeChange}
      />

      {inputElements}
      {/*<Icon.X className="remove-btn" onClick={handleRemoveBtnClick} />*/}
    </div>
  );
};

export default function showCreateShortcutDialog(shortcutId?: ShortcutId): void {
  generateDialog(
    {
      className: "create-shortcut-dialog",
    },
    Index,
    { shortcutId }
  );
}
