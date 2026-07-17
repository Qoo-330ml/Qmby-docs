# Qmby 插件开发

这份指南面向希望为 Qmby 开发第三方工具的开发者。插件由独立的 Go 可执行文件组成；推荐使用 Qmby 原生 UI，由插件提供 Schema、状态和动作，Qmby 负责用自己的 React 组件渲染页面。只有需要完全自定义页面时，才使用兼容的 React 配置页。

## 先看这三份材料

| 内容 | 位置 | 用途 |
| --- | --- | --- |
| 原生 UI 协议 | 本页「原生 UI」章节 | Schema、状态、动作和 Qmby 原生组件映射 |
| UI 组件包 | [`../plugin-ui/`](../plugin-ui/) | 仅用于 `ui.type: iframe` 的 React + TypeScript + Tailwind 4 兼容页面 |
| 组件 API | [`../plugin-ui/DESIGN_SYSTEM.md`](../plugin-ui/DESIGN_SYSTEM.md) | 兼容页面的组件、Token、状态和页面组合规范 |
| Qmby 插件协议 | `qmby/v1` | 清单、进程接口、Host API 和发布要求 |

## 开发路线

1. 准备插件仓库和 `plugin.yaml`，选择 `native` 或兼容的 `iframe` UI。
2. 用 Go 实现插件进程，监听 `QMBY_PLUGIN_SOCKET`。
3. 原生 UI 实现 Schema、状态和动作接口；只有兼容模式才使用 `plugin-ui`。
4. 按需声明权限，并通过 `qmbyplugin` SDK 调用 Host API。
5. 写好插件 README，构建目标平台二进制并发布公开 Git 仓库。

## 1. 插件仓库

推荐结构（原生 UI）：

```text
qmby-example-plugin/
├── plugin.yaml
├── main.go
├── README.md
├── bin/
│   ├── plugin-linux-amd64
│   └── plugin-linux-arm64
└── main_test.go
```

使用 `ui.type: iframe` 时，再增加 `web/` 目录并通过 Go `embed` 打包页面资源。

一个 Git 仓库可以只包含一个插件，也可以在 `plugins/<plugin_id>/` 下包含多个插件。Qmby 识别以下清单位置：

```text
repo/plugin.yaml
repo/<plugin_id>/plugin.yaml
repo/plugins/<plugin_id>/plugin.yaml
```

## 2. plugin.yaml

最小清单：

```yaml
api_version: qmby/v1
id: example_tool
name: 示例工具
description: 展示一个带配置界面和后台任务的 Go 插件
author: your-name
project_url: https://github.com/your-name/qmby-example-plugin

backend:
  type: go_process
  binaries:
    linux_amd64: bin/plugin-linux-amd64
    linux_arm64: bin/plugin-linux-arm64

ui:
  path: /v1/ui/
  type: native

permissions:
  - config.read
  - config.write
  - logs.write
```

### 清单规则

- `api_version` 固定为 `qmby/v1`。
- `id` 使用 2 到 64 位小写字母、数字或下划线，并以字母开头。
- `backend.type` 固定为 `go_process`。
- 正式发布至少提供 `linux_amd64` 和 `linux_arm64`。
- `binaries` 的路径必须位于仓库内，不能使用绝对路径、`..` 或越界软链接。
- 只申请实际使用的权限。声明权限不等于绕过 Qmby 的功能开关或用户授权。

## 3. 实现插件进程

Qmby 启动插件时注入：

| 环境变量 | 用途 |
| --- | --- |
| `QMBY_PLUGIN_ID` | 当前插件 ID |
| `QMBY_PLUGIN_SOCKET` | 插件监听的 Unix Socket |
| `QMBY_PLUGIN_TOKEN` | 当前进程的随机令牌 |
| `QMBY_HOST_URL` | Host API 地址，通常为 `http://127.0.0.1:2084` |

安装 Go SDK：

