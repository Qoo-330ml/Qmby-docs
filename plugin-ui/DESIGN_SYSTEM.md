# Qmby「海雾微光」组件库整理

这份文档只覆盖 Qmby 的默认主题「海雾微光」，用于后续建设组件库、统一新增页面和逐步收敛重复 UI。

## 1. 范围与事实来源

### 主题范围

- 主题气质：浅蓝白底、青蓝点缀、轻盈光感、分层表面、后台工具密度。
- 主题模式：默认浅色，以及同一主题的深色模式；两者共享组件 API 和语义 Token。
- 不纳入：`animal-island`、`8bit`、`retro` 的专属视觉和组件变体。

### 当前事实来源

| 内容 | 当前文件 | 说明 |
| --- | --- | --- |
| 颜色、圆角、背景光晕、主题基础样式 | `src/index.css` | 默认主题 Token 的第一事实来源 |
| 通用表面和布局 class | `src/lib/ui-style.ts` | 透明度、阴影、表格、筛选等复用样式 |
| 基础组件实现 | `src/components/ui/*` | 当前已经在业务页面中使用 |
| 主题使用规则 | `UI_STYLE.md` | 卡片透明度、浮层不透明、页面检查表 |
| 应用壳层 | `src/components/Layout.tsx` | 侧栏、导航、移动端菜单、账号入口 |

当前前端没有发现 Storybook 或统一的组件展示入口。因此，本文件先充当组件库信息架构和视觉验收基线；真正开始实现组件库时，建议再增加组件展示页或 Storybook。

## 2. 视觉定位

### 关键词

浅蓝白画布、青蓝主操作、青绿色辅助信息、轻阴影、半透明主体卡片、不透明浮层、圆润但克制、紧凑后台。

### 层级规则

1. 页面背景可以承载光晕，但不能承载关键文字信息。
2. 直接落在页面背景上的主体卡片可以半透明，并使用轻微 `backdrop-blur`。
3. 覆盖在表格、列表、表单或其他页面内容上方的 Dialog、SlidePanel、菜单、Select、Tooltip、Toast 必须使用不透明表面。
4. 主操作使用 `primary`；成功、警告、错误等状态使用语义色，不用主色替代。
5. 同一页面只保留一个最强的视觉焦点，其他区域通过字号、对比度和间距降级。
6. 信息密度优先：表格、筛选、分页、设置项保持紧凑，不使用营销页式大留白。

## 3. 海雾微光 Token

### 3.1 浅色语义色

这些值来自 `src/index.css` 的 `@theme`，业务代码应使用语义类名，不直接写色值。

| Token | 当前值 | 用途 |
| --- | --- | --- |
| `background` | `hsl(204 33% 97%)` | 页面底色 |
| `foreground` | `hsl(215 28% 14%)` | 主文字 |
| `card` | `hsl(0 0% 100%)` | 卡片表面 |
| `card-foreground` | `hsl(215 25% 15%)` | 卡片主文字 |
| `popover` | `hsl(0 0% 100%)` | Dialog、菜单、浮层表面 |
| `popover-foreground` | `hsl(215 25% 15%)` | 浮层主文字 |
| `primary` | `hsl(199 88% 48%)` | 主按钮、选中、重点操作 |
| `primary-foreground` | `hsl(0 0% 100%)` | 主色表面上的文字 |
| `secondary` | `hsl(173 40% 94%)` | 次级按钮、轻量辅助表面 |
| `secondary-foreground` | `hsl(173 91% 25%)` | 次级表面上的文字 |
| `muted` | `hsl(205 24% 94%)` | 禁用、骨架、弱背景 |
| `muted-foreground` | `hsl(215 15% 45%)` | 辅助文字、元信息 |
| `accent` | `hsl(199 80% 95%)` | Hover、选中背景、输入聚焦辅助层 |
| `accent-foreground` | `hsl(199 90% 30%)` | Accent 表面上的文字 |
| `brand-blue` | `hsl(199 90% 50%)` | 信息、蓝色状态 |
| `brand-teal` | `hsl(173 91% 40%)` | 青绿色状态、同步、媒体强调 |
| `brand-green` | `hsl(101 60% 49%)` | 成功、可用 |
| `success` | `hsl(101 60% 49%)` | 成功状态 |
| `warning` | `hsl(38 92% 50%)` | 需关注状态 |
| `destructive` | `hsl(0 84% 60%)` | 失败、删除、阻断 |
| `ring` | `hsl(199 90% 50%)` | 键盘焦点环 |

