# Studio Asset Audit — all — 2026-10-18

实际执行历史 `asset-audit/SKILL.md`：读取Art Bible/规格与技术合同 → 全目录扫描 → 逐项检查 → 输出报告。资产与游戏只读；报告写入由用户任务明确授权。未将模板工具自检当游戏验收。

## Summary

- 扫描文件：110；PNG：103；有效JSON：6。
- 命名/格式/透明硬错误：0；缺失运行时引用：0。
- 独立游戏清单 82 项，HTML内嵌PNG 82 项，逐项匹配。
- 运行时未直接引用PNG：21，其中 20 张交付Sprite Sheet、1 张背景浅深色QA预览。它们并非需要删除的孤儿。
- 资产文件总计 25.58 MiB；HTML 10.14 MiB。
- Overall health：MINOR ISSUES（预算与观感待确认，无缺失加载资源）。

## Dimensions and Format

| PNG尺寸 | 数量 |
|---|---:|
| 64×64 | 1 |
| 256×64 | 1 |
| 512×512 | 27 |
| 512×1024 | 1 |
| 576×576 | 42 |
| 768×768 | 9 |
| 780×844 | 1 |
| 1024×128 | 1 |
| 1152×576 | 3 |
| 1536×512 | 1 |
| 1728×576 | 12 |
| 2304×768 | 3 |
| 3072×2048 | 1 |

全部102张游戏PNG/Sheet为RGBA且存在真正alpha=0透明像素；唯一RGB文件 `assets/background/light_dark_preview.png` 是带背景的QA对照图，不被运行清单引用，属于明确的预览豁免。逐文件证据在 `studio_asset_audit_data.json`。全透明的crescent首尾帧是合法未起笔/已消失状态，不报作损坏。自然半透明边缘保留；本扫描不能自动判断所有白色是否属于合理飞白。三色忍者的深浅背景对照及QA另见 `ninja_asset_report.json`。

## Naming and Power-of-two Exceptions

所有PNG文件名使用小写、数字与下划线。Art Bible §8明确冻结现有文件名和集成动作命名，因此无需强改成模板通用category_name_variant_size格式。

共有 72 张非POT PNG。768²冻结主角、576²忍者、1536/1728/2304等横向Sheet均为Canvas 2D可用尺寸；该项目无WebGL纹理重复/Mipmap限制。记录为Canvas兼容/冻结豁免，不调整、不重采样已通过资产。

## References and Payload Identity

82项运行图均能从 `runtime_manifest.json` 对应到HTML内嵌 `SPRITE_DATA`。40 项字节相同；42 项为576→288忍者运行缓存。额外逐像素对比确认42项全部等于对应原件的Lanczos 288²缩小结果，动作、颜色与导出PNG对应。透明原件仍独立保存。

未直接载入的PNG仅作为导出Sheet或QA预览，具体清单：

- assets/background/light_dark_preview.png
- assets/effects/crescent_sheet.png
- assets/ninja/green/throw_air_sheet.png
- assets/ninja/green/throw_ground_sheet.png
- assets/ninja/green/air_sheet.png
- assets/ninja/green/patrol_sheet.png
- assets/ninja/green/death_sheet.png
- assets/ninja/red/throw_air_sheet.png
- assets/ninja/red/throw_ground_sheet.png
- assets/ninja/red/air_sheet.png
- assets/ninja/red/patrol_sheet.png
- assets/ninja/red/death_sheet.png
- assets/ninja/black/throw_air_sheet.png
- assets/ninja/black/throw_ground_sheet.png
- assets/ninja/black/air_sheet.png
- assets/ninja/black/patrol_sheet.png
- assets/ninja/black/death_sheet.png
- assets/frozen/idle/idle_sheet.png
- assets/frozen/moon/moon_sheet.png
- assets/frozen/jump/jump_sheet.png
- assets/frozen/fall/fall_sheet.png

## Memory Budget

82项运行PNG解码下限约 **63.12 MiB**（宽×高×4，不含浏览器副本、HTML字符串、Canvas和合成缓存）。42张忍者运行缓存288²约13.29MiB；若错误载入576²全尺寸会约53.16MiB。所有导出PNG一次性解码约205.90MiB，但游戏不加载Sheet。

历史模板technical-preferences预算仍为空；本工程技术合同给60Hz/p95≤20ms目标，没有硬内存上限。故内存预算状态为 **MEASURED / LIMIT NOT SPECIFIED**，不得把缺少预算标为PASS。建议后续真机测峰值内存，当前正常浏览器实测由主任务报告。

## Verdict: WARNINGS

结构、引用与透明检查通过。新增忍者/特效最终风格和运动观感仍待用户确认；此审计不替代真实Game View。没有修改任何PNG、游戏代码或冻结资产。
