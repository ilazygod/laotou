# Studio Consistency Check — 2026-10-18

实际读取并执行历史 `consistency-check/SKILL.md`：先注册真实事实 → grep定位关联文档 → 对比有值字段 → 对单位差异做局部深查 → 报告。无人值守任务已明确授权生成缺失registry，无重复询问；未修改游戏或资产。

## Registry and Scope

`design/registry/entities.yaml` 原本不存在。已按本轮明确授权，从现有GDD、资源metadata、v33参数证据及最终代码建立真实registry：6 entities、0 items、2 formulas、29 constants。没有虚构游戏经济/道具。

严格按原技能排除 game-concept/systems-index/game-pillars 后，**系统GDD数量为0**。故不宣称完成不存在的多系统GDD审查。按本轮指定范围扩展核对5份已有合同：game-concept、Art Bible、ninja-assets、technical-contract、hud-and-screens，并以metadata与代码作为证据。全部定位行在 `studio_consistency_data.json`。

## Checked Cross-document Facts

| 检查 | 结果 | 证据说明 |
|---|---|---|
| Ninja size / pivot / scale | PASS | Bible §8, ninja spec ASSET-001, technical contract and metadata agree. Runtime images288² with origin144188 compensate exactly. |
| Ninja counts | PASS | 42 independent PNGs + 15 sheets; only 42 frames embedded. |
| Slash timing / radius | PASS | Effect metadata and frozen collision constant agree. |
| Slash local material age | PASS | Metadata and asset spec both specify tail-first local dissolution, not only whole-image alpha. Actual pixels/visual tests are separate evidence. |
| Corpse support unit conversion | PASS | Runtime hull is texture offsets, metadata hull is old local units. corpseVisualSupport divides runtime coordinates by2. Both describe same silhouette, not contradictory scales. |
| Ground line and HUD | PASS | Technical collision line G+23 aligns with background ink band; HUD starts G+26 for safeBottom=0, maintaining 3px visibility. |
| Ascent/fall speed-line counts | PASS | Spec 2–3 short strokes and real movement direction match render implementation. |
| No approval status inflation | PASS | New art acceptance pending, concept approval only freezes prior foundations. |
| 29 preserved code parameter evidence | PASS | Every exact v33 requirement fragment found in integrated playtest.html. Core function hash and behavior tests remain technical director/main QA evidence. |

## Deep Investigation / Resolved Apparent Differences

- 576²导出与288²运行缓存不是比例冲突：锚点同步减半，运行绘制scale恢复原v33局部比例。
- 尸体metadata凸包使用旧局部单位，runtime_geometry使用576图像像素差值；乘除2一致。
- 地面逻辑G与可见墨线G+23不是物理改动；合同明确保留原模拟支撑，grounded人物与尸体只做渲染接地校正。
- 彩色忍者同alpha但颜色不同属于用户要求，死亡仍保色。RGBA透明与参考图暖白背景不矛盾，PNG输出已真正透明。

## Notes / Unverifiable

- Art Bible中的“笔触统一、V字臂自然、背景不干扰”不能由文本或registry证明。已提供内部图片检查，最终Game View和用户观感仍待主任务/用户确认。
- 29个旧代码片段存在仅为静态一致性证据；不能替代触控、取消、双按、实际弹反的运行测试。
- performance目标为60Hz/p95≤20ms，尚无明文硬内存上限；不能声称内存预算通过。当前资产解码下限约63.12MiB，见asset audit。
- 原asset-manifest的VFX/UI行可能仍显示Assigned，属于制作进度记录未同步；资源已存在并被引用，不能把manifest状态当成未实现或用户验收。

## Verdict

**PASS — scoped contract facts; 0 confirmed value conflicts.** 严格系统GDD比较为N/A（无系统GDD）；不是全游戏验收。无旧registry，因此无stale历史项；新美术candidate状态保持。没有因审计重采样768/576非POT素材，也没有改正式工程。
