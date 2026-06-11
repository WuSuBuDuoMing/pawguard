# 宠物数据模型与健康追踪系统

## 宠物数据模型 (Pet)

宠物档案是整个系统的核心实体，所有模块的数据都通过 `petId` 关联到宠物。

### 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识，格式 `pet_<timestamp><random>` |
| `name` | string | ✅ | 宠物名字，最长 20 字符 |
| `species` | string | ✅ | 物种：`cat`/`dog`/`rabbit`/`hamster`/`bird`/`reptile`/`other` |
| `breed` | string | ✅ | 品种名称 |
| `gender` | string | ❌ | 性别：`male`/`female` |
| `birthday` | string | ❌ | 生日，格式 `YYYY-MM-DD` |
| `weight` | number | ❌ | 体重(kg)，范围 0-100 |
| `neutered` | boolean | ❌ | 是否绝育 |
| `avatar` | string | ❌ | 头像路径 |
| `personality` | string[] | ❌ | 性格标签，如 `['粘人', '爱睡觉']` |
| `notes` | string | ❌ | 备注信息 |
| `createdAt` | string | ✅ | 创建时间 ISO 8601 |
| `updatedAt` | string | ✅ | 更新时间 ISO 8601 |

### 存储键名

- 存储键：`petList`
- 最大数量：10 只

### 关联关系

```
Pet (pet_001)
├── CareRecords      ← careRecords (petId)
├── FeedingRecords   ← feedingRecords (petId)
├── WaterRecords     ← waterRecords (petId)
├── HealthRecords    ← healthRecords (petId)
├── TrainingRecords  ← trainingRecords (petId)
├── ExpenseRecords   ← expenseRecords (petId)
├── Diaries          ← diaries (petId)
├── Album            ← album (petId)
└── BehaviorRecords  ← behaviorRecords (petId)
```

---

## 健康追踪系统

### 健康记录类型

| 类型标识 | 中文名 | 说明 |
|----------|--------|------|
| `vaccine` | 疫苗 | 疫苗接种记录，含下次接种日期 |
| `deworming` | 驱虫 | 体内外驱虫记录 |
| `visit` | 就诊 | 医院就诊、体检记录 |
| `medication` | 用药 | 长期或短期用药记录 |
| `abnormal` | 异常 | 异常症状观察记录 |

### 健康记录字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识 |
| `petId` | string | 关联宠物 ID |
| `type` | string | 记录类型（见上表） |
| `title` | string | 记录标题 |
| `date` | string | 记录日期 `YYYY-MM-DD` |
| `nextDate` | string | 下次日期（疫苗/驱虫用） |
| `clinic` | string | 诊所/医院名称 |
| `notes` | string | 备注 |
| `createdAt` | string | 创建时间 |

### 健康状态评估逻辑

```
getHealthStatus(records) → 'normal' | 'attention' | 'urgent'

规则：
1. 若近 30 天内有 abnormal 记录 → 'urgent'
2. 若疫苗已过期 (nextDate < today) → 'urgent'
3. 若驱虫已过期 (nextDate < today) → 'urgent'
4. 若疫苗 30 天内到期 → 'attention'
5. 若驱虫 7 天内到期 → 'attention'
6. 其他 → 'normal'
```

### 疫苗/驱虫提醒

- **疫苗提醒**：`nextDate` 距今 ≤ 30 天触发提醒
- **驱虫提醒**：`nextDate` 距今 ≤ 7 天触发提醒
- **过期检测**：`nextDate` < 今天标记为已过期

---

## 喂食管理

### 喂食记录字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识 |
| `petId` | string | 关联宠物 ID |
| `date` | string | 日期 |
| `time` | string | 时间 `HH:mm` |
| `foodName` | string | 食物名称 |
| `foodType` | string | 食物类型（主粮/罐头/冻干/零食/自制食物/处方粮/生骨肉/营养膏） |
| `brand` | string | 品牌 |
| `grams` | number | 克数 |
| `appetite` | string | 食欲状态（正常/偏少/偏多/不吃/狼吞虎咽） |
| `finished` | boolean | 是否吃完 |
| `notes` | string | 备注 |

### 食物类型

`主粮` | `罐头` | `冻干` | `零食` | `自制食物` | `处方粮` | `生骨肉` | `营养膏`

### 食欲状态

`正常` | `偏少` | `偏多` | `不吃` | `狼吞虎咽`

---

## 训练系统

### 训练记录字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识 |
| `petId` | string | 关联宠物 ID |
| `command` | string | 训练科目 |
| `date` | string | 日期 |
| `duration` | number | 时长(分钟) |
| `success` | boolean | 是否成功 |
| `reward` | string | 奖励方式 |
| `notes` | string | 备注 |

### 训练科目

`坐下` | `握手` | `召回` | `等待` | `随行`

### 徽章等级

| 等级 | 名称 | 成功次数要求 |
|------|------|-------------|
| 1 | 🥉 初学者 | ≥ 1 |
| 2 | 🥈 小能手 | ≥ 10 |
| 3 | 🥇 训练师 | ≥ 30 |
| 4 | 🏆 专家 | ≥ 100 |
| 5 | 👑 大师 | ≥ 300 |

---

## 饮水管理

### 饮水记录类型

| type | 说明 |
|------|------|
| `change` | 换水记录 |
| `intake` | 饮水量估算 |

### 异常检测规则

- **连续低饮水**：最近 3 天中 2 天饮水量 < 近期平均的 60%
- **连续高饮水**：最近 3 天中 2 天饮水量 > 近期平均的 150%（可能是糖尿病/肾脏问题信号）
- **长时间未换水**：距上次换水 ≥ 2 天

---

## 数据存储键名映射

| 键名 | 存储内容 | 类型 |
|------|----------|------|
| `petList` | 宠物列表 | Array |
| `careRecords` | 照护记录 | Array |
| `feedingRecords` | 喂食记录 | Array |
| `waterRecords` | 饮水记录 | Array |
| `healthRecords` | 健康记录 | Array |
| `trainingRecords` | 训练记录 | Array |
| `expenseRecords` | 开销记录 | Array |
| `inventoryList` | 库存列表 | Array |
| `diaries` | 成长日记 | Array |
| `album` | 相册 | Array |
| `behaviorRecords` | 行为记录 | Array |
| `userInfo` | 用户信息 | Object |
| `themeMode` | 主题模式 | string |
| `appSettings` | 应用设置 | Object |
| `firstLaunch` | 首次启动标记 | boolean |
| `searchHistory` | 搜索历史 | Array |
| `expense_budget` | 月度预算 | Object |