### 3.2 深色模式

深色模式仍属于「海雾微光」，只是将画布和表面切换为深蓝灰：

| Token | 当前值 |
| --- | --- |
| `background` | `hsl(215 30% 8%)` |
| `card` / `popover` | `hsl(215 30% 11%)` |
| `primary` | `hsl(199 90% 55%)` |
| `secondary` | `hsl(173 30% 18%)` |
| `muted` | `hsl(215 20% 16%)` |
| `muted-foreground` | `hsl(215 15% 60%)` |
| `accent` | `hsl(199 40% 18%)` |
| `destructive` | `hsl(0 62% 50%)` |
| `success` | `hsl(101 55% 50%)` |
| `info` | `hsl(173 80% 50%)` |
| `warning` | `hsl(38 85% 55%)` |

深色模式下不要把正文改成纯白大面积使用；当前实现将正文、卡片文字和辅助文字维持在较低对比度，避免页面发光过强。

### 3.3 背景与材质

| Token / 规则 | 当前实现 | 使用位置 |
| --- | --- | --- |
| `--qmby-background-lights` | 青蓝、青绿、暖黄三组低透明度径向光晕 | 页面背景 |
| `--qmby-page-background` | 光晕叠加 `background` | `body` |
| `glassPanel` | `rounded-xl border border-border/70 bg-card/45 backdrop-blur` + `0 8px 24px / 0.13` | 页面主体卡片 |
| `glassSubtle` | `rounded-lg border border-border/70 bg-card/45 backdrop-blur` + `0 6px 16px / 0.09` | 轻量面板、Outline 按钮、任务行 |
| `surfaceInset` | `rounded-lg border border-border/70 bg-background` | 卡片内部的实底区域 |
| 浮层表面 | `bg-card`、`bg-popover` 或 `bg-background` | Dialog、Drawer、Select、Tooltip、Toast |

### 3.4 形状、密度与阴影

| 项目 | 规范 |
| --- | --- |
| 基础圆角 | `--radius: 0.75rem`；默认主题的主卡片使用 `rounded-xl` |
| 控件圆角 | 按钮、输入、Select、轻量容器使用 `rounded-lg` |
| 胶囊圆角 | Badge、FilterRow 选项使用 `rounded-full`，只用于标签和筛选，不用于所有容器 |
| 常用高度 | 小控件 `28px`、小按钮 `32px`、默认按钮 `40px`、大按钮 `44px` |
| 页面间距 | 页面通常 `space-y-6 p-4 md:p-6`；区块内部多用 `gap-2`、`gap-3`、`gap-4` |
| 主阴影 | `0 8px 24px rgb(15 23 42 / 0.13)` |
| 轻阴影 | `0 6px 16px rgb(15 23 42 / 0.09)` |
| 浮层阴影 | Dialog `0 12px 34px rgb(15 23 42 / 0.16)`；Toast `0 12px 36px rgb(15 23 42 / 0.18)` |
| 边框 | 默认主题以低对比透明边框为主，避免黑色硬边框 |

### 3.5 字体与文字层级

当前默认主题的全局字体为 `system-ui, -apple-system, sans-serif`，中文依赖系统字体。`smiley-sans` 已加载，但不是全局正文默认字体。

