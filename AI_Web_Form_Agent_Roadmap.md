# AI Web Form Agent 分阶段开发路线图

> 目标：做一个可以用于简历和面试展示的 **Human-in-the-loop Web Form Agent**。  
> 核心能力：打开网页、识别表单、匹配用户资料、自动填写、生成日志、提交前等待人工确认。

---

## 0. 项目定位

这个项目不要定位成“自动填表脚本”，而要定位成：

> 一个基于 LLM 和 Playwright 的网页表单 Agent，可以根据自然语言任务识别页面表单字段，将用户资料映射到网页输入框，并通过浏览器自动执行填写动作，同时在提交前暂停等待人工确认。

面试时可以强调：

- 不是写死 selector 的脚本
- 使用 Playwright 控制真实浏览器
- 使用 LLM 做字段匹配
- 有执行日志和截图
- 有 Human-in-the-loop 安全机制

---

## 1. 推荐技术栈

### Backend

- Python
- FastAPI
- Playwright
- Pydantic
- OpenAI API / Gemini API

### Frontend

- React
- Vite
- CSS / TailwindCSS

### Storage

MVP 阶段可以不使用数据库。  
后期加分项可以使用 SQLite 保存：

- task
- action logs
- screenshot path
- created_at

---

## 2. 推荐项目目录

```text
ai-web-form-agent/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   ├── services/
│   │   │   ├── form_extractor.py
│   │   │   ├── field_mapper.py
│   │   │   ├── browser_executor.py
│   │   │   └── safety_checker.py
│   │   └── utils/
│   │       └── selectors.py
│   │
│   ├── screenshots/
│   ├── examples/
│   │   └── register.html
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   │       ├── TaskForm.jsx
│   │       ├── ActionLogs.jsx
│   │       ├── ScreenshotViewer.jsx
│   │       └── ApprovalPanel.jsx
│   └── package.json
│
├── docs/
│   ├── architecture.md
│   └── demo-flow.md
│
├── AGENT_RULES.md
├── TASKS.md
└── README.md
```

---

# Phase 1：本地测试表单

## 目标

先不要拿真实网站测试。  
先写一个本地 HTML 表单，方便你稳定测试 Playwright、字段提取和自动填写。

## 需要实现的功能

创建文件：

```text
backend/examples/register.html
```

内容包含：

- Full Name 输入框
- Email 输入框
- University 输入框
- Major 输入框
- Phone 输入框
- Submit 按钮

## 示例 HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Registration Form</title>
</head>
<body>
  <h1>Registration Form</h1>

  <form>
    <label for="fullName">Full Name</label>
    <input id="fullName" name="fullName" placeholder="Enter your full name" />

    <label for="email">Email Address</label>
    <input id="email" name="email" type="email" placeholder="Enter your email" />

    <label for="university">University</label>
    <input id="university" name="university" placeholder="Enter your university" />

    <label for="major">Major</label>
    <input id="major" name="major" placeholder="Enter your major" />

    <label for="phone">Phone Number</label>
    <input id="phone" name="phone" placeholder="Enter your phone number" />

    <button type="submit">Submit</button>
  </form>
</body>
</html>
```

## 完成标准

你可以用浏览器打开这个 HTML 文件，并看到一个简单表单。

## Codex 提示词

```text
Create a local HTML test form for the AI Web Form Agent.

Requirements:
- Put it under backend/examples/register.html
- Include fields: full name, email, university, major, phone
- Include a submit button
- Keep the HTML simple
```

---

# Phase 2：FastAPI 后端骨架

## 目标

搭建后端基础，让项目可以通过 API 接收任务。

## 需要实现的功能

创建：

```text
backend/app/main.py
backend/app/schemas.py
backend/requirements.txt
```

## API 设计

### GET /health

返回：

```json
{
  "status": "ok"
}
```

### POST /run-task

请求体：

```json
{
  "url": "https://example.com/form",
  "task": "Fill this registration form",
  "profile": {
    "name": "Tom Lee",
    "email": "tom@example.com",
    "university": "NUS",
    "major": "Computer Science",
    "phone": "91234567"
  }
}
```

MVP 初期可以先返回：

```json
{
  "message": "task received"
}
```

## 完成标准

你可以运行：

```bash
cd backend
uvicorn app.main:app --reload
```

然后打开：

```text
http://localhost:8000/docs
```

可以看到接口文档。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement the FastAPI backend skeleton.

Requirements:
- Create app/main.py and app/schemas.py
- Add GET /health
- Add POST /run-task
- /run-task accepts url, task, and profile
- Use Pydantic models
- Do not add Playwright yet
- Keep the code beginner-friendly
```

