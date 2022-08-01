import "../../less/settings/preferences-section.less";
import GitHubBadge from "../GitHubBadge";
import Only from "../common/OnlyWhen";
import { useEffect, useState } from "react";
import * as api from "../../helpers/api";

interface Props {}

const AboutSection: React.FC<Props> = () => {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    try {
      api.getSystemStatus().then(({ data }) => {
        const {
          data: { profile },
        } = data;
        setProfile(profile);
      });
    } catch (error) {
      setProfile({
        mode: "dev",
        version: "0.0.0",
      });
    }
  }, []);

  return (
    <div className="section-container preferences-section-container">
      <p className="title-text">About</p>
      <div className="btns-container">
        <p>
          An open source Flomo, help you quickly record ideas.
        </p>
        <br />
        <div className="addtion-info-container">
          <Only when={profile !== undefined}>
            <>
              version:
              <span className="pre-text">
                {profile?.version}-{profile?.mode}
              </span>
            </>
          </Only>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