```bash
go get github.com/Qoo-330ml/Qmby/pkg/qmbyplugin
```

服务端骨架（原生 UI）：

```go
package main

import (
    "encoding/json"
    "io"
    "log"
    "net/http"

    "github.com/Qoo-330ml/Qmby/pkg/qmbyplugin"
)

type uiState struct {
    ServerURL string `json:"server_url"`
    Enabled   bool   `json:"enabled"`
    Mode      string `json:"mode"`
}

var currentState = uiState{Mode: "incremental"}

func main() {
    host, err := qmbyplugin.NewClientFromEnv()
    if err != nil {
        log.Fatal(err)
    }

    mux := http.NewServeMux()
    mux.HandleFunc("GET /v1/health", func(w http.ResponseWriter, _ *http.Request) {
        writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
    })
    mux.HandleFunc("GET /v1/ui/schema", func(w http.ResponseWriter, _ *http.Request) {
        writeJSON(w, http.StatusOK, map[string]any{
            "version": "qmby/ui/v1",
            "title": "示例工具",
            "sections": []any{map[string]any{
                "title": "基础配置",
                "fields": []any{
                    map[string]any{"key": "server_url", "label": "服务地址", "component": "input", "required": true},
                    map[string]any{"key": "enabled", "label": "启用工具", "component": "switch", "default": true},
                    map[string]any{"key": "mode", "label": "运行模式", "component": "select", "options": []any{
                        map[string]string{"label": "增量", "value": "incremental"},
                        map[string]string{"label": "全量", "value": "full"},
                    }},
                },
            }},
            "actions": []any{
                map[string]string{"id": "save", "label": "保存配置", "kind": "save"},
                map[string]string{"id": "run", "label": "立即执行", "kind": "command", "variant": "secondary"},
            },
        })
    })
    mux.HandleFunc("GET /v1/ui/state", func(w http.ResponseWriter, _ *http.Request) {
        writeJSON(w, http.StatusOK, map[string]any{"data": currentState, "running": false})
    })
    mux.HandleFunc("PUT /v1/ui/state", func(w http.ResponseWriter, r *http.Request) {
        var request struct{ Data uiState `json:"data"` }
        if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
            writeJSON(w, http.StatusBadRequest, map[string]any{"error": map[string]string{"code": "INVALID_JSON", "message": "请求格式错误"}})
            return
        }
        currentState = request.Data
        writeJSON(w, http.StatusOK, map[string]any{"data": currentState, "message": "配置已保存"})
    })
    mux.HandleFunc("POST /v1/ui/actions/{id}", func(w http.ResponseWriter, r *http.Request) {
        _, _ = io.Copy(io.Discard, r.Body)
        if r.PathValue("id") != "run" {
            writeJSON(w, http.StatusNotFound, map[string]any{"error": map[string]string{"code": "NOT_FOUND", "message": "动作不存在"}})
            return
        }
        writeJSON(w, http.StatusOK, map[string]any{"data": currentState, "message": "任务已开始"})
    })

    _ = host
    log.Fatal(qmbyplugin.Serve(mux))
}

func writeJSON(w http.ResponseWriter, status int, value any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(value)
}
```

后台任务较复杂时，可以另外实现 `GET /v1/status`、`POST /v1/run` 和 `POST /v1/stop`，再在 UI Schema 中增加对应动作。使用原生 UI 时，插件页面不需要 `web/` 目录；使用兼容模式时，才需要通过 `embed` 提供页面资源。`qmbyplugin.Serve` 负责在 Qmby 提供的 Socket 上启动服务并校验插件进程令牌。

插件通用接口的标准响应格式：

```json
{
  "ok": true,
  "data": {}
}
```

