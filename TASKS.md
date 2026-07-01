# TASKS.md

> 用这个文件追踪下一步开发。
> 原则：每次只做一个小功能；先提升可靠性和可展示性，再扩展复杂能力。

---

## 当前项目状态快照

项目已经从最早的 MVP 骨架，进化成一个带数据库、Profile、Task 状态机、Review Mapping、LLM provider、Benchmark 和 Action Trace 的本地 Human-in-the-loop Web Form Agent。

已经具备：

- [x] FastAPI 后端
- [x] React + Vite 前端
- [x] SQLite + SQLAlchemy 持久化
- [x] Profile CRUD
- [x] Task 创建、列表、详情
- [x] Playwright 打开网页、填写、截图、提交
- [x] 动态表单字段提取
- [x] 规则版字段匹配
- [x] LLM 字段匹配
- [x] OpenAI / Gemini / DeepSeek provider 选择
- [x] LLM provider setup hint
- [x] LLM 失败 fallback 到规则匹配
- [x] Review Mapping 页面
- [x] 用户手动修正 mapping
- [x] Confirm Mapping 后自动写回 Profile
- [x] 自定义 Profile values
- [x] LLM mapping cache
- [x] User mapping override cache
- [x] Form analysis cache
- [x] 提交前 WAITING_APPROVAL
- [x] 用户确认后才 submit
- [x] 手动登录后继续 analyze 的流程
- [x] Action logs
- [x] Screenshots
- [x] Admin action trace endpoint
- [x] Benchmark runner
- [x] Benchmark 页面
- [x] 后端 pytest 测试
- [x] 前端 Node test 测试

---

## 当前核心工作流

```text
Profile
  -> Create Task
  -> Analyze form
  -> Generate mappings (rules or LLM)
  -> Review Mapping
  -> Confirm Mapping and update reusable profile memory
  -> Fill form
  -> WAITING_APPROVAL
  -> User confirms submit
  -> COMPLETED
```

状态机重点：

- `CREATED`: 等待分析
- `ANALYZING`: 正在提取字段
- `LOGIN_REQUIRED`: 需要人工登录
- `MAPPING_READY`: 字段已提取，等待映射或 review
- `READY_TO_FILL`: mapping 已确认
- `FILLING`: 正在填写
- `WAITING_APPROVAL`: 已填写，等待用户确认提交
- `COMPLETED`: 用户确认后提交完成
- `FAILED`: 流程失败

---

## 下一阶段推荐路线

不要马上做多用户、RAG、多 Agent 或云端浏览器。现在最有价值的扩展方向是：

1. 让现有 Agent 更准。
2. 让失败原因更可解释。
3. 让真实表单适配更稳。
4. 让 Demo 和简历呈现更完整。

---

## Milestone 20：可靠性和 Benchmark 优先

目标：把项目从“功能能跑”推进到“质量可衡量”。

- [ ] 记录当前 rules 模式 benchmark baseline 分数
- [ ] 支持在 Benchmark 页面选择 `rules` 或 `llm`
- [ ] 支持在 Benchmark 页面选择 LLM provider
- [ ] 在 Benchmark 结果中展示 extraction、mapping、required completion、non-fillable rejection 等分项指标
- [ ] 给每个 benchmark case 增加一句 failure diagnosis
- [ ] 新增至少 5 个真实表单模式样例：
  - [ ] 多 section 表单
  - [ ] select option 文案和 profile 值不完全一致
  - [ ] radio group
  - [ ] checkbox group
  - [ ] required field 缺失但可手动补
- [ ] 增加 benchmark regression 测试，防止核心匹配能力回退

建议先做这个，因为它会给后续所有改进一个可量化的目标。

---

## Milestone 21：Review Mapping 体验升级

目标：让用户更快发现 agent 不确定、缺失或可能危险的字段。

- [ ] 把 required missing 字段固定在 Review Mapping 顶部
- [ ] 按 confidence 排序或高亮低置信字段
- [ ] 对 skipped / non-fillable / action 字段显示简洁原因
- [ ] Confirm Mapping 后展示 profile updates 和 skipped summary
- [ ] 增加“不要保存到 profile”的 per-field 控制
- [ ] 增加“本次只填，不写入长期 profile”的 manual value 模式
- [ ] Profile updates summary 支持 previous/new diff 的更清晰展示
- [ ] 增加 Review Mapping 页面测试，覆盖低置信、必填缺失、custom option

