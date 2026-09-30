---
id: l-rdtnet
title: L-RDTNet 低空雷达目标识别
category: 科研
status: 在投
highlight: IEEE TII 在投
role: 
advisor: 涂海程副教授
period: 
order: 2
tags: 雷达信号处理, 深度学习, 边缘部署, Jetson
summary: 面向低空工业安防与边缘端连续监视场景，研究基于距离-多普勒-时间（R-D-T）结构化表征的雷达目标识别方法。
---

## 研究问题

低空工业安防、园区巡检与边缘端连续监视场景中，雷达目标识别面临弱目标回波、杂波噪声干扰和相似运动模式难以区分等问题。

## 方法

- 基于距离-多普勒-时间（R-D-T）结构化表征构建识别网络
- 与手工特征、CNN、3D CNN 及 Transformer 类基线进行对比实验
- 完成消融实验，验证各模块的有效性

## 实验结果

- 准确率 95.06%，Macro-F1 95.04%，MCC 0.9341
- 模型仅 8.37M 参数
- 在 Jetson 平台实现 103.41 FPS 推理