---

# Phase 3：Playwright 打开网页并截图

## 目标

证明后端可以控制真实浏览器。

## 需要实现的功能

创建：

```text
backend/app/services/browser_executor.py
```

实现函数：

```python
open_page_and_screenshot(url: str) -> dict
```

这个函数做：

1. 启动 Playwright
2. 打开 Chromium 浏览器
3. 进入 URL
4. 等待页面加载
5. 保存截图到 `backend/screenshots/`
6. 返回截图路径

## 推荐返回格式

```json
{
  "status": "success",
  "screenshot_path": "screenshots/task_001.png"
}
```

## 完成标准

调用 `/run-task` 后，可以打开网页并保存截图。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement Playwright browser opening and screenshot capture.

Requirements:
- Use async Playwright
- Create app/services/browser_executor.py
- Add open_page_and_screenshot(url)
- Save screenshots under backend/screenshots/
- Return screenshot path
- Update /run-task to call this function
- Do not add LLM yet
```

---

# Phase 4：表单字段提取 Form Discovery

## 目标

让项目从“写死 selector 的脚本”升级成“动态理解网页结构”。

## 需要实现的功能

创建：

```text
backend/app/services/form_extractor.py
```

提取页面中的：

- input
- textarea
- select
- checkbox
- radio
- button

每个字段尽量返回：

```json
{
  "tag": "input",
  "type": "email",
  "label": "Email Address",
  "name": "email",
  "id": "email",
  "placeholder": "Enter your email",
  "selector": "#email"
}
```

## 字段提取优先级

label 获取顺序：

1. `<label for="xxx">`
2. 父级 label
3. aria-label
4. placeholder
5. name
6. id

selector 生成优先级：

1. `#id`
2. `[name="xxx"]`
3. `input[type="email"]`
4. fallback 简单 selector

## 推荐新增 API

### POST /extract-fields

请求：

```json
{
  "url": "http://localhost:8000/examples/register.html"
}
```

返回：

```json
{
  "fields": [
    {
      "label": "Full Name",
      "selector": "#fullName"
    },
    {
      "label": "Email Address",
      "selector": "#email"
    }
  ]
}
```

## 完成标准

对于本地测试表单，可以正确提取出 5 个输入字段和 1 个 submit 按钮。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement Feature: Form Discovery.

Requirements:
- Create app/services/form_extractor.py
- Extract input, textarea, select, checkbox, radio, and button elements
- For each element return tag, type, label, name, id, placeholder, selector
- Try to find labels using label[for], parent label, aria-label, placeholder, name, id
- Add POST /extract-fields endpoint
- Do not add LLM yet
- Keep code simple and readable
```

---

# Phase 5：规则版字段匹配 Rule-based Field Mapping

## 目标

先不用 LLM，先用规则跑通完整流程。

## 为什么先做规则版

如果一开始就接 LLM，出错时你很难判断：

- 是表单提取错了？
- 是 LLM 输出错了？
- 是 Playwright 填写错了？

规则版可以先验证主流程。

## 需要实现的功能

创建：

```text
backend/app/services/field_mapper.py
```

实现：

```python
map_fields_by_rules(fields, profile) -> list
```

规则示例：

```text
如果 label/name/placeholder/id 包含 email -> profile.email
如果包含 name / full name -> profile.name
如果包含 university / school -> profile.university
如果包含 major -> profile.major
如果包含 phone / mobile -> profile.phone
```

## 推荐输出格式

```json
[
  {
    "selector": "#email",
    "field_label": "Email Address",
    "value": "tom@example.com",
    "source": "profile.email"
  },
  {
    "selector": "#fullName",
    "field_label": "Full Name",
    "value": "Tom Lee",
    "source": "profile.name"
  }
]
```

## 完成标准

对于本地测试表单，能正确生成字段映射。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement rule-based field mapping.

Requirements:
- Create app/services/field_mapper.py
- Add map_fields_by_rules(fields, profile)
- Match email, name, university, major, phone
- Return a list of fill actions with selector, field_label, value, source
- Do not use LLM yet
```

