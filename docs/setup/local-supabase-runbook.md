# 本地起 Supabase（Plan 2 认证闭环验证）

把已合并交付的 `schema / RLS / seed` + SSR 认证骨架在**你本机**真正跑起来，验证 `/zh-CN/login` 真实登录 → 跳 `/zh-CN/admin` 的闭环。

> 沙箱无网、本机情况见末尾「为什么必须本机做」。所有命令都在项目根目录执行：
> `/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation`

---

## 0. 前置安装（一次性）

需要 Docker 与 Supabase CLI。两者本机目前都没有。

### Docker Desktop
- 下载安装 https://www.docker.com/products/docker-desktop/ ，装完**启动并保持运行**（菜单栏鲸鱼图标常亮）。
- 验证：`docker info` 不报错即 OK。

### Supabase CLI
任选其一（用 WorkBuddy 托管的 Node 即可，本机 PATH 里默认没有 node）：

```bash
# 推荐：用托管 Node 的 npx，无需全局安装
export PATH="/Users/haozhisheng/.workbuddy/binaries/node/versions/22.22.2/bin:$PATH"
npx supabase@latest --version
```

或 Homebrew：`brew install supabase/tap/supabase`

---

## 1. 启动本地 Supabase

```bash
cd "/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation"
export PATH="/Users/haozhisheng/.workbuddy/binaries/node/versions/22.22.2/bin:$PATH"
supabase start
```

- 首次会拉镜像，约 1–3 分钟。成功后会打印各服务端口（与我们 `supabase/config.toml` 一致：API `54321`、DB `54322`、Studio `54323`）。
- Studio 界面：http://127.0.0.1:54323

---

## 2. 拿到本地密钥，写入 `.env.local`

```bash
supabase status
```

从输出复制三样：
- `API URL` → `NEXT_PUBLIC_SUPABASE_URL`（本地即 `http://127.0.0.1:54321`）
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

创建 `.env.local`（**不要**提交，已被 gitignore；也不要改 `.env.example`）：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`，把三个占位值替换成上面复制的真实值：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...本地anon...
SUPABASE_SERVICE_ROLE_KEY=eyJ...本地service_role...
```

---

## 3. 应用 schema / RLS / seed

```bash
# 重置本地库：执行 supabase/migrations/*.sql + supabase/seed.sql
supabase db reset
```

- 这会清空本地库后按文件名顺序重新跑全部 migration（`202608120001` 核心 schema → `002` RLS+storage → `003` audit 触发器 → `202608130001` 目录富编辑字段）再灌 seed。新增的 catalog 迁移会自动被拾起，无需手动干预。
- seed 含 6 个 product × EN/JA/ZH、3 个 application，且**现已写入富编辑字段**（eyebrow / suitability / construction / visual_options / attachment_options / artwork_guidance / buyer_problem / attachment_considerations / visual_direction，以及基表的 tone / priority）。`supabase db reset` 之后目录即为富内容，可直接验证本次 schema 扩展是否生效——不必再靠 fixture 兜底。
- **注意**：seed 不创建任何用户——账号要下一步手动建。

可选单独跑：`supabase migration up` 后再 `supabase db seed`。

---

## 4. 建一个 WIZ 管理员账号

账号模型是「统一 WIZ 账号 + role 区分」，本环境 `enable_signup=true` 仅为本地调试方便（上线要关）。两种建法：

### 法 A：登录页自助注册（最贴近真实路径）
1. 浏览器开 http://localhost:3000/zh-CN/login ，用任意邮箱注册。
2. 本地 `enable_confirmations=true`，需确认邮件。最简单：开 **Studio → Auth → Users**，找到刚建的账号，点「Send confirmation email」或在用户详情里直接确认；也可临时把 `config.toml` 的 `enable_confirmations` 改为 `false` 后 `supabase stop && supabase start`。
3. 注册会触发 `handle_new_user` 触发器，自动在 `public.profiles` 建一行（role 默认 `staff`）。

### 法 B：Studio 直接建（更快）
- Studio → Auth → Users → **Add user** → 填邮箱 + 密码（勾选 Auto Confirm）。触发器同样会建 profile。