失败响应至少包含可读的错误信息：

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_CONFIG",
    "message": "RSSHub 地址不能为空"
  }
}
```

## 4. 原生 UI（推荐）

原生 UI 不使用 iframe，也不需要复制 `plugin-ui`。插件只提供 Schema、配置状态和动作，Qmby 使用自己的 React 组件渲染页面。

清单中声明：

```yaml
ui:
  type: native
  path: /v1/ui/
```

插件进程提供以下接口：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/v1/ui/schema` | 返回页面字段、分区和动作 |
| `GET` | `/v1/ui/state` | 返回当前表单值和运行状态 |
| `PUT` | `/v1/ui/state` | 保存表单值 |
| `POST` | `/v1/ui/actions/<id>` | 执行一个插件动作 |

Schema 版本固定为 `qmby/ui/v1`：

```json
{
  "version": "qmby/ui/v1",
  "title": "示例工具",
  "description": "配置示例插件",
  "sections": [
    {
      "title": "基础配置",
      "fields": [
        {
          "key": "server_url",
          "label": "服务地址",
          "component": "input",
          "required": true,
          "placeholder": "https://example.com"
        },
        {
          "key": "enabled",
          "label": "启用工具",
          "component": "switch",
          "default": true
        },
        {
          "key": "mode",
          "label": "运行模式",
          "component": "select",
          "options": [
            { "label": "增量", "value": "incremental" },
            { "label": "全量", "value": "full" }
          ]
        }
      ]
    }
  ],
  "actions": [
    { "id": "save", "label": "保存配置", "kind": "save" },
    { "id": "run", "label": "立即执行", "kind": "command", "variant": "secondary" }
  ]
}
```

当前支持的 `component` 有：`input`、`password`、`number`、`textarea`、`select` 和 `switch`。Qmby 会分别使用自己的 `Input`、`Textarea`、`Select`、`Switch` 和 `Button` 渲染。

状态和保存请求：

```json
{
  "data": {
    "server_url": "https://example.com",
    "enabled": true,
    "mode": "incremental"
  },
  "running": false,
  "message": "配置已保存"
}
```

`PUT /v1/ui/state` 和 `POST /v1/ui/actions/<id>` 的请求体都是：

```json
{
  "data": {
    "server_url": "https://example.com"
  }
}
```

动作完成后返回最新状态。危险动作可以在 Schema 中增加 `confirm` 文案，Qmby 会在执行前确认。

`ui.path` 是以上四个 endpoint 的共同前缀；例如声明 `/v1/settings/` 后，接口就是 `/v1/settings/schema` 和 `/v1/settings/state`。推荐固定使用 `/v1/ui/`，避免不必要的约定差异。

原生 UI 的交互流程是：

```text
插件清单 → Qmby 工具卡片 → 原生 Dialog
                              ↓
              Qmby Input / Select / Switch / Button
                              ↓
                 插件 state / actions 接口
```

插件重启后，Qmby 会重新扫描插件目录、校验 `plugin.yaml`、启动 Go 二进制并检查 `/v1/health`。启动成功后，插件摘要会出现在「三方工具」页面；点击「配置」会打开 Qmby 原生 `Dialog`，随后由 Qmby 组件直接调用上述接口。整个过程没有 iframe，插件也不需要提供前端构建产物。

## 5. 兼容模式：自定义 UI

原生 UI 已经覆盖配置表单、状态和常见动作。需要完全自定义页面时，才使用 `ui.type: iframe`。

### 当前组件包发布形态

`plugin-ui` 当前以本仓库中的源码目录发布，不是一个可以直接 `npm install @qmby/plugin-ui` 的 npm 包。它只适用于 `ui.type: iframe` 的兼容模式；原生 UI 插件不需要复制它。

组件包只负责视觉和交互，不负责业务请求。插件仍然需要自己实现配置、状态和任务接口。

### 安装依赖

```bash
npm install react react-dom clsx tailwind-merge class-variance-authority lucide-react \
  @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-toast \
  @radix-ui/react-tooltip
```

项目需要启用 Tailwind CSS 4。把主题文件引入前端入口：