---

# Phase 6：自动填写 Browser Fill Execution

## 目标

让 Playwright 根据映射结果真正填写网页表单。

## 需要实现的功能

在：

```text
backend/app/services/browser_executor.py
```

新增：

```python
fill_form(url: str, fill_actions: list) -> dict
```

这个函数做：

1. 打开页面
2. 遍历 fill_actions
3. 对 input / textarea 执行 fill
4. 对 checkbox / radio 执行 check
5. 对 select 执行 select_option
6. 每一步生成日志
7. 填写完成后截图
8. 不点击 submit

## 推荐日志格式

```json
[
  {
    "step": 1,
    "action": "open_url",
    "status": "success",
    "message": "Opened target page"
  },
  {
    "step": 2,
    "action": "fill",
    "field": "Email Address",
    "selector": "#email",
    "value": "tom@example.com",
    "status": "success"
  }
]
```

## 完成标准

调用 `/run-task` 后，本地测试表单被自动填写，截图里可以看到表单已经填好。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement form filling execution.

Requirements:
- Update browser_executor.py
- Add fill_form(url, fill_actions)
- Use Playwright to fill input and textarea fields
- Add basic handling for checkbox, radio, and select
- Generate execution logs for each action
- Save screenshot after filling
- Do not click submit
- Update /run-task to call: extract fields -> rule mapping -> fill form
```

---

# Phase 7：提交前安全暂停 Human Approval

## 目标

让项目体现 Agent 安全边界。

## 需要实现的功能

创建：

```text
backend/app/services/safety_checker.py
```

检测 submit 类按钮：

关键词：

```text
submit
send
confirm
pay
delete
purchase
register
apply
continue
```

如果检测到这些按钮，不自动点击，而是返回：

```json
{
  "status": "waiting_for_approval",
  "reason": "Submit button detected",
  "submit_selector": "button[type='submit']"
}
```

## 推荐新增 API

### POST /confirm-submit

请求：

```json
{
  "task_id": "task_001"
}
```

MVP 阶段如果没有数据库，可以先不真正实现 task_id 状态管理。  
可以先做成前端展示按钮即可，后期再实现真正点击。

## 完成标准

`/run-task` 自动填写后，返回 `waiting_for_approval`，而不是直接提交。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement human approval safety check.

Requirements:
- Create app/services/safety_checker.py
- Detect buttons with text or type related to submit, send, confirm, pay, delete, purchase, register, apply
- After filling, do not click these buttons automatically
- Return waiting_for_approval status if a submit-like button is found
- Add logs explaining why the agent paused
```

---

# Phase 8：接入 LLM 字段匹配

## 目标

把规则匹配升级成 LLM 字段匹配，让项目更像 AI Agent。

## 需要实现的功能

在：

```text
backend/app/services/field_mapper.py
```

新增：

```python
map_fields_with_llm(fields, profile) -> list
```

LLM 只负责：

> 根据 fields 和 profile，输出 JSON 映射。

不要让 LLM 直接操作浏览器。

## 输入给 LLM 的信息

```json
{
  "fields": [
    {
      "label": "Email Address",
      "selector": "#email",
      "type": "email"
    }
  ],
  "profile": {
    "email": "tom@example.com"
  }
}
```

## 要求 LLM 输出

```json
[
  {
    "selector": "#email",
    "field_label": "Email Address",
    "value": "tom@example.com",
    "source": "profile.email"
  }
]
```

## 关键要求

- 强制 JSON 输出
- 后端要校验 JSON
- 如果 LLM 失败，fallback 到规则匹配
- 不要把敏感字段随意提交
- 不要让 LLM 输出 click submit

## 完成标准