| 层级 | 当前页面习惯 |
| --- | --- |
| 页面标题 | `text-2xl font-semibold tracking-tight text-muted-foreground` |
| 区块标题 | `text-base font-semibold text-muted-foreground` |
| 卡片标题 | `text-xl font-semibold`，或根据页面密度降到 `text-base` |
| 正文 | `text-sm`，重点字段使用 `font-medium` |
| 元信息 | `text-xs text-muted-foreground` |
| 数值 | `text-lg` 到 `text-3xl`，配合 `font-semibold` |
| 表格 | 默认 `text-sm`；表头 `text-xs text-muted-foreground` |

## 4. 现有基础组件清单

目录：`src/components/ui/`

### 4.1 操作与输入

| 组件 | 状态 | 当前 API / 变体 | 组件库定位 |
| --- | --- | --- | --- |
| `Button` | 已有 | `default`、`destructive`、`outline`、`secondary`、`ghost`、`link`；尺寸 `xs`、`sm`、`default`、`lg`、`icon`、`icon-sm` | 所有可执行操作的唯一入口 |
| `Input` | 已有 | 原生 Input 属性，默认 `h-8 rounded-lg bg-card/70 text-xs` | 单行文本、搜索、数字、日期 |
| `Textarea` | 已有 | 原生 Textarea 属性，默认 `min-h-20 rounded-lg bg-card/70 text-xs` | 多行文本、配置说明 |
| `Label` | 已有 | Radix Label 属性 | 表单字段标题 |
| `Select` | 已有 | `Select`、`SelectTrigger`、`SelectContent`、`SelectItem`、`SelectValue`、`SelectGroup` | 选项少、需要统一下拉浮层的选择器 |
| `Switch` | 已有 | `checked`、`onCheckedChange` | 二元配置；关闭态为中性灰轨道 + 白色滑块 |
| `SegmentedControl` | 已有 | 泛型 `options`、`value`、`onChange` | 同一层级的 2 到 5 个模式切换 |
| `FilterRow` | 已有 | `options`、`value`、`onChange`、可选 `icon` / `highlightClass` | 横向筛选项，支持移动端横向滚动 |

### 4.2 表面与结构

| 组件 | 状态 | 当前 API / 组成 | 组件库定位 |
| --- | --- | --- | --- |
| `Card` | 已有 | `CardHeader`、`CardTitle`、`CardDescription`、`CardContent`、`CardFooter` | 页面背景上的主体信息容器 |
| `Dialog` | 已有 | Radix Root、Trigger、Portal、Overlay、Content、Header、Title、Description、Footer、Close | 居中的短流程、确认、编辑、详情 |
| `SlidePanel` | 已有 | `open`、`onClose`、`title`、`children` | 右侧抽屉、移动端详情和编辑 |
| `Table` | 已有 | `TableWrap`、`Table`、`TableHead`、`TableRow`、`TableHeaderCell`、`TableCell` | 紧凑后台表格；表格外层带滚动和边框 |
| `Separator` | 已有 | Radix Separator，支持 horizontal / vertical | 区块、表单、导航分组分隔 |

### 4.3 状态反馈

| 组件 | 状态 | 当前变体 / 行为 | 组件库定位 |
| --- | --- | --- | --- |
| `Badge` | 已有 | `default`、`primary`、`teal`、`blue`、`success`、`warning`、`destructive`、`outline` | 状态、类别、数量、来源标签 |
| `AlertBanner` | 已有 | `info`、`success`、`warning`、`destructive` | 页面内持续显示的消息或错误说明 |
| `EmptyState` | 已有 | `icon`、`title`、`description`、`children` | 无数据、无搜索结果、无任务 |
| `Skeleton` | 已有 | 原生 `className` | 初始加载占位 |
| `Pagination` | 已有 | 页码、总量、每页条数、第一页快捷入口 | 表格和记录列表分页 |
| `ToastProvider` | 已有 | `info`、`success`、`error`，最多保留最近 4 条，约 3.6 秒自动关闭 | 短暂操作反馈 |
| `Tooltip` | 已有 | Radix Provider、Trigger、Content | 图标按钮、折叠导航、缩略信息 |