```tsx
// src/main.tsx
import "../plugin-ui/theme.css"
```

从统一入口导入组件：

```tsx
import {
  AlertBanner,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrap,
} from "../plugin-ui/src"

export function ConfigPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>工具配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="搜索任务" />
          <Button>新增任务</Button>
        </div>
        <AlertBanner variant="info">正在同步任务状态</AlertBanner>
        <TableWrap>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>名称</TableHeaderCell>
                <TableHeaderCell>状态</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              <TableRow>
                <TableCell>示例任务</TableCell>
                <TableCell><Badge variant="success">完成</Badge></TableCell>
              </TableRow>
            </tbody>
          </Table>
        </TableWrap>
      </CardContent>
    </Card>
  )
}
```

### Toast

应用根节点包裹 `ToastProvider`，页面组件用 `useToast` 触发操作反馈：

```tsx
import { ToastProvider, useToast } from "../plugin-ui/src"

function App() {
  return (
    <ToastProvider>
      <ConfigPage />
    </ToastProvider>
  )
}

function SaveButton() {
  const { toast } = useToast()

  return (
    <Button onClick={() => toast({ text: "配置已保存", variant: "success" })}>
      保存配置
    </Button>
  )
}
```

完整组件列表、变体、Token 和页面组合规则见 [`plugin-ui/DESIGN_SYSTEM.md`](../plugin-ui/DESIGN_SYSTEM.md)。当前导出包括 `Button`、`Card`、`Dialog`、`Input`、`Label`、`Select`、`Textarea`、`Switch`、`Badge`、`AlertBanner`、`EmptyState`、`Skeleton`、`Separator`、`Tooltip`、`ToastProvider`、`FilterRow`、`SegmentedControl`、`Table` 和 `Pagination`。

### iframe 配置页请求插件接口

iframe 页面运行在 sandbox 中。页面请求插件自己的接口时，使用相对路径并携带 scoped cookie：

```ts
async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "请求失败")
  return data
}

const config = await request("../config")
await request("../config", {
  method: "PUT",
  body: JSON.stringify(config),
})
```

不要在浏览器代码中读取、拼接或记录 `QMBY_PLUGIN_TOKEN`。

## 6. 调用 Host API

插件进程通过 SDK 创建客户端：

```go
host, err := qmbyplugin.NewClientFromEnv()
if err != nil {
    return err
}
```

SDK 会自动发送：

```text
Authorization: Bearer <QMBY_PLUGIN_TOKEN>
X-Qmby-Plugin-ID: <QMBY_PLUGIN_ID>
```

Host API 使用 `/api/plugin-host/v1/*` 版本前缀。插件不得依赖 Qmby 管理端 API，也不能直接访问数据库或内部 Go 对象。

### 常用能力

| 能力 | 权限 | SDK 方法 |
| --- | --- | --- |
| 私有配置和状态 | `config.read`、`config.write`、`state.read`、`state.write` | `GetConfig`、`PutConfig`、`GetState`、`PutState` |
| 日志 | `logs.write` | `Log` |
| Emby 搜索与合集 | `emby.items.read`、`emby.collections.*` | `SearchEmby`、`FindEmbyCollection`、`CreateEmbyCollection` |
| 媒体库封面 | `emby.libraries.read`、`emby.images.*` | `CoverLibraries`、`CoverLayouts`、`PreviewCover`、`ApplyCover` |
| 影子库同步 | `emby.shadow.write` | `SyncEmbyShadow` |
| 资源搜索 | `resources.search` | `SearchResourceMedia`、`SearchResourceSites` |
| 资源订阅 | `resources.subscriptions.*` | `ListResourceSubscriptions`、`CreateResourceSubscription`、`UpdateResourceSubscription` |
| STRM 任务 | `strm.read`、`strm.run` | `StrmStatus`、`StrmTasks`、`RunStrm`、`CancelStrm` |
| 识别整理 | `organizer.run` | `OrganizerStatus`、`RunOrganizer`、`CancelOrganizer` |
| 上传任务 | `upload.run` | `UploadTasks`、`UploadProgress`、`RunUpload`、`CancelUpload` |
| 115 文件 | `115.read`、`115.write` | `Accounts115`、`List115Files`、`List115Tree`、`Move115`、`Copy115` |
| 通知 | `notifications.send` | `SendNotification` |
| CookieCloud | `resource_sites.write` | `SyncCookieCloud` |