对于不同 label 的表单，例如：

```text
Your Email
Contact Email
E-mail Address
```

LLM 都能匹配到 `profile.email`。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement LLM-based field mapping.

Requirements:
- Add map_fields_with_llm(fields, profile)
- LLM should only output JSON fill actions
- Validate the returned JSON
- If LLM fails, fallback to map_fields_by_rules
- Do not allow the LLM to output submit/click actions
- Keep the prompt short and clear
```

---

# Phase 9：React 前端 Dashboard

## 目标

让项目更适合展示和录 Demo。

## 需要实现的功能

前端只做一个页面，不要复杂化。

组件：

```text
TaskForm.jsx
ActionLogs.jsx
ScreenshotViewer.jsx
ApprovalPanel.jsx
```

## 页面布局

```text
左边：
- URL 输入框
- Task 输入框
- Profile JSON 输入框
- Run Agent 按钮

右边：
- Execution Logs
- Screenshot
- Approval Panel
```

## 前端流程

1. 用户输入 URL、task、profile
2. 点击 Run Agent
3. 前端调用 `POST /run-task`
4. 展示 logs
5. 展示 screenshot
6. 如果状态是 waiting_for_approval，显示 Confirm Submit 按钮

## 完成标准

可以通过 React 页面触发 Agent，并看到执行日志和截图。

## Codex 提示词

```text
Read AGENT_RULES.md.

Implement a simple React dashboard.

Requirements:
- Create TaskForm component
- Create ActionLogs component
- Create ScreenshotViewer component
- Create ApprovalPanel component
- User can enter url, task, and profile JSON
- Call backend POST /run-task
- Display returned logs and screenshot
- If status is waiting_for_approval, show Confirm Submit button
- Keep UI simple
```

---

# Phase 10：README 和 Demo

## 目标

把项目包装成可以放进 GitHub 和简历的项目。

## README 应该包含

- Project overview
- Tech stack
- Architecture
- Features
- How to run backend
- How to run frontend
- Demo flow
- Limitations
- Future improvements

## Demo 流程建议

录一个 1-2 分钟视频：

1. 打开 React 页面
2. 输入本地测试表单 URL
3. 输入 profile JSON
4. 点击 Run Agent
5. 显示日志
6. 显示填写后截图
7. 展示等待提交确认

## 简历写法

```text
AI Web Form Agent | Python, FastAPI, Playwright, React, OpenAI API

• Built a human-in-the-loop browser automation agent that converts natural language form-filling tasks into executable Playwright actions.
• Implemented dynamic form discovery by extracting input, textarea, select, checkbox, and radio elements with labels, placeholders, and selectors.
• Designed an LLM-based field mapping module to match user profile data with web form fields, reducing hard-coded selectors and improving task generalization.
• Added execution logs, screenshot tracing, and approval checkpoints to prevent unsafe actions such as final submission without user confirmation.
```

---

# 推荐开发顺序总结

如果你想速成，按这个顺序：

```text
Day 1:
Phase 1 + Phase 2
本地 HTML 表单 + FastAPI 骨架

Day 2:
Phase 3
Playwright 打开网页 + 截图

Day 3:
Phase 4
表单字段提取

Day 4:
Phase 5 + Phase 6
规则匹配 + 自动填写

Day 5:
Phase 7
提交前暂停

Day 6:
Phase 8
接入 LLM 字段匹配

Day 7:
Phase 9
React Dashboard

Day 8:
Phase 10
README + Demo 视频 + 简历描述
```

---

# MVP 完成标准

完成下面这些就可以写进简历：

- 用户输入 URL 和 profile
- 后端打开网页
- 自动提取表单字段
- LLM 或规则匹配字段
- Playwright 自动填写
- 生成执行日志
- 截图保存
- 检测提交按钮并暂停
- 前端展示日志、截图和确认按钮

---

# 不要做的内容

为了防止项目失控，暂时不要做：

- 登录系统
- 真实付款
- CAPTCHA 处理
- 绕过网站限制
- 自动投递大量申请
- 多 Agent
- RAG
- 长期记忆
- 复杂权限系统
- 多用户管理
- 云端浏览器集群
