import { useEffect, useState } from "react";
import * as utils from "../../../../helpers/utils";
import { useAppSelector } from "../../../../store";
import { locationService, memoService, userService } from "../../../../services";
import useI18n from "../../../../hooks/useI18n";
import useToggle from "../../../../hooks/useToggle";
import Only from "../../../../components/OnlyWhen";
import "./index.less";

interface Tag {
  key: string;
  text: string;
  subTags: Tag[];
}

interface Props {}

const Index: React.FC<Props> = () => {
  const { t } = useI18n();
  const { memos, tags: tagsText } = useAppSelector((state) => state.memo);
  const query = useAppSelector((state) => state.location.query);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (memos.length > 0) {
      memoService.updateTagsState();
    }
  }, [memos]);

  useEffect(() => {
    const sortedTags = Array.from(tagsText).sort();
    const root: KVObject<any> = {
      subTags: [],
    };
    for (const tag of sortedTags) {
      const subtags = tag.split("/");
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
    setTags(root.subTags as Tag[]);
  }, [tagsText]);

  return (
    <div className="tags-wrapper">
      <p className="title-text">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACQMUbvAAAEAUlEQVR4Ae1bvWobQRC2hKTOzgMEAm4UF4HgFA5KEbALF34Cd+4EIaUL5xHiwlUIAXXp/AQuVEiQxiSFjbtEjSGQB3DcWULK9112zueL73a1p/uJmYVj73ZnZr/9bmdvd+5uaUmTMqAMKAPKgDKgDCgDyoAyoAwoA8qAMlAxBmpZ8cxms9rW1la7Vqu9gK1HWe3loH8FjGeDwWAEjLN57WciaHNz8zka/AwAzCudQM4FAO4Nh0PmzsmbIEPON5DTcm6tZEGQdAMIG/OQ1PDBbNyKI0fIOUfjxzh++9jLUwcYV3Dsoo114gVG4l5H7uRuXiMIo+cpGvluOnbebrdf9nq9cZ4dzWK72+02R6PRV5JEOyBnDaPoh4vNuotQXAYNcEIOEs6Pq0wOQRIfcf5FHBAU4peypNyLIBgLn1ZouHJudV9nYzhD/PfJRst8CYraeNDnSpDl9ipBSpCFAUu1jiAlyMKApdprJW2x6VSNDe776XT6Go/fNy5Lf25tsDj9VK/Xv2Dj+c6pkQUIleJiIOcxyDkA/g6Ot479oFyHetR31MksVgpBjUZjOYJ8JXKedhrKxfTTdDLXFepivPOmc6uCHC62vL29vSbXSflkMlmGi0n1KnSWUHYNd/slhXnkhRFk5pyDmxtGHG4TXGYHZTu3JfYzyJ+IFOwe5jknFeZinJClU4vM87IrGAsbQXxaoVFOtJxL6C7BqEH5T1yf4rClDnSeUAg6HEHXOLhR/ogjt1QYQeZR3mVPOOdE3OoUdQxopSY85hmuCAhqNpv7/X5f4lGpelkrC3OxrEDL0leCLMwrQUqQhQFLtY4gJcjCgKVaR5ASZGHAUl3YQtG8qg5W0uPxOLqb75hFoAVqEBoJZKB/BJ1wJe0ST7IZT6ovjCAGuwCC8Z87yWwfghXynYqUC9mmGJFnyF+liGeqKmwOYiQwE9IE5bzsSnOFjSCGJBCa+CDxIAlZoIMnKNsXQEk5Yj9HDI2wvtVqMb98UPEgdkyCWwx2SYK7XLtsPM2cI2qXLjoinCUvzMWiIHnnI9eu7/ZDuZh+xNTiT0shiCMJrnWI7jAO5BrPodwp9WQkLp6Ofy0WNgfFm+acFC9LuzaP8tyeVkltlzKCksBUsVwJstwVJUgJsjBgqdYRpARZGLBU+46gK7GLlXD4zlzKqpjHcIb4bVi9CEJjZ2IY57v8Dlmuq5gTH3EKtih+KUvKvT4kRwP8geUcufyj8V98aU8S8Fb2AotU5y/tvVbSaGSGzeMecvlXg5/580i6EZUoB15+OUHczkC9XIy9NUv/DTQ2198zZTFlcM71IwuxerlYtJPG3R7s/2LRvuq5MqAMKAPKgDKgDCgDyoAyoAy4MvAH/StlcsuDb1MAAAAASUVORK5CYII=" alt=""/>
        <span>TAGS</span>
        </p>
      <div className="tags-container">
        {tags.map((t, idx) => (
          <TagItemContainer key={t.text + "-" + idx} tag={t} tagQuery={query?.tag} />
        ))}
        <Only when={!userService.isVisitorMode() && tags.length === 0}>
          <p className="tip-text">{t("tag-list.tip-text")}</p>
        </Only>
      </div>
    </div>
  );
};

interface TagItemContainerProps {
  tag: Tag;
  tagQuery?: string;
}

const TagItemContainer: React.FC<TagItemContainerProps> = (props: TagItemContainerProps) => {
  const { tag, tagQuery } = props;
  const isActive = tagQuery === tag.text;
  const hasSubTags = tag.subTags.length > 0;
  const [showSubTags, toggleSubTags] = useToggle(false);

  const handleTagClick = () => {
    if (isActive) {
      locationService.setTagQuery(undefined);
    } else {
      utils.copyTextToClipboard(`#${tag.text} `);
      locationService.setTagQuery(tag.text);
    }
  };

  const handleToggleBtnClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSubTags();
  };

  return (
    <>
      <div className={`tag-item-container ${isActive ? "active" : ""}`} onClick={handleTagClick}>
        <div className="tag-text-container">
          <span className="icon-text">#</span>
          <span className="tag-text">{tag.key}</span>
        </div>
        <div className="btns-container">
          {hasSubTags ? (
            <span className={`action-btn toggle-btn ${showSubTags ? "shown" : ""}`} onClick={handleToggleBtnClick}>
              12
            </span>
          ) : null}
        </div>
      </div>

      {hasSubTags ? (
        <div className={`subtags-container ${showSubTags ? "" : "!hidden"}`}>
          {tag.subTags.map((st, idx) => (
            <TagItemContainer key={st.text + "-" + idx} tag={st} tagQuery={tagQuery} />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default Index;