### 4.4 基础组件的统一状态

所有交互组件至少要覆盖：默认、Hover、Focus-visible、Disabled、Loading（适用时）、Selected / Checked（适用时）、错误（适用时）。

- 图标按钮必须有 `aria-label` 或 Tooltip。
- 状态表达同时使用颜色、图标或文字，不能只依赖颜色。
- Dialog、Select、Tooltip、Toast 等浮层必须不透明，避免页面文字穿透。
- Button 的加载状态应保留原按钮宽度，避免 Spinner 出现导致布局跳动。
- Input / Select / Textarea 在移动端保留可点击高度；iOS 下当前样式会将输入字号提升到 `16px` 以避免浏览器自动缩放。

## 5. 应用壳层与已存在的复合组件

这些组件已经超出基础 UI 的职责，但在 Qmby 的多个页面中有明确复用价值。

### 5.1 应用壳层

| 组件 | 文件 | 职责 |
| --- | --- | --- |
| `Layout` | `src/components/Layout.tsx` | 页面外壳、侧栏、导航分组、移动端更多菜单、账号入口、Outlet |
| `NavItem` / 导航分组 | `src/components/Layout.tsx` 内部 | 一级导航、二级导航、当前路由、功能隐藏 / 锁定 |
| `AccountMenu` | `src/components/AccountMenu.tsx` | 账号头像、身份信息、主题入口、退出 |
| `AccountSettingsDialog` | `src/components/AccountSettingsDialog.tsx` | 账号设置大 Dialog、个人资料、主题、账号信息 |
| `SlidePanel` | `src/components/SlidePanel.tsx` | 右侧抽屉基础壳层 |

### 5.2 文件、任务与媒体复合组件

| 组件 | 文件 | 主要页面 / 场景 |
| --- | --- | --- |
| `DownloaderTaskConsole` | `src/components/DownloaderTaskConsole.tsx` | 下载管理、资源订阅中的下载任务与分页列表 |
| `RemoteFolderPicker` | `src/components/RemoteFolderPicker.tsx` | 115 远程文件夹选择、树状目录、Dialog / Drawer 内嵌下拉 |
| `SchedulePicker` | `src/components/SchedulePicker.tsx` | 计划任务的时间和周期配置 |
| `SeasonMergeDialog` | `src/components/SeasonMergeDialog.tsx` | 剧集季合并、元数据选择、目录和开关配置 |
| `UploadConfigDialog` | `src/components/UploadConfigDialog.tsx` | 上传监控配置、状态提示、配置表单 |
| `Open115Modal` | `src/components/Open115Modal.tsx` | 打开 115、登录或连接操作 |
| `QRCodeModal` | `src/components/QRCodeModal.tsx` | 二维码展示和相关状态 |
| `ResourceMediaDetail` | `src/components/ResourceMediaDetail.tsx` | 媒体海报、元信息、详情操作 |

### 5.3 Feature 级组件

| 组件 | 文件 | 主要作用 |
| --- | --- | --- |
| `AccountInfoBlock` | `src/features/account/AccountInfoBlock.tsx` | 账号信息展示与加载态 |
| `EditableName` | `src/features/account/EditableName.tsx` | 名称展示 / 编辑切换 |
| `LabelWithTooltip` | `src/features/account/LabelWithTooltip.tsx` | 表单标签补充说明 |
| `UploadRecordStatus` | `src/features/upload/UploadRecordStatus.tsx` | 上传记录状态 Badge |

## 6. 页面风格与页面模式

### 6.1 页面分组

