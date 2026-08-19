# 部署到 Vercel（免费公开子域，用于展会名片）

目标：拿到一个**默认公开、无需 token** 的 `*.vercel.app` 网址，免费、临时约 3 个月、不需要专属域名，直接印在 9 月日本展会的名片上。

## 已准备好的配置（本仓库内，已提交/待提交）

- `scripts/build-card-site.sh` — 部署前自动剥除非公开路由
  `(admin)` / `(auth)` / `(site)/rfq` / `src/app/api`（这些路由用到 `cookies()` 或 Server Action，会卡死静态导出），再用 `CATALOG_SOURCE=fixture` 构建纯静态站，最后 `git checkout` 还原工作树。
- `vercel.json` — `buildCommand` 指向上面的脚本，`outputDirectory: "out"`。
- `next.config.ts` 已设 `output: 'export'` + `images.unoptimized` + `trailingSlash: true` + `basePath: ''`（根路径，适配 Vercel 默认域名）。
- `.gitignore` 已加 `out/`，构建产物不会被提交。

> 仓库里 `.env.local`（含 `CATALOG_SOURCE=fixture`）是 gitignore 的，不会推到 GitHub。
> 但构建脚本已**内联** `CATALOG_SOURCE=fixture`，所以即使 Vercel 没有该环境变量也能正确构建。

## 你在本机要做的事（沙箱无法推送 GitHub / 无法登录你的 Vercel 账号）

### 1. 推送代码到 GitHub

在 Mac 终端粘贴（WorkBuddy 托管的 Node 已在 PATH 里）：

```bash
export PATH="/Users/haozhisheng/.workbuddy/binaries/node/versions/22.22.2/bin:$PATH"
cd "/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation"
git push -u origin agent/public-website-foundation
```

（若已设置过 upstream，直接 `git push` 即可。）

### 2. 在 Vercel 关联仓库并部署

1. 打开 https://vercel.com → 用 GitHub 登录（免费账号）。
2. **Add New → Project** → 导入 `Kyriehao-beep/wiz-corporate-website`。
3. 框架预设自动识别为 **Next.js**；根目录保持默认（仓库根）。
4. **Build Command / Output Directory 不用改** —— Vercel 会读取 `vercel.json`（`bash ./scripts/build-card-site.sh` → `out/`）。
5. **Environment Variables** 加一条保险：`CATALOG_SOURCE` = `fixture`（脚本已内联，但这条可确保万无一失）。
6. 点 **Deploy**。

### 3. 拿到公开网址

部署完成后 Vercel 给出类似 `https://wiz-corporate-website-xxxx.vercel.app` 的地址。
**默认即公开、无 token、不会 loading** —— 直接印名片即可。

### 4.（可选，以后）绑定专属域名

若之后想用 `wizrubberpatch.com` 这类正式域名：在 Vercel **Domains** 里添加（域名需自行在任意注册商购买，约 ¥20–80/年），按提示改 DNS 即可。当前不需要。

## 排错

- **构建报 Node 版本不符**：Vercel 项目 Settings → Node.js Version 选 **22.x**（仓库 `engines` 要求 `>=22 <25`）。
- **构建报 cookies() / Server Action 错误**：说明剥离脚本没生效，确认 `vercel.json` 的 `buildCommand` 确实指向 `scripts/build-card-site.sh`，且已推送最新提交。
- **页面打开空白**：本地用 `cd out && python3 -m http.server 3000` 预览 `out/`，确认是构建产物问题还是部署配置问题。