### 提升为 admin
在 **Studio → SQL Editor** 执行（把 UUID 换成上一步账号的 `id`，可在 Users 列表复制）：

```sql
update public.profiles set role = 'admin' where id = '<auth-user-uuid>';
select id, email, role from public.profiles;
```

看到 `role = admin` 即成功。

---

## 5. 启动前端并验证

```bash
cd "/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation"
export PATH="/Users/haozhisheng/.workbuddy/binaries/node/versions/22.22.2/bin:$PATH"
npm run dev
```

浏览器开 http://localhost:3000 ，验证：

| 操作 | 预期 |
|---|---|
| 直接访问 `/zh-CN/admin`（未登录） | 被 `proxy.ts` 守卫重定向到 `/zh-CN/login` |
| `/zh-CN/login` 用刚建的账号登录 | 成功后跳 `/zh-CN/admin`，看到后台外壳 |
| `/zh-CN/login` 填错密码 | 表单显示通用错误（`auth.errorGeneric`），不泄露具体原因 |
| 已登录再访问 `/zh-CN/login` | 重定向到 `/zh-CN/admin` |
| 访问 `/zh-CN/products/custom-pvc-rubber-patches`（默认走 Supabase 仓储） | 页面显示 eyebrow、suitability / construction / visualOptions / attachmentOptions 列表、artworkGuidance 正文，而非空白或 fixture 兜底 |
| 访问 `/zh-CN/applications/apparel` | 页面显示 buyerProblem、recommendedProductSlugs、attachmentConsiderations、visualDirection |

> **改完配置/代码后必须重启 dev**：`.env.local` 的改动，以及目录页从 fixture 切到 `getCatalogRepository()` + `force-dynamic` 的路由配置变更，都需要重启 `npm run dev` 才生效（Fast Refresh 不会重读 env，也不会重算路由渲染模式）。重启后再开上面的 URL。
>
> **目录页行为说明（2026-08-13 修复后）**：`/products` 与 `/applications` 列表、以及两者 `[slug]` 详情页现在统一走 `getCatalogRepository()`（配了 Supabase 即读真实库，anon key + `*_public_read` RLS 放行），并标记为 `ƒ Dynamic`（构建期不触库，`next build` 无需联网）。因此列表只显示 seed 的 **3 个产品 / 3 个应用**，不再是 fixtures 的 9 应用 / 5 产品；`apparel` / `outdoor` / `automotive` 等 seed slug 走 DB 渲染。若之前看到的是 fixtures 内容，说明 dev server 还在跑旧代码——重启即可。

---

## 6. 跑 pgTAP 数据库测试（可选，需 Docker，现在有了）

```bash
supabase test db
```

会执行 `supabase/tests/rls.test.sql`（anon 不可读 inquiries、admin 识别、anon 插入被拒、member 可插 draft 等）。这是除前端单测外、对 RLS 策略的真实验证。

---

## 7. 收尾与注意事项

- **不要提交** `.env.local`、service_role key、Docker 卷。它们都在 gitignore。
- 已提交的 `package-lock.json`（npm 副作用）按项目约定**不 stage**；本项目用 pnpm，勿混入 lockfile。
- 本地 `enable_signup=true` 仅调试用；上线前需在 `config.toml` 改回邀请制 / 限 WIZ 域名，并接入 Resend + Cloudflare Turnstile（这些仍待环境/Plan 2 后续任务）。
- 验证通过后，下一步即可继续 Plan 2 全栈接线：目录仓储、RFQ 向导、上传、询盘创建、通知、管理后台真实查询、安全门禁。

---

### 为什么必须在本机做（不是沙箱）

- 沙箱禁网且 `supabase`/`docker` 不可用，`next start` 能跑但连不上本地库。
- 你 Mac 之前没有 Docker / Supabase CLI / pnpm，所以一直停在「代码骨架 + 构建/单测验证」阶段。现在装好 Docker 即可补齐「运行时验证」这一环。
- 本机已装好的托管 Node（`/Users/haozhisheng/.workbuddy/binaries/node/versions/22.22.2/bin/`）就是上面所有命令 `export PATH` 的来源，无需另装 Node。