| 页面分组 | 页面 / 路由 | 主要 UI 形态 |
| --- | --- | --- |
| 认证 | `Login` `/login`、`InviteRegister` `/invite/:code` | 居中 Card、少量表单、主操作按钮、错误提示 |
| 概览 | `Dashboard` `/` | 欢迎区、统计卡、媒体 / 任务区块、空态、Skeleton、多列响应式布局 |
| 账号与个人 | `Account` `/account`、`Profile` `/profile`、`About` `/about` | 资料信息块、设置表单、卡片分区、版本信息 |
| 文件与自动化 | `FileManager` `/files`、`ResourceRevision` `/files/revision`、`Organizer` `/files/organizer`、`Upload` `/upload`、`StrmTask` `/playback/strm` | 筛选工具栏、紧凑表格、任务行、配置 Dialog、分页 |
| 资源发现 | `ResourceSubscriber` `/resources`、`ResourceSites` `/resources/sites`、`Qshare` `/resources/qshare`、`WatchCalendar` `/resources/watch-calendar` | 海报网格、媒体详情、搜索、筛选、日历、侧栏摘要 |
| 订阅与运营 | `SubscriptionList` `/resources/subscriptions`、`RuleGroups` `/resources/rule-groups`、`SubscriptionBilling` `/subscription-billing`、`EconomyAdmin` `/economy` | 状态列表、表单设置、商品 / 流水列表、运营 Dialog |
| 管理 | `UserList` `/users`、`Config` `/config` | 用户分组列表、设置项、编辑 Dialog、Switch、Select |
| 监控与系统 | `PlaybackMonitor` `/monitor`、`Logs` `/logs`、`ThirdPartyTools` `/third-party-tools` | 状态指标、过滤、日志表格、工具配置、结果列表 |

### 6.2 推荐的页面骨架

```text
PageFrame
├── PageHeader
│   ├── PageTitle
│   ├── Description / Meta
│   └── PageActions
├── PageToolbar
│   ├── Search
│   ├── FilterRow / Select / SegmentedControl
│   └── PrimaryAction
├── MainContent
│   ├── Card / TableWrap / MediaGrid / Calendar
│   └── Loading / Empty / Error
└── Pagination / FooterMeta
```

### 6.3 页面模式明细

#### A. 标准后台页面

适用于账号、配置、订阅模版、运营设置等。

- 外层：`space-y-6 p-4 md:p-6`。
- 顶部：左侧标题和辅助文字，右侧放刷新、保存、创建等操作。
- 内容：按业务区块拆为 `Card`，区块标题使用 `text-base font-semibold`。
- 表单：标签和控件保持紧凑，长说明用 `text-xs text-muted-foreground`。
- 成功或错误：优先 `AlertBanner`，不在页面内重复手写颜色组合。

#### B. 数据表格页面

适用于文件管理、日志、上传记录、用户列表、订阅列表。

- 工具栏位于表格上方，搜索、筛选、批量操作同一视觉层级。
- 表格使用 `TableWrap` + `Table` 组合，保持 `text-sm` 和 `px-3 py-2` 密度。
- 行内状态使用 `Badge`，危险操作使用 `destructive` 或确认 Dialog。
- 空数据使用 `EmptyState`，加载使用 `Skeleton`，不要让表格出现大面积空白闪烁。
- 大列表底部使用 `Pagination`，页大小切换与总量同处一行。

#### C. 媒体发现页面

适用于资源订阅、Qshare、追剧日历。

- 海报比例稳定，电影 / 剧集卡片标题最多两行。
- 图片缺失时使用 `muted` 表面和媒体图标占位，不使用高亮装饰。
- 详情优先使用 `ResourceMediaDetail`、`Dialog` 或 `SlidePanel`。
- 搜索、内容类型、排序等筛选优先使用 `Input`、`Select`、`SegmentedControl`。
- 详情浮层必须使用不透明 `bg-card` / `bg-popover`。

#### D. 任务与监控页面

适用于下载管理、上传、STRM、播放监控。

