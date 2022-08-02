<h1 align="center">OpenFlomo</h1>

<p align="center">An open source Flomo, help you quickly record memos.</p>

<p align="center">
  <a href="https://github.com/usememos/memos/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/zdeteam/open-flomo" /></a>
  <a href="https://hub.docker.com/r/neosmemo/memos"><img alt="Docker pull" src="https://img.shields.io/docker/pulls/zdeteam/open-flomo.svg" /></a>
  <img alt="Go report" src="https://goreportcard.com/badge/github.com/zdeteam/open-flomo" />
</p>

<p align="center">
  <a href="https://openflomo.zde.today">Live Demo</a> •
  <a href="https://github.com/zdeteam/open-flomo/discussions">Discuss in Github 👾</a>
</p>

![demo](https://github.com/zdeteam/open-flomo/blob/a4c463f801c67b4bd93b18a9dd87e97b22f565b1/screen.png)

## ✨ Features

- 🦄 Fully open source;
- 📜 Writing in plain textarea without any burden,
  - and support some useful markdown syntax 💪.
- 🌄 Share the memo in a pretty image or personal page like Twitter;
- 🚀 Fast self-hosting with `Docker`;
- 🤠 Pleasant UI and UX;

## ⚓️ Deploy with Docker

```docker
docker run -d --name open-flomo --publish 8080:8080 --volume ~/.open-flomo/:/var/opt/open-flomo zdeteam/open-flomo:latest --mode prod --port 8080 --emailHost 发送邮件服务器(例如：smtp.exmail.qq.com) --emailPort 端口号 --emailUsername 邮箱账号 --emailPassword 邮箱密码
```

OpenFlomo should be running at [http://localhost:5230](http://localhost:5230). If the `~/.memos/` does not have a `memos_prod.db` file, then memos will auto generate it.

## 🏗 Development

OpenFlomo is built with a curated tech stack. It is optimized for developer experience and is very easy to start working on the code:
1. It has no external dependency.
2. It requires zero config.
3. 1 command to start backend and 1 command to start frontend, both with live reload support.

### Prerequisites
- [Go](https://golang.org/doc/install)
- [Air](https://github.com/cosmtrek/air#installation) for backend live reload
- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/getting-started/install)

### Steps

1. pull source code

   ```bash
   git clone https://github.com/zdeteam/open-flomo.git
   ```

2. start backend using air(with live reload)

   ```bash
   air -c scripts/.air.toml
   ```

3. start frontend dev server

   ```bash
   cd web && yarn && yarn dev
   ```

OpenFlomo should now be running at [http://localhost:3000](http://localhost:3000) and change either frontend or backend code would trigger live reload.

### Contributing
Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated. 🥰
