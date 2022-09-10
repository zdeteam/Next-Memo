import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/helpers/api";
import { NoData,PageLayout } from "@/components";
import "./index.less";

interface TagItemWrapProps {
  tag: Tag;
  index: number;
  style?: any;
}
interface Tag {
  key: string;
  text: string;
  subTags: Tag[];
}

const TagItemWrap = (props: TagItemWrapProps) => {
  //   console.log("props", props.tag);
  //   const tagsArray = props.tag.split("/");
  console.log("0---------", props);
  const hasSubTags = props.tag.subTags.length > 0;
  const navigation = useNavigate();
  return (
    <div className="tag-item-wrap">
      <div style={props.style} onClick={() => navigation(`/search?tag=${props.tag.key}`)} className="tag-item-content">
        <div className="tag-item">
          <span>
            <strong>#</strong> {props.tag.key}
          </span>
          <div>
            {/* <div className="total">2</div> */}
            {/* <div className="action">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAAAw0lEQVRoBe3TsQ3DIBCFYRNZKViFnbKGXaXIKNmJVShcQHzFSU+ujIQsS/ndcIfOB3yCaeJDAAEEEEAAAQQQQAABBBBA4D8FQu+xc87PUsqntfayf0MI3xjjO6W0aa/Rddpb41mTM7Ftvta6eO1+kGWfs3T1ORtH12lvjR+anIldXmuvmNP1NO4+gP58h7j7AHbnjxu/Yu64pufdb8AerN15vzb+iL2hj6PrvC8jAggggAACCCCAAAIIIIAAAgggcA+BH+PSfUfcRQ5cAAAAAElFTkSuQmCC"
                alt=""
              />
            </div> */}
            {/* <div className="arrow">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMKADAAQAAAABAAAAMAAAAADbN2wMAAAB1klEQVRoBe2UP0vDYBCHzR9Q8Hu4OJW26eIkIooiOoibDoIgIm5WKChCQd3ELyCObrq4OTmlKbroUL+BgyAIomIbn1eT8hIabNIIChco793lLve7J5f29cklBISAEBACQkAICAEhIASEgBAQAv+YgOu6Q0nle56XS1rTKd/sFEwSQ3yF/Lt6vT7bbR01S61Wixm8arc1cXk9DRAIUCJsBJ3iT8Y1CuPkrBiGcYxvUVMJAIS3E59G4oqgACE5RRHX0p7xirhpx3EutVjbrNVqG77vH7YD38YHx3CpVLqPxLtyU7+BYrF4Q4dlBPtapwHsc9ZpRIt9mZAuR8VT+25Z1nxa8erBqQdQxTQ+QcSqssMLkYPNZvOCN+SEMewd7P3QD071tuYKhcJZJJ7ITb1CepdOq4G4J36j5C2wamU9n/gL/kzcqum5P9mZDKCaMMQW9Pf0hgh9I9avx7CfbdueyufzV5F4KjezAVR3hthF8HacEvVWTNOcYG3cuJyk8UwHUM35WA84NqNCEP+I+HHEX0fv9eJnPoASw0d7xN6va8IeED/GP9etFsvE/JUBWCODdapCfQ2VDc5FxDcyUSwPEQJCQAgIASEgBISAEBACQkAICIE/QuATk3qWuuoiJQgAAAAASUVORK5CYII="
                alt=""
              />
            </div> */}
          </div>
        </div>
      </div>

      {hasSubTags ? (
        <div>
          {props.tag.subTags.map((st, idx) => (
            <TagItemWrap
              key={st.text + "-" + idx}
              tag={st}
              index={props.index + 1}
              style={{ paddingLeft: `${0.42 * (props.index + 1)}rem` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TagPage = () => {
  const navigation = useNavigate();
  //   const noData
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    api.getTagList().then(({ data }) => {
      //   console.log("response", response);
      //   setTags(data.data);
      const tagsText = data.data;
      const sortedTags = Array.from(tagsText).sort();
      const root: KVObject<any> = {
        subTags: [],
      };
      for (const tag of sortedTags) {
        const subtags = tag.split("/").filter((tag) => tag !== "");
        let tempObj = root;
        let tagText = "";
        for (let i = 0; i < subtags.length; i++) {
          const key = subtags[i];
          if (i === 0) {
            tagText += key;
          } else {
            tagText += "/" + key;
          }

          let obj = null;

          for (const t of tempObj.subTags) {
            if (t.text === tagText) {
              obj = t;
              break;
            }
          }

          if (!obj) {
            obj = {
              key,
              text: tagText,
              subTags: [],
            };
            tempObj.subTags.push(obj);
          }

          tempObj = obj;
        }
      }
      setTags(root.subTags);
    });
  }, []);

  return (
    <PageLayout className="tag-page" title="我的标签" onClickLeft={() => navigation("/")}>
      {tags.length ? (
        tags.map((tag, idx) => (
          // <div>hello</div>
          <TagItemWrap key={tag + "-" + idx} index={0} tag={tag} />
        ))
      ) : (
        <NoData />
      )}
    </PageLayout>
  );
};

export default TagPage;