- 当前任务或实时状态是第一焦点。
- 进行中使用 `Badge` + 进度 / 数值；暂停、失败、完成必须同时显示文字。
- 任务项内的信息按名称、状态、进度、速度、剩余时间、操作对齐。
- 处理日志保持紧凑连续，不拆成很多独立大卡片。
- 任务配置、用户详情、客户端管控等较长内容使用 Dialog 或 SlidePanel。

#### E. 日历与时间线页面

适用于 `WatchCalendar`、日志辅助区、流水记录。

- 日期 / 时间是一级辅助信息，使用 `text-xs text-muted-foreground`。
- 当日、进行中、完成、异常使用 Badge 或小色点 + 文字。
- 横向日历单元格在移动端允许滚动，不压缩到不可读。
- 侧栏摘要属于页面内容，不使用过强阴影抢夺主区焦点。

#### F. 认证页面

适用于登录和邀请注册。

- 保持单一主操作，表单控件宽度一致。
- 错误信息靠近对应字段或表单底部，使用语义色。
- 不引入复杂导航、统计卡或装饰性大图。
- 处理加载时按钮保留宽度，避免页面跳动。

## 7. 建议从页面中抽取的模式组件

以下不是当前统一组件，但在页面中已经有明显重复，适合作为组件库第二层。建议先做成组合组件，不要把业务数据请求塞进组件内。

| 建议名称 | 当前重复形态 | 建议 API 方向 | 优先级 |
| --- | --- | --- | --- |
| `PageHeader` | 标题、描述、右侧操作的 Flex 布局 | `title`、`description`、`actions`、`back` | P0 |
| `PageToolbar` | 搜索、筛选、批量操作的顶部工具栏 | `leading`、`filters`、`actions`、`wrap` | P0 |
| `PageSection` | 区块标题 + 辅助信息 + 内容 | `title`、`description`、`actions`、`children` | P0 |
| `FormRow` / `SettingRow` | Label、说明、Input / Select / Switch 横向排列 | `label`、`description`、`control`、`stackOnMobile` | P0 |
| `StatCard` / `SummaryMetric` | 数值、标题、趋势 / 辅助信息、状态 | `label`、`value`、`meta`、`icon`、`tone` | P1 |
| `DataTable` | `TableWrap`、表头、行、空态、加载态、分页 | `columns`、`rows`、`loading`、`empty`、`pagination` | P1 |
| `StatusBadge` | Badge + 状态映射 + 图标 | `status`、`label`、`icon` | P1 |
| `TaskRow` | 任务名称、状态、进度、速度、操作 | `title`、`status`、`progress`、`metrics`、`actions` | P1 |
| `MediaCard` | 海报、标题、类型、年份、状态 | `poster`、`title`、`meta`、`badge`、`onClick` | P1 |
| `MediaGrid` | 海报网格、加载 Skeleton、空态 | `items`、`renderItem`、`columns`、`loading` | P1 |
| `DetailPanel` | 媒体 / 用户 / 任务详情 Dialog 或 Drawer | `title`、`summary`、`sections`、`actions` | P1 |
| `LoadingState` / `ErrorState` | 页面各处手写的加载和错误块 | `message`、`retry`、`compact` | P2 |
| `ConfirmDialog` | 删除、取消任务、重试等确认流程 | `title`、`description`、`confirm`、`variant` | P2 |

这些模式组件应只负责布局和视觉状态，数据格式化、API 调用和权限判断留在页面或 feature 层。

## 8. 推荐的组件库目录

