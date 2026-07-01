# AI Web Form Agent 分阶段拓展路线图

> 目标：把项目从“可以自动填表的 demo”升级为一个更成熟、更可解释、可评估的 **Human-in-the-loop Web Form Agent**。
> 当前重点：准确率、可解释性、安全边界、真实表单适配、作品集包装。

---

## 0. 当前定位

这个项目最适合定位成：

> 一个基于 FastAPI、Playwright、React 和 LLM provider 的本地网页表单 Agent。它可以动态识别网页表单，把用户 Profile 映射到字段，在用户 review 后自动填写，并在最终提交前暂停等待人工确认。

面试时强调：

- 不是写死 selector 的脚本
- 使用 Playwright 控制真实浏览器
- 使用规则和 LLM 做字段映射
- 有 Profile memory 和用户修正缓存
- 有执行日志、截图、action trace 和 benchmark
- 有 Human-in-the-loop 安全机制
- 有明确边界：不绕过登录，不处理 CAPTCHA，不自动付款或批量提交

---

## 1. 当前已完成能力

### Backend

- FastAPI API
- SQLAlchemy + SQLite
- Profile / Task / FormField / Screenshot / ActionLog 等持久化模型
- 动态表单字段提取
- 规则字段匹配
- LLM 字段匹配
- OpenAI / Gemini / DeepSeek provider 选择
- LLM 配置检测和 setup hint
- LLM usage 记录
- LLM mapping cache
- user mapping override cache
- form analysis cache
- Confirm Mapping 时安全写回 Profile
- Playwright 自动填写
- 等待用户确认后才 submit
- 手动登录后继续 analyze
- Benchmark runner
- Admin action trace endpoint

### Frontend

- Dashboard
- Profiles
- Create Task
- Task Detail
- Review Mapping
- Benchmarks
- LLM provider 选择
- mapping review / manual correction
- profile update summary
- screenshots 展示
- task status 主操作流

### Tests and Evaluation

- pytest 后端测试
- Node test 前端测试
- 10 个本地 benchmark forms
- expected mapping JSON
- benchmark runs 持久化

---

## 2. 下一步最推荐方向

不要优先做“大而全”的功能，例如多用户、RAG、多 Agent、云端浏览器集群。
你现在最该做的是把已经有的 agent 变得更可靠、更可解释、更容易展示。

推荐顺序：

```text
Phase A: Benchmark 和准确率
Phase B: Review Mapping 和 Profile Memory 可控性
Phase C: 真实表单适配
Phase D: Observability / Debug
Phase E: Demo 包装和简历材料
```

---

# Phase A：Benchmark 和准确率

## 目标

让项目能回答：

- 当前 mapping 准确率是多少？
- 改了一个算法后有没有变好？
- rules 和 LLM 哪个在什么场景更强？
- 失败 case 是因为 extraction、mapping、required value 还是 action safety？

## 推荐任务

- Benchmark 页面支持选择：
  - rules
  - llm
  - provider: OpenAI / Gemini / DeepSeek
- Benchmark summary 展示：
  - extraction recall
  - mapping accuracy
  - required completion
  - non-fillable rejection
  - login gate detection
- 每个 failure 增加 diagnosis：
  - field not extracted
  - wrong profile key
  - missing required value
  - action field should be skipped
  - option value mismatch
- 增加更多 benchmark cases：
  - 多 section 申请表
  - radio group
  - checkbox group
  - option 文案和 profile 值不完全一致
  - first/last/full name 混合
  - 地址字段
  - 隐藏字段或动态字段

## 为什么优先做

这是最“工程化”的拓展。
它会让后续所有功能都有衡量标准，也很适合在面试中展示。

---

# Phase B：Review Mapping 和 Profile Memory

## 目标

让用户在填写前更快发现问题，并明确知道哪些值会被保存到长期 Profile。

## 推荐任务

- Required missing 字段置顶
- Low confidence 字段置顶或高亮
- 展示 skipped 字段和原因
- Confirm Mapping 后展示：
  - 写回了哪些 profile keys
  - previous value
  - new value
  - created / updated