这是和先前 profile memory 讨论最直接衔接的一段：现在后端已经会自动写回，下一步应该把“用户可控性”和“可解释性”补强。

---

## Milestone 22：表单理解能力增强

目标：让 agent 面对真实网页时更稳，而不是只适配简单输入框。

- [ ] 提升 select option 匹配：按 label/value/近义词匹配
- [ ] 提升 radio group 匹配：同一 group 合并理解
- [ ] 提升 checkbox 语义：区分 agree/subscribe/skill/interests
- [ ] 支持 date/month/year 拆分字段
- [ ] 支持 first_name / last_name / full_name 的双向拆分与合并
- [ ] 支持 address/city/state/zip/country 等常见 Profile 字段
- [ ] 提取 inline validation message
- [ ] Fill 后检查字段是否真的写入成功
- [ ] 对动态出现的 follow-up fields 做二次 extract

注意：这些是“表单适配”增强，不是“绕过网站限制”。

---

## Milestone 23：可观测性和 Debug 能力

目标：失败时能回答“为什么失败、失败在哪一步、怎么复现”。

- [ ] 在 Task Detail 增加 Timeline 视图
- [ ] 在 UI 展示 action trace summary
- [ ] 每个失败 trace 显示 selector、field_id、error_message、screenshot
- [ ] 增加“copy debug report”按钮
- [ ] 将 LLM usage 和 cache hit rate 展示到 Task Detail
- [ ] Benchmark failure 可以链接到对应 form 和 expected JSON
- [ ] 对 FAILED 状态给出下一步建议，例如重新 analyze、改用 rules、检查 login

这个方向很适合面试展示，因为它体现工程化，而不只是 demo 效果。

---

## Milestone 24：真实网站安全适配

目标：有限、可控地支持更多真实网站，不做危险自动化。

- [ ] 给 manual login flow 增加更清楚的 UI 引导
- [ ] 保存并复用同一 profile 的 Playwright storage state
- [ ] 对 login-required 检测增加 benchmark case
- [ ] 增加 URL allowlist / blocklist 配置
- [ ] 对 payment/delete/purchase 等高风险页面显示硬阻断
- [ ] 对 CAPTCHA 或 bot challenge 显示明确“不支持”
- [ ] 真实网站测试只选低风险表单，例如活动报名、公开联系表单、个人测试表单

不要做：

- [ ] 不做 CAPTCHA 处理
- [ ] 不做批量申请
- [ ] 不做自动付款
- [ ] 不做绕过登录
- [ ] 不做多用户权限系统

---

## Milestone 25：项目包装和作品集

目标：把项目变成别人一打开就能理解、能跑、能评价的作品。

- [ ] 写 `docs/architecture.md`
- [ ] 写 `docs/demo-flow.md`
- [ ] 写 `docs/safety-boundaries.md`
- [ ] 写 `docs/benchmark-methodology.md`
- [ ] 截取关键页面截图：
  - [ ] Dashboard
  - [ ] Profiles
  - [ ] Review Mapping
  - [ ] Task Detail with screenshot
  - [ ] Benchmarks
- [ ] 录制 1-2 分钟 Demo 视频
- [ ] README 增加 GIF 或截图
- [ ] README 增加 architecture diagram
- [ ] README 增加 benchmark baseline 结果
- [ ] 整理 GitHub 仓库
- [ ] 写简历 bullet points

简历方向：

```text
AI Web Form Agent | Python, FastAPI, Playwright, React, LLM APIs

- Built a human-in-the-loop browser automation agent that dynamically extracts
  web form fields, maps reusable profile data, and fills forms through a real
  Playwright browser session.
- Implemented review-first safety controls, screenshots, action logs, and
  approval checkpoints to prevent unsafe final submission.
- Added LLM-assisted field mapping with provider selection, fallback rules,
  mapping caches, user override memory, and local benchmark evaluation.
```

---

## 建议的实际开发顺序

如果你现在问“下一步做什么”，推荐顺序是：

1. Benchmark 页面支持 rules/LLM/provider 选择。
2. 增加 5 个更接近真实网站的 benchmark case。
3. 改进 select/radio/checkbox option matching。
4. Review Mapping 顶部聚合 required missing 和 low confidence。
5. Task Detail 增加 Timeline / Trace summary。
6. 写 architecture 和 demo-flow 文档。
7. 录 Demo 视频并补 README 截图。

这条线最适合继续拓展：它不会让项目发散，又能让你的 agent 看起来更成熟、更可解释、更适合面试。
