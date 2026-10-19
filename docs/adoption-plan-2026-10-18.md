# Adoption Plan

> **Generated**: 2026-10-18
> **Project phase**: 已有可玩版本的制作与美术升级（Brownfield Production）
> **Engine**: HTML Canvas 2D / JavaScript / DOM / Pointer Events；自有 v33 模拟逻辑
> **Template version**: Claude-Code-Game-Studios-Codex 历史移植版；未推断其包版本号
> **Workflow**: 实际执行 `$studio-adopt full`，由 technical-director 角色读取运行时适配、审计文件格式、记录缺口和接入方案。不是仅阅读技能文档。

## 审计依据与授权

采用历史目录的 `docs/codex/runtime.md`、`.claude/agents/technical-director.md`、`.claude/skills/adopt/SKILL.md`、test-standards / gameplay-code / data-files 规则。Codex 运行时明确允许按角色简报实施工作流，并要求区分模板检查与真实游戏测试。

用户本轮已明确授权无人值守完成合理细节及必要写入，优先保存稳定工程。因此跳过技能中重复询问“是否写入计划”的确认步骤；不修改历史模板或已通过工程。不将模板的默认 Godot 文档当作本游戏引擎配置。

## Adoption Audit Summary

- Detected phase: Brownfield Production。原始项目已经存在完整可玩的 HTML、透明 PNG、动画预览、元数据和 QA 文件。不能因为没有 `src/` 或标准 GDD 路径而判成 Fresh。
- 标准 GDD 系统文档：0；ADR：0；Story：0。新目录的 `design/gdd/game-concept.md` 为用户冻结约束摘要，不计作系统 GDD。未扫描代理指令文件作为游戏内容。
- 真实非标准文档：`outputs/baimei_ink_stage2/README.txt`、`assets.json`、`production_notes.txt`、`test_report.html`、`qa/*.json`。已读取 README、资产元数据与旧保留报告；旧报告只作历史证据，本轮独立重算核心函数对比。
- 引擎事实可由 HTML 确定，标准 `.claude/docs/technical-preferences.md` 在原游戏目录中缺失。历史模板该文件仍全为 `[TO BE CONFIGURED]`，不能直接继承。
- 最新旧 adoption plan：未发现。
- Gap counts: BLOCKING 0；HIGH 4；MEDIUM 5；LOW 1。
- 运行边界：当前美术生产及 HTML 整合可按明确的本地技术合同继续。完整自动 Story / ADR 流水线尚未具备标准输入，不能宣称全模板兼容。

### Gap Preview

BLOCKING：无现有 ADR 状态解析或 systems-index 状态括号问题，因为这两类文件并不存在。

HIGH: 4；MEDIUM: 5；LOW: 1。

## Step 1: Fix Blocking Gaps

无。现有 gameplay-code 中“全部参数外置、依赖注入”等新项目规范不反向强制重构当前单文件游戏；用户冻结玩法和手感的要求优先。已有内联常量保留，另输出可审查参数表。

- [x] 识别真实项目，不重新执行 fresh onboarding 或重写已有设计。
- [x] 备份冻结源：173 文件，69,220,926 字节 ZIP，逐文件 SHA256 清单；`work/studio_v1/backups/`。
- [x] v33 与 stage2 14 个核心函数独立逐字节比较，29 项参数对照。

## Step 2: Fix High-Priority Gaps

### 1. 技术偏好与版本化引擎参考缺失（HIGH，约 5 分钟）

实际引擎是浏览器 Canvas 2D，不是 Unity、Godot 或 Unreal。没有锁定目标浏览器版本，不能填造版本号。

- [x] 在 `docs/technical/technical-contract.md` 写本轮引擎、输入、渲染/模拟边界、实际代码来源与测试目标。
- [ ] 后续若运行完整 `$studio-architecture-review`，先建立标准 `.claude/docs/technical-preferences.md` 和 `docs/engine-reference/web/VERSION.md` 路径映射；本轮不因这项文档迁移阻塞美术。

### 2. TR 注册表缺失（HIGH，约 30 分钟）

