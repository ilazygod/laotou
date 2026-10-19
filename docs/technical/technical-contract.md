# 本轮技术合同

状态：Accepted within user-authorized art upgrade；2026-10-18。

## 执行环境

浏览器 JavaScript、Canvas 2D、DOM/CSS、Pointer Events。单文件 HTML 作为离线主交付；图片可内嵌，不依赖新外部网络包。已有本地脚本仅用于资产处理与测试。历史 Studio 是 Codex 技能/角色移植工作流，不是另一个实时编辑器服务。

## 变更边界

允许：新忍者、美术动画、剑光局部寿命、速度线、背景、UI、资源装载、测试入口。冻结：v33 的 resize/reset/performJump/jump/pressZone/startUltimate/spawnNinja/fireNinjaShot/scheduleAttack/kill/hitNinja/swordHit/corpseBottomOffset/update 及其关键常量。已通过 v05 上下落与 moon_v01 持剑文件逐字节复用；stage2 站立也保留。新增文件写新独立目录，不覆盖稳定版。

若 UI 改接原功能，保持同一事件语义：左右半屏 pointerdown；双侧同时或190ms内触发已就绪绝杀；轻功队列0.17s；title→ignite→zoom→tutorial→openingUlt→play 原开场状态保留。辅助 QA/demo 不能成为正式游戏默认免伤或改变计时。

## 实际代码参数证据

`physics_comparison.json`、`.csv`、`.html` 给29项参数，v33 / stage2代码行与片段。14核心函数 SHA256 相同，属于静态证据，不等于浏览器交互 PASS。

注意：取消窗口只是允许再次轻功，没有立即销毁slash；飞镖伤害是双方相对运动的连续轨迹检测，弹反是更新后端点对剑光包络。保留这些已确认语义，不擅自“修正”。

## 地面与锚点

G=H−max(116,102+safeBottom())；原safeBottom=0。hero站立逻辑y=G；ninja站立逻辑y=G−12；corpse接触面G+23。旧背景地面线也是G+23。因此只加一条精确背景线应以G+23为基准，但人物站立脚会有旧有的视觉偏差。可使用极窄地面墨带或纯渲染地面人物脚底校正；不要移动G、hero.y、n.y及碰撞中心。

stage2 站立画布512²，脚锚(256,470)，缩放0.2，world foot=(hero.x,hero.y+1)。保留图像，若需接触同一地线，仅改grounded绘制偏移，不能更改上升/下落/持剑锚点。

忍者上版画布576²，origin(288,376)，2像素=原1单位，layer0缩放0.12，layer1 0.1275；死亡0.1325。新素材应记录实际脚底与腰切口，独立半身不把透明空白当锚点。

## 尸体悬空的纯渲染修复

实测stage2 alpha≥32轮廓每5度投影，与原corpseBottomOffset代理的最大差：upper +5.15px悬空/−8.68px穿地，lower +4.20px悬空/−0.64px穿地。不是模拟不落地，而是美术轮廓与代理不吻合。

保留模拟 helper 和 update；对新死亡 PNG 预计算局部alpha轮廓凸包/每角度支撑值。设`S_visual=max((px-anchorX)*sin(rot)+(py-anchorY)*cos(rot))*drawScale`，`S_proxy=corpseBottomOffset(o)`；绘制世界y取`o.y+S_proxy−S_visual`，然后做原旋转。这样最低可见像素与原模拟支撑一致，不改变下落速度、旋转、反弹、休眠或推尸体。建议使用alpha32作为实体墨线边缘，允许极淡飞白零星像素下探。角度表插值避免跳动；如仅对落地/休眠启用，切换时应短时间渐变以免画面跳跃。

## 性能与验收

目标60Hz，常态主帧p95≤20ms；必须实测而非保证。390×844及其他手机比例；持续战斗、23忍者、尸体积累、双按绝杀清场。浏览器可用性/触控授权受限时继续无浏览器自动化，明确区分模拟测试与实际Game View。

验证清单：基础函数比对、资源hash、alpha透明、镜像、单独尸体休眠及最低像素地面接触、剑光角度前端同步/尾端先消散、速度线真实运动向量、真实左右输入/双按/开场、正常速度录屏。未执行不标PASS。