### 示例：搜索 Emby

```go
item, err := host.SearchEmby(ctx, qmbyplugin.EmbySearchRequest{
    Name: "Dune",
    MediaType: "movie",
    Year: 2024,
})
if err != nil {
    return err
}
if item != nil {
    fmt.Println(item.ID, item.Name)
}
```

### 示例：触发 STRM

```go
status, err := host.StrmStatus(ctx)
if err != nil {
    return err
}
if !status.Running {
    return host.RunStrm(ctx, 0, []string{"/media/Movie"})
}
return nil
```

### 示例：发送通知

```go
return host.SendNotification(ctx, qmbyplugin.NotificationMessage{
    Title:   "同步完成",
    Content: "已处理 12 个条目",
})
```

## 7. 插件文档怎么写

插件仓库至少包含一份 `README.md`，让用户不看源码也能完成安装、配置和排错。

推荐顺序：

1. **功能**：一句话说明插件解决什么问题，再列出适用场景。
2. **安装**：公开仓库地址、Qmby 版本要求、支持平台和安装步骤。
3. **权限**：逐条解释清单中的权限为什么需要。
4. **配置**：字段类型、默认值、必填性、校验规则和示例。
5. **使用**：配置页入口、运行方式、状态含义和常见结果。
6. **Host API**：使用的 SDK 方法、前置权限、请求参数和错误处理。
7. **构建发布**：构建命令、版本变更、已知限制和升级方式。
8. **安全**：明确不记录令牌、Cookie、密码和其他用户秘密。

最小模板：

```markdown
# 插件名称

## 功能
这个插件解决什么问题？

## 安装
1. 打开 Qmby「三方工具」的「源配置」。
2. 填写公开 HTTPS Git 仓库地址。
3. 保存并拉取，确认当前平台二进制可用。

## 权限
| 权限 | 用途 |
| --- | --- |
| config.read | 读取插件配置 |

## 配置
列出每个字段、类型、默认值和校验规则。

## 使用与排错
说明配置页、运行按钮、状态和常见错误。

## 构建与发布
说明支持的平台、构建命令、版本和已知限制。
```

## 8. 构建、安装和安全

构建 Linux 二进制：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
  go build -trimpath -o bin/plugin-linux-amd64 .
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 \
  go build -trimpath -o bin/plugin-linux-arm64 .
```

发布前检查：

- `plugin.yaml` 使用 `qmby/v1` 且字段完整。
- 当前目标平台的二进制存在并且可执行。
- `ui.type: native` 插件提供 `/v1/ui/schema`、`/v1/ui/state` 和动作接口；`ui.type: iframe` 插件的配置页已经由 Go `embed` 打包。
- `/v1/health` 可用；如果插件声明后台任务，`/v1/status`、`/v1/run`、`/v1/stop` 也应可用。
- 只声明实际使用的权限。
- README 写清安装、配置、接口、构建和安全边界。
- 不把令牌、Cookie 或密码写入日志、配置文件、前端代码或仓库。

管理员安装插件时，在 Qmby「三方工具」的「源配置」中填写公开 HTTPS Git 仓库地址，保存后 Qmby 会校验清单和当前平台二进制并启动插件。

Go 子进程仍然拥有容器内当前用户的操作系统权限。Host API 权限不能阻止插件访问其操作系统权限范围内的文件或网络，因此只安装可信仓库。