- [x] 为本次冻结要求建立 `docs/technical/requirements.json`，明确实际代码证据和验收方法。
- [ ] 若启用自动 Story 生成，在 ADR 格式准备完成后运行 `$studio-architecture-review` 生成标准 `docs/architecture/tr-registry.yaml`。当前 JSON 不是原生 TR registry 替身。

### 3. Control Manifest 缺失（HIGH，约 30 分钟）

- [x] 本轮写入技术合同，限定仅新增独立版本、仅改变渲染/资源/界面，不改变核心模拟。
- [ ] 需要 Story 流水线时运行 `$studio-create-control-manifest` 并添加 `Manifest Version:`；本轮未伪造该工作流执行记录。

### 4. 标准系统 GDD / 验收结构缺失（HIGH，约 1 session，仅完整模板流水线需要）

旧 README 和 assets.json 并没有 Overview / Player Fantasy / Detailed Rules / Formulas / Edge Cases / Dependencies / Tuning / Acceptance 八节标准系统格式。它们是交付说明与元数据，不冒充 GDD。

- [x] 复用用户现有设计与代码，不重新设计玩法；将本轮可测冻结合同放入技术文档。
- [ ] 只有以后确需生成跨系统 stories 才按 `$studio-design-system retrofit` 迁移相关说明，不覆盖本轮或历史批准动作。

## Step 3: Bootstrap Infrastructure

以下是完整模板接入的依赖顺序，不是已执行命令：

1. 已有 ADR 若未来迁入，先补 `## Status`、`## ADR Dependencies`、`## Engine Compatibility`、`## GDD Requirements Addressed`。
2. `$studio-architecture-review` → 标准 TR registry。
3. `$studio-create-control-manifest` → 带版本 manifest。
4. `$studio-sprint-plan update` → `production/sprint-status.yaml`。
5. `$studio-gate-check [phase]` → `production/stage.txt`。

本轮是范围明确的现有 HTML 美术升级，不为满足模板而虚构 GDD、ADR、故事、引擎版本或审批。

## Step 4: Medium-Priority Gaps

1. 无 authoritative `production/stage.txt`（MEDIUM，5 分钟）：新项目 `production/session-state/active.md` 记录实际进度；后续由真实 gate 写标准阶段，不假设模板 hook 自动运行。
2. 无 `production/sprint-status.yaml`（MEDIUM，5 分钟）：本轮使用明确执行清单；后续需要 sprint 技能时补齐。
3. 无标准 architecture-traceability（MEDIUM，30 分钟）：本轮 `requirements.json` 和参数表记录来源函数、代码行与验证类型，未来迁移标准矩阵。
4. 命名约定未标准配置（MEDIUM，5 分钟）：新增透明 PNG 用小写描述性命名；历史批准文件名保持。
5. 性能预算未标准配置（MEDIUM，5 分钟）：本轮约定 390×844、其他手机比例、持续战斗/尸体积累/绝杀清场；真实实测报告才可标通过。目标主循环 60Hz、常态帧时间 p95≤20ms，低性能设备实际结果如实记录，不称普遍保证。

## Step 5: Optional Improvements

1. 所有故事不存在 Manifest Version / TR-ID（LOW，未来创建时补）：当前无待迁移故事，因此不产生“故事合规 PASS”。不生成无实际任务价值的 story 集合。

## What to Expect from Existing Stories

当前没有标准 stories。日后迁入已有 stories 时保留原内容：缺失 TR-ID 或 Manifest Version 的模板检查可能自动通过，但无法获得过期追踪；不要重生成已经进行或完成的 stories。

## Review Mode

采用本轮角色分工的精简审查：技术角色核查冻结和参数，美术角色负责资产规格，主执行者整合并执行 QA。用户授权无人值守，不增加交互决策。本页记录该选择；不声称已写入原生 `production/review-mode.txt` 或已通过未执行的 director gates。

## Re-run

在新 HTML 整合后重新执行核心函数、资源 SHA256、地面支撑及浏览器实际运行验证。标准模板迁移缺口与游戏运行缺陷分开报告。
