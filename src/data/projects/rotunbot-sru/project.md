---
id: rotunbot-sru
name: Rotunbot SRU（论文）
shortName: Rotunbot SRU
category: 论文
status: 进行中
priority: P0
initialProgress: 42
repository: 
repositoryLabel: SRU GitHub
localPath: ~/legged_workspace/sru_rotunbot_study
targetDate: 
---

## 项目简介

将 SRU 时序模块接入 legged_gym 与 rsl_rl，完成训练验证、实验对比和论文整理。

## 注意事项

- 必须先导入 isaacgym，再导入 torch。
- 不要提交 .venv、Isaac Gym、logs 和 checkpoints。
- 检查旧目录是否仍被 editable 安装或配置引用。

## 里程碑

### M1 | 环境准备 | 已完成 | 2026-07-21

完成 Isaac Gym、PyTorch、legged_gym 与 CUDA 基线验证。

### M2 | SRU 核心验证 | 已完成 | 2026-07-21

确认 SRU 模块导入、前向接口与包安装路径。

### M3 | 训练框架接入 | 进行中

接入 ActorCriticSRULH、配置任务注册并检查 runner 接口。

### M4 | 训练与实验 | 未开始

完成冒烟训练、正式训练和对比实验。

### M5 | 论文整理 | 未开始

整理方法、实验、结果和论文材料。

## 当前问题

### 训练入口尚未完成端到端验证 | 处理中

需要检查 task registry、runner 和策略类实例化过程。

### 可能存在旧路径残留 | 待处理

需要继续搜索配置文件和 editable 安装信息。