- 增加 per-field 控制：
  - save to profile
  - do not save
  - one-time value
- 对 custom_values key 生成结果给用户确认或可编辑
- 对 one-time / sensitive 字段显示安全提示

## 和先前 profile memory 讨论的关系

你已经实现了后端 Confirm Mapping 自动写回 Profile。
下一步不是继续扩大记忆范围，而是让记忆更可控、更透明：

- 什么时候保存？
- 保存到哪里？
- 哪些字段被跳过？
- 用户是否能阻止保存？

这会让项目更像一个安全的 assistant，而不是黑盒自动化脚本。

---

# Phase C：真实表单适配

## 目标

让 agent 处理更多真实网页表单，而不是只在本地简单样例中表现好。

## 推荐任务

- 更好的 select 匹配：
  - value
  - label
  - partial match
  - synonym match
- 更好的 radio group 理解
- 更好的 checkbox group 理解
- 地址字段扩展：
  - address_line_1
  - city
  - state
  - zip
  - country
- 日期字段扩展：
  - date
  - month
  - year
  - graduation date
- 支持二次 extraction：
  - 填写某个字段后出现新字段
  - 选择某个 option 后出现 follow-up
- Fill 后校验：
  - 输入框值是否真的写入
  - select 是否真的选中
  - checkbox/radio 是否真的 checked

## 不要做

- 不处理 CAPTCHA
- 不绕过 anti-bot
- 不批量申请
- 不自动投递
- 不自动付款

---

# Phase D：Observability / Debug

## 目标

失败时能清楚解释：

- 哪一步失败？
- 哪个 selector 失败？
- 当时页面长什么样？
- LLM 返回了什么？
- cache 是否命中？
- 用户应该如何修复？

## 推荐任务

- Task Detail 增加 Timeline
- UI 展示 action trace summary
- 失败时展示：
  - phase
  - action
  - selector
  - field id
  - error message
  - screenshot
- 增加 copy debug report
- Task Detail 展示 LLM usage：
  - provider
  - model
  - token usage
  - cache hit rate
- Benchmark failure 链接到对应 form 和 expected JSON

## 为什么值得做

这会把项目从“能跑”变成“能解释”。
对 agent 项目来说，可解释性和安全边界一样重要。

---

# Phase E：Demo 包装和作品集

## 目标

让别人不用听你解释，也能在 2-3 分钟内看懂项目价值。

## 推荐文档

- `docs/architecture.md`
- `docs/demo-flow.md`
- `docs/safety-boundaries.md`
- `docs/benchmark-methodology.md`

## 推荐截图

- Dashboard
- Profile 编辑
- Create Task
- Review Mapping
- Task Detail 截图结果
- Benchmark results

## 推荐 Demo 视频结构

1. 打开 Dashboard，展示任务入口
2. 打开 Profile，展示可复用资料
3. 创建一个本地测试表单任务
4. Analyze + Generate Mapping
5. Review Mapping，手动修正一个值
6. Confirm Mapping，展示 Profile updates
7. Fill form，展示截图
8. 展示 WAITING_APPROVAL
9. 打开 Benchmarks，展示准确率和 failure details

控制在 1-2 分钟。

---

## 简历写法

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

如果需要更偏 AI/Agent：

```text
- Designed an LLM-assisted field mapping pipeline where the model proposes
  profile-to-field mappings, backend validation enforces safe actions, and users
  review corrections before browser execution.
```

如果需要更偏工程化：

```text
- Built a regression benchmark suite for form extraction and mapping quality,
  with persisted run history, per-case failures, and measurable accuracy
  metrics.
```

---

## 总结：从什么方面继续拓展？

最推荐的主线是：

```text
Benchmark -> Accuracy -> Review UX -> Observability -> Demo Packaging
```

这条路线最适合你的当前项目状态。
它不会把项目带偏成复杂平台，但会显著提高项目的成熟度、面试说服力和长期可维护性。
