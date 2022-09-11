import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useQuery from "@/hooks/useQuery";
import { UNKNOWN_ID } from "@/helpers/consts";
import { memoService, editorStateService } from "@/services";
import { PageLayout, Memo } from "@/components";
import "./index.less";

const SearchPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const [keyword, setKeyword] = useState("");
  const [memoList, setMemoList] = useState<any>([]);
  const [finished, setFinished] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [tagQuery, setTagQuery] = useState(query.get("tag") || "");
  const [noMore, setNoMore] = useState(false);
  const [noData, setNoData] = useState(false);

  const handleTextQueryInput = (event: React.FormEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value;
    editorStateService.setEditMemoWithId(UNKNOWN_ID);
    setKeyword(text);
  };

  const handleSearch = (event: any) => {
    event.preventDefault();
    console.log("keyword", keyword);
  };

  useEffect(() => {
    const tagQuery = query.get("tag");
    if (tagQuery) {
      getData();
    }
    console.log("span.umo-tag", tagQuery);
  }, []);

  useEffect(() => {
    if (keyword || tagQuery) {
      // setFinished(false)
      getData({ keyword });
    } else {
      setFinished(true);
      setMemoList([]);
      setOffset(0);
    }
  }, [keyword]);

  async function getData({ keyword }: { keyword?: string } = {}) {
    return new Promise<any>((resolve, reject) => {
      memoService
        .fetchAllMemos({ rowStatus: "NORMAL", limit: 10, offset, content: keyword, tag: tagQuery })
        .then((data) => {
          // resolve(data);
          setMemoList(data.list);
        })
        .catch((error) => {
          console.log(error);
          reject(new Error("error"));
        });
    });
  }

  const onLoad = async () => {
    const { total, list } = await getData();
    if (total === 0) return setNoData(true);
    setMemoList((v: any[]) => [...v, ...list]);
    if (memoList.length >= total) {
      setFinished(true);
      setNoMore(true);
    } else {
      setOffset(offset + 1);
    }
  };

  return (
    <PageLayout className="search-page" hiddenBar>
      <div className="header">
        <div className="searchBox">
          <img
            src="data:image/png;base64,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"
            alt=""
          />
          <form onSubmit={handleSearch}>
            <input type="text" placeholder="搜索" onChange={handleTextQueryInput} />
          </form>
        </div>
        <span
          className="cancel"
          onClick={() => {
            editorStateService.setEditMemoWithId(UNKNOWN_ID);
            navigate(-1);
          }}
        >
          取消
        </span>
      </div>
      {tagQuery && (
        <div className="search-body">
          <div className="title">搜索指定内容</div>
          <div className="link">
            {tagQuery && (
              <div>
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANqADAAQAAAABAAAANgAAAADzQy6kAAACsUlEQVRoBe1Yz2sTQRTOhgq24qkUixYcSkkCiQmYXgKlrkehx/4N/hEe/Se8+R/UiydPKhRP4slDEgpOoUSlepKIhJL0e3WnfQ47brIzKwu+gex88943s+9982OnrVSkiAKigCggCogCooAoIAqIAqKAKOBUoNvtrrRarVtOAnPU6/XbcRxfZ6YgsBpkFGuQ8Xj8aDKZfKnVaj8R+DPLbTdfjUYj4n3Gr24787YLSQzBqCSg5dlsdpYR3F34I/DWoyj6lsGd211IYtPpVJkIqtWqNtiuG43GKhK6SXYk9aPf73+3OXnbhSSGYBQLSDNsQ8UMxwx7w0ISg/qKRaYZtqEyBsycNjhEHfkMgr3+2tF/B4EuJb5DJJq6z8DZAGcr4Z2Ad8THGwwGD3l7EWxevkifSy4Ciy8bbkBJur1Xno0k0SuLBypkKXrEE6yr14zhxIvtSKD6Ln5PE/s7cJ7YHNPG6fkceJPa4D1GNSQconglhuP5rR0EjvBttvQ+pHFMH+zRNcZ9UerjvgzfMBKuiD2mzIyg1gzbUDHDMcNBYPDEyvANI2WCJ4Yx6e5nijYgpVbMphkOAoMmtsjdb969mDdLr1MRiTywXlwzbZx2pyl+464gsfumAe5KGvdvJ6rp66q9rlT4e2uuK4Xr5Vn24XCYO76gSzEr0H/p91qKOAHf8GCxpLbQpostlSP4T37DP5/g0Xt3yArOGapDwiFL7qlOCwJL8yXse+TDFWkfe+QgjYf91MUee08+JPYRt/h7aTwfW9CliCAVC0YzbENlDJg9bXDIOmhiCKwU3zASKFhiWF5z//+i6G9Y0MQQ7BoG/EqDouiLp+OBJXsNrl+J+5ODVi5zr9db7nQ6d7Kiwt6Kms3mervdvpHFFb8oIAqIAqKAKCAKiAKigCggCvzPCpwDqrfRM1ZitzcAAAAASUVORK5CYII="
                  alt=""
                />
                <span>{tagQuery}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {memoList.map((memo: any) => (
        <Memo
          key={`${memo.id}-${memo.updatedTs}`}
          memo={memo}
          actions={[
            { name: "分享", action: "share" },
            { name: "编辑", action: "edit" },
            { name: "删除", action: "delete", callback: () => getData({ keyword }) },
          ]}
        />
      ))}
    </PageLayout>
  );
};

export default SearchPage;