```text
src/components/
├── ui/                         # 基础无业务组件，当前已有
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── switch.tsx
│   ├── badge.tsx
│   ├── alert-banner.tsx
│   ├── empty-state.tsx
│   ├── skeleton.tsx
│   ├── separator.tsx
│   ├── tooltip.tsx
│   ├── toast.tsx
│   ├── filter-row.tsx
│   ├── segmented-control.tsx
│   ├── table.tsx
│   └── pagination.tsx
├── patterns/                   # 页面模式，建议新增
│   ├── page-header.tsx
│   ├── page-toolbar.tsx
│   ├── page-section.tsx
│   ├── form-row.tsx
│   ├── stat-card.tsx
│   ├── data-table.tsx
│   ├── task-row.tsx
│   ├── media-card.tsx
│   ├── media-grid.tsx
│   ├── detail-panel.tsx
│   └── confirm-dialog.tsx
└── product/                    # Qmby 业务复合组件
    ├── downloader-task-console.tsx
    ├── remote-folder-picker.tsx
    ├── schedule-picker.tsx
    ├── resource-media-detail.tsx
    └── account-settings-dialog.tsx
```

建议给 `ui/` 和 `patterns/` 增加统一出口 `index.ts`，减少页面中分散的深层 import；`product/` 保持按业务域拆分，避免成为新的“大杂烩目录”。

## 9. 组件库建设顺序

### P0：先统一基础规则

- 保留 `src/index.css` 和 `src/lib/ui-style.ts` 作为默认主题 Token / 表面规范的来源。
- 给现有 `ui/` 组件补齐统一展示页，至少覆盖默认、Hover、Focus、Disabled、Loading、Empty、Error。
- 新增 `PageHeader`、`PageToolbar`、`PageSection`、`FormRow`，优先改造配置类和表格类页面。
- 统一浮层背景为实底，清理 Dialog、Drawer、菜单、Toast 内部的半透明写法。

### P1：收敛高频业务模式

- `StatCard`、`DataTable`、`StatusBadge`、`TaskRow`。
- `MediaCard`、`MediaGrid`、`DetailPanel`。
- 把页面内重复的 `rounded-lg bg-card/... shadow-[...]` 迁移到 `uiStyles` 或模式组件。

### P2：完善体验与工程能力

- 为组件增加 Storybook 或内部 `/component-gallery` 页面。
- 增加浅色 / 深色主题的视觉回归截图。
- 为表格、Dialog、Drawer、Tooltip、Switch 补齐键盘和屏幕阅读器验证。
- 统一 loading、error、empty、retry 的页面级状态组件。

## 10. 页面新增验收清单

- [ ] 只使用「海雾微光」的语义 Token，不新增孤立色值。
- [ ] 页面标题、区块标题、正文和辅助文字遵守现有层级。
- [ ] 主体卡片使用 `Card` 或 `uiStyles.glassPanel`；浮层使用不透明背景。
- [ ] 状态使用 `Badge` / `AlertBanner`，不手写散落的语义色组合。
- [ ] 表格使用 `TableWrap` 等统一组合，列表有加载、空态和错误态。
- [ ] 筛选使用 `FilterRow`、`SegmentedControl`、`Select`，不重复实现切换胶囊。
- [ ] 图标按钮拥有 Tooltip 或 `aria-label`。
- [ ] 移动端不出现横向溢出，表格和海报墙使用明确的滚动策略。
- [ ] 交互状态不会造成布局跳动，尤其是 Spinner、Badge 和分页。
- [ ] 浅色、深色模式下文字和状态都保持可读。

## 11. 推荐使用方式

```tsx
<div className="space-y-6 p-4 md:p-6">
  <PageHeader
    title="用户列表"
    description="管理用户状态、权限和运营信息。"
    actions={<Button><Plus className="h-4 w-4" />新增用户</Button>}
  />

  <PageToolbar
    leading={<Input placeholder="搜索用户" />}
    filters={<FilterRow options={options} value={value} onChange={setValue} />}
  />

  <Card>
    <CardHeader>
      <CardTitle>用户</CardTitle>
    </CardHeader>
    <CardContent>
      <TableWrap>{/* Table / loading / empty / error */}</TableWrap>
    </CardContent>
  </Card>
</div>
```

组件库的边界应保持清楚：基础组件处理视觉和交互契约，模式组件处理页面布局，业务组件处理 Qmby 的领域对象；页面负责数据请求、权限和业务流程。
