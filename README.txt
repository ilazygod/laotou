白眉老头：忍者雨 · 水墨Studio独立升级版

试玩：直接打开 playtest.html（完整自包含，无外网依赖）。
完整说明：打开 TEST_REPORT.html。
手机比例试玩：phone_preview.html。
交互动作预览：animation_preview.html（建议本地HTTP）。
视频与GIF：previews/；原始动作GIF：qa/art/。
全部透明素材与Sprite Sheet：assets/。
v33参数对照：docs/technical/physics_comparison.html 与 CSV。
自动/浏览器测试：qa/vm_validation.json、qa/browser_validation.json。
Studio真实执行记录：docs/studio-execution.md。

36项自动测试、17项实际浏览器测试通过。173冻结文件未修改。
新增美术为内部验收候选；真实手机性能与触摸手感仍待人工确认。
已保留v33实际弹反端点判定；连续轨迹检测用于飞镖伤害。

本机运行交互预览（在本目录）：
python3 -m http.server 8767 --bind 127.0.0.1
然后访问 http://127.0.0.1:8767/phone_preview.html
