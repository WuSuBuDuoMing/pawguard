/**
 * ai-service.js - AI 宠物助手服务
 * 本地规则版 AI 助手，基于关键词匹配和规则引擎生成回复
 * 预留 OpenAI / Claude / DeepSeek API 接口
 *
 * 安全原则：
 * - 不做医学诊断
 * - 严重症状提醒及时就医
 * - 给出护理建议而非确诊
 */

const petService = require('./pet-service');
const healthService = require('./health-service');
const careService = require('./care-service');
const inventoryService = require('./inventory-service');

/** 模拟延迟 */
function _delay(ms = 300) { return new Promise(r => setTimeout(r, ms)); }

/**
 * 物种专属信息
 */
const SPECIES_INFO = {
  cat: { name: '猫咪', emoji: '🐱', lifespan: '12-18年', weightRange: '3-5kg（短毛）' },
  dog: { name: '狗狗', emoji: '🐶', lifespan: '10-15年', weightRange: '因品种差异大' },
  rabbit: { name: '兔子', emoji: '🐰', lifespan: '8-12年', weightRange: '1.5-5kg', diet: '干草为主，适量蔬菜和兔粮', notes: '需要大量干草维持消化健康，不能喝太多牛奶' },
  hamster: { name: '仓鼠', emoji: '🐹', lifespan: '2-3年', weightRange: '30-150g', diet: '仓鼠粮为主，少量水果蔬菜', notes: '独居动物，合笼容易打架' },
  bird: { name: '鸟类', emoji: '🐦', lifespan: '5-30年（因品种而异）', weightRange: '因品种差异大', diet: '种子/颗粒粮为主，补充蔬菜水果', notes: '对空气中的有害物质非常敏感' },
  reptile: { name: '爬宠', emoji: '🦎', lifespan: '5-20年（因品种而异）', weightRange: '因品种差异大', diet: '因品种而异，昆虫/蔬菜/水果', notes: '需要精确的温度和湿度控制' },
};

/**
 * 紧急症状关键词 - 必须立即提醒就医
 */
const URGENT_KEYWORDS = [
  '带血', '血便', '便血', '吐血', '咳血',
  '呼吸困难', '喘不上气', '无法呼吸', '急促呼吸',
  '抽搐', '痉挛', '发抖不停',
  '不吃不喝', '两天不吃', '三天不吃', '长时间不吃', '完全不吃',
  '昏迷', '晕倒', '失去意识', '叫不醒',
  '骨折', '断了', '外伤', '大量出血',
  '中毒', '误食', '吃了异物',
  '腹胀', '肚子鼓', '胃扭转',
  '高烧', '体温超过', '烫的',
  '难产', '生不出来',
];

/**
 * 症状关键词分类
 */
const SYMPTOM_CATEGORIES = {
  vomiting: {
    keywords: ['呕吐', '吐了', '吐', '干呕', '反胃', '反酸'],
    advice: '关于呕吐的建议：\n\n1. **先禁食 4-6 小时**，但保持饮水\n2. 观察呕吐物颜色和频率\n3. 如果是偶发一次且精神状态好，可继续观察\n4. 如果频繁呕吐、呕吐物带血或有异物，请立即就医\n5. 猫咪偶尔吐毛球是正常的，但频繁吐毛球需要化毛膏辅助\n\n⚠️ 如果呕吐持续超过 24 小时、伴有腹泻或精神萎靡，请尽快联系兽医！',
  },
  diarrhea: {
    keywords: ['拉稀', '腹泻', '软便', '水样便', '拉肚子', '便便稀'],
    advice: '关于腹泻的建议：\n\n1. **先禁食 12 小时**（幼宠禁食不超过 6 小时），保持饮水\n2. 可以喂少量煮熟的南瓜泥（无糖无盐），有助于固便\n3. 观察便便颜色：黄色/棕色正常，黑色可能有内出血，绿色可能是胆汁问题\n4. 如果换粮引起的，需要 7-10 天的过渡期\n5. 益生菌可以帮助恢复肠道菌群\n\n⚠️ 如果腹泻带血、持续超过 2 天、伴有呕吐或精神萎靡，请立即就医！',
  },
  notEating: {
    keywords: ['不吃', '没食欲', '食欲差', '不吃东西', '食欲下降', '不爱吃', '挑食'],
    advice: '关于食欲下降的建议：\n\n1. 先检查食物是否新鲜，碗是否干净\n2. 可以尝试加热食物（微波 10 秒）增加香味\n3. 检查口腔是否有问题（牙龈红肿、口臭加重）\n4. 猫咪超过 24 小时不吃东西就有脂肪肝风险\n5. 狗狗超过 48 小时不吃需要重视\n6. 可以尝试换一种口味的食物\n\n⚠️ 如果完全不吃超过 24 小时（猫）或 48 小时（狗），或者伴有精神萎靡，请立即就医！',
  },
  skin: {
    keywords: ['掉毛', '脱毛', '皮屑', '瘙痒', '抓挠', '舔毛', '红疹', '疙瘩', '皮肤', '秃了一块'],
    advice: '关于皮肤问题的建议：\n\n1. 检查是否有跳蚤或蜱虫（翻开毛发看皮肤）\n2. 过度舔毛可能是压力、过敏或皮肤疾病\n3. 局部脱毛可能是真菌感染（猫癣）或螨虫\n4. 季节性掉毛是正常的，但大面积脱毛需要注意\n5. 保持环境清洁，定期清洗宠物用品\n6. 可以尝试换低过敏性粮食\n\n⚠️ 如果伴有皮肤溃烂、大面积脱毛或持续瘙痒，请带去兽医检查！',
  },
  water: {
    keywords: ['不喝水', '喝水少', '饮水', '喝水多', '爱喝水', '喝水', '水', '渴'],
    advice: '关于饮水的建议：\n\n1. 猫咪每天需要约 40-60ml/kg 体重的水\n2. 狗狗每天需要约 50-80ml/kg 体重的水\n3. 可以尝试流动饮水器增加饮水兴趣\n4. 在水中加少量鸡汤（无盐无调料）增加吸引力\n5. 湿粮含水量约 70-80%，可以增加湿粮比例\n6. 多放几个水碗在不同位置\n\n⚠️ 如果突然大量增加饮水量（多饮多尿），可能是糖尿病或肾脏问题的信号，请就医检查！',
  },
  eyes: {
    keywords: ['眼屎', '泪痕', '眼睛红', '眼睛肿', '流泪', '眼睛', '眯眼'],
    advice: '关于眼睛问题的建议：\n\n1. 少量眼屎是正常的，特别是短鼻犬猫\n2. 棕色泪痕在白色毛发宠物中常见\n3. 眼睛红肿可能是结膜炎或异物刺激\n4. 不要用手直接触碰眼睛\n5. 可以用宠物专用眼药水清洁\n\n⚠️ 如果眼睛红肿、分泌物增多、眯眼或角膜混浊，请尽快就医！',
  },
  ears: {
    keywords: ['耳朵', '耳螨', '甩头', '挠耳朵', '耳朵臭', '耳朵黑'],
    advice: '关于耳朵问题的建议：\n\n1. 频繁甩头或挠耳朵可能是耳螨或耳炎\n2. 耳朵有异味可能是细菌或酵母菌感染\n3. 检查耳道是否有深色分泌物（耳螨特征）\n4. 不要用棉签深入耳道清洁\n5. 可以使用宠物专用耳道清洁液\n6. 垂耳犬需要更频繁地检查耳朵\n\n⚠️ 如果耳朵严重红肿、有脓性分泌物或宠物表现出疼痛，请就医！',
  },
  breath: {
    keywords: ['口臭', '口气', '嘴臭', '流口水', '流涎'],
    advice: '关于口腔问题的建议：\n\n1. 轻微口臭可能是正常的，但严重口臭需要重视\n2. 口臭加重可能是牙周病、口腔溃疡或消化问题\n3. 定期刷牙（每周 2-3 次）可以预防口腔问题\n4. 洁齿棒和洁齿玩具也有帮助\n5. 3 岁以上的猫狗约 70% 有不同程度的牙周病\n\n⚠️ 如果伴有流涎、拒食或口腔出血，请带去兽医检查！',
  },
  cough: {
    keywords: ['咳嗽', '打喷嚏', '喷嚏', '流鼻涕', '鼻涕', '呼吸'],
    advice: '关于呼吸道症状的建议：\n\n1. 偶尔打喷嚏通常是正常的\n2. 频繁打喷嚏伴流鼻涕可能是感冒或上呼吸道感染\n3. 狗狗咳嗽可能是犬窝咳或气管问题\n4. 猫咪打喷嚏伴流泪可能是猫鼻支\n5. 保持室内通风，避免温差过大\n\n⚠️ 如果咳嗽持续、呼吸急促、鼻涕呈脓性或带血，请尽快就医！',
  },
  poop: {
    keywords: ['便便', '大便', '拉屎', '排便', '便秘', '拉不出'],
    advice: '关于排便问题的建议：\n\n1. 正常便便应该是成型的、棕色的\n2. 硬球状便便可能是缺水或便秘\n3. 给猫咪提供足够的水分和纤维\n4. 狗狗可以适当增加运动量促进肠蠕动\n5. 便秘超过 48 小时需要重视\n\n⚠️ 如果便便带血（鲜红或黑色）、有寄生虫或持续便秘，请就医！',
  },
  weight: {
    keywords: ['减肥', '太胖', '肥胖', '太瘦', '体重', '增重'],
    advice: '关于体重管理的建议：\n\n1. 理想体型：能摸到肋骨但看不到\n2. 减肥需要循序渐进，每周减重不超过体重的 1-2%\n3. 用低热量零食替代高热量零食\n4. 增加互动游戏时间\n5. 定期称重记录变化\n6. 过度消瘦同样需要注意，可能是寄生虫或疾病',
  },
  vaccine: {
    keywords: ['疫苗', '打针', '免疫', '预防针'],
    advice: '关于疫苗的建议：\n\n🐕 **狗狗基础疫苗：**\n- 犬四联/六联/八联：首免后每年加强一次\n- 狂犬疫苗：每年或每三年（根据当地法规）\n\n🐱 **猫咪基础疫苗：**\n- 猫三联：首免后每年加强一次\n- 狂犬疫苗：建议接种\n\n⏰ 疫苗可以推迟但不能忘记！请查看你的提醒中心了解下次接种时间。',
  },
  deworming: {
    keywords: ['驱虫', '虫', '寄生虫', '跳蚤', '蜱虫'],
    advice: '关于驱虫的建议：\n\n🐛 **体内驱虫：**\n- 幼宠：每月一次\n- 成年宠物：每 3 个月一次\n- 常见药物：拜耳、海乐妙等\n\n🐛 **体外驱虫：**\n- 每月一次（春夏季节尤其重要）\n- 常见药物：福来恩、大宠爱、尼可信\n\n💡 内外同驱产品（如大宠爱）可以一次搞定！',
  },
  bathing: {
    keywords: ['洗澡', '沐浴', '香波'],
    advice: '关于洗澡的建议：\n\n🛁 **洗澡频率：**\n- 猫咪：一般不需要洗澡（自我清洁），3-6 个月一次即可\n- 狗狗：每 2-4 周一次\n\n📝 **注意事项：**\n- 使用宠物专用沐浴露，不要用人的\n- 水温 37-38°C\n- 洗完立即吹干，避免感冒\n- 不要在刚吃完饭或剧烈运动后洗澡\n- 怀孕/生病/刚打完疫苗一周内不建议洗澡',
  },
  neutering: {
    keywords: ['绝育', '节育', '做手术'],
    advice: '关于绝育的建议：\n\n🏥 **最佳绝育年龄：**\n- 猫咪：6-8 个月\n- 小型犬：6-9 个月\n- 大型犬：12-18 个月\n\n✅ **绝育好处：**\n- 降低生殖系统疾病风险\n- 减少行为问题（标记领地、发情嚎叫等）\n- 猫咪绝育后平均寿命更长\n\n⚠️ 绝育后需要控制饮食，容易发胖！',
  },
  emergency: {
    keywords: ['急诊', '急救', '紧急', '怎么办', '救命'],
    advice: '🆘 **紧急情况处理指南：**\n\n1. **保持冷静**，观察宠物状态\n2. **立即联系**最近的宠物医院或 24 小时急诊\n3. 在就医途中保持宠物安静\n\n📞 **需要立即就医的情况：**\n- 呼吸困难或急促\n- 大量出血\n- 意识丧失或昏迷\n- 持续呕吐或腹泻超过 24 小时\n- 误食有毒物质\n- 抽搐或痉挛\n- 严重外伤或骨折\n\n⚠️ 本应用无法替代专业医疗，紧急情况请立即就医！',
  },
  fleas: {
    keywords: ['跳蚤', '蜱虫', '虱子', '体外虫'],
    advice: '关于体外寄生虫的建议：\n\n🐛 **常见体外寄生虫：**\n- 跳蚤：引起瘙痒、皮肤过敏\n- 蜱虫：可能传播疾病\n- 耳螨：引起耳朵瘙痒和黑色分泌物\n\n💊 **预防措施：**\n- 每月使用体外驱虫药\n- 定期清洗宠物用品\n- 避免去草丛密集区域\n- 回家后检查毛发\n\n⚠️ 发现蜱虫不要硬拔，用专用工具或就医处理！',
  },
  dental: {
    keywords: ['牙齿', '刷牙', '牙结石', '口腔'],
    advice: '关于口腔护理的建议：\n\n🦷 **口腔健康要点：**\n- 3 岁以上的猫狗约 70% 有牙周病\n- 定期刷牙（每周 2-3 次）是最有效的预防\n- 使用宠物专用牙刷和牙膏\n- 洁齿棒和洁齿玩具可以辅助\n\n🔍 **需要就医的信号：**\n- 口腔出血\n- 牙龈严重红肿\n- 流涎增多\n- 拒食或咀嚼困难\n\n💡 尽早开始刷牙训练，让宠物适应口腔护理！',
  },
  travel: {
    keywords: ['出行', '旅行', '坐车', '托运'],
    advice: '关于宠物出行的建议：\n\n🚗 **短途出行：**\n- 使用宠物安全带或航空箱\n- 不要把宠物放在副驾驶\n- 每 2 小时停车休息\n- 准备充足的饮水\n\n✈️ **长途旅行：**\n- 提前咨询航空公司宠物政策\n- 准备健康证明和疫苗证明\n- 航空箱需要足够大\n- 飞行前禁食 4-6 小时\n\n⚠️ 晕车的宠物可以咨询兽医开晕车药！',
  },
};

/**
 * 通用问题关键词
 */
const GENERAL_KEYWORDS = {
  greeting: {
    keywords: ['你好', '嗨', 'hi', 'hello', '在吗'],
    responses: [
      '你好呀！我是你的智能宠物助手 🐾 有什么关于宠物的问题都可以问我哦~',
      '嗨~ 有什么我能帮到你的吗？不管是喂食、健康还是日常护理，都可以问我！',
      '你好！我在呢~ 🐶🐱 告诉我你家毛孩子的情况，我来帮你分析分析~',
    ],
  },
  feeding: {
    keywords: ['喂多少', '怎么喂', '喂食', '吃多少', '一天喂几次', '猫粮', '狗粮'],
    advice: '关于喂食的建议：\n\n🍽️ **喂食量参考：**\n- 猫咪：体重(kg) × 40-60kcal/天\n- 狗狗：体重(kg) × 30-40kcal/天（视运动量调整）\n\n⏰ **喂食频率：**\n- 幼宠（<6月龄）：每天 3-4 次\n- 成年猫：每天 2 次\n- 成年狗：每天 2 次\n- 老年宠物：每天 2-3 次，少量多餐\n\n💡 定时定量喂食比自由采食更健康！',
  },
  food: {
    keywords: ['能吃什么', '不能吃什么', '人类食物', '水果', '蔬菜', '零食'],
    advice: '关于食物安全的建议：\n\n🚫 **绝对不能吃的：**\n- 巧克力、咖啡（含可可碱）\n- 葡萄、葡萄干（可能导致肾衰）\n- 洋葱、大蒜（破坏红细胞）\n- 木糖醇（口香糖中常见）\n- 生面团\n- 酒精\n\n✅ **可以少量吃的：**\n- 煮熟的鸡胸肉（无调料）\n- 南瓜泥（有助消化）\n- 蓝莓、西瓜（去籽）\n- 胡萝卜（煮熟）\n\n💡 任何新食物都要少量尝试，观察是否有不良反应！',
  },
  aging: {
    keywords: ['老了', '老年', '年纪大', '老龄', '寿命'],
    advice: '关于老年宠物护理：\n\n📅 **年龄换算：**\n- 猫咪 1 岁 ≈ 人类 15 岁\n- 猫咪 2 岁 ≈ 人类 24 岁\n- 之后每增加 1 年 ≈ 人类 4 崴\n- 狗狗因体型差异较大\n\n🐕 **老年护理要点：**\n- 每半年体检一次\n- 适当降低运动强度\n- 提供易消化的老年粮\n- 关注关节健康（补充关节保健品）\n- 保持生活环境舒适稳定',
  },
  behavior: {
    keywords: ['行为', '乱叫', '乱咬', '乱尿', '焦虑', '害怕'],
    advice: '关于行为问题的建议：\n\n🐾 **常见行为问题：**\n- 乱尿：可能是领地标记、泌尿问题或猫砂盆不满意\n- 乱咬：可能是磨牙需求、无聊或焦虑\n- 过度叫唤：可能是焦虑、求关注或身体不适\n\n💡 解决行为问题需要先排除健康原因，再从环境和训练入手。惩罚通常适得其反，正向强化更有效！',
  },
  stress: {
    keywords: ['应激', '搬家', '新环境', '紧张', '压力'],
    advice: '关于宠物应激的建议：\n\n😰 **常见应激原因：**\n- 搬家或环境变化\n- 新成员加入（人或宠物）\n- 长途旅行\n- 巨响（鞭炮、雷声）\n- 日常作息改变\n\n✅ **缓解方法：**\n- 提供安静的躲藏空间\n- 保持日常作息规律\n- 使用费洛蒙喷雾/插电\n- 给予更多陪伴和安抚\n- 不要强迫互动\n\n⚠️ 严重应激（不吃不喝、持续躲藏超过 3 天）需要就医！',
  },
  parasites: {
    keywords: ['寄生虫', '蛔虫', '绦虫', '球虫'],
    advice: '关于寄生虫的建议：\n\n🐛 **体内常见寄生虫：**\n- 蛔虫：幼宠常见，腹部膨大\n- 绦虫：可通过跳蚤传播\n- 球虫：幼宠腹泻常见原因\n- 钩虫：引起贫血\n\n💊 **驱虫方案：**\n- 幼宠：每月驱虫一次\n- 成年：每 3 个月一次\n- 生骨肉喂养：每月一次\n\n🔍 **感染信号：**\n- 便便中有虫体\n- 腹泻或软便\n- 体重下降\n- 腹部膨大（幼宠）\n\n⚠️ 发现寄生虫请尽快驱虫，严重感染需就医！',
  },
};
  rabbit: {
    keywords: ['兔子', '兔兔', '兔粮', '兔'],
    advice: '关于兔子护理的建议：\n\n🐰 **饮食要点：**\n- 提摩西草应占饮食的 80%，无限供应\n- 兔粮每天每公斤体重约 30g\n- 新鲜蔬菜每天少量（生菜、芹菜、胡萝卜叶等）\n- 水果只能偶尔当零食\n\n🏠 **环境需求：**\n- 需要足够大的活动空间\n- 提供躲藏处（纸箱、隧道）\n- 保持环境干燥通风\n\n⚠️ 兔子不吃不喝超过 12 小时是紧急情况，需立即就医！',
  },
  hamster: {
    keywords: ['仓鼠', '仓鼠粮', '鼠'],
    advice: '关于仓鼠护理的建议：\n\n🐹 **饲养要点：**\n- 笼子越大越好，最低 4500cm² 底面积\n- 跑轮直径至少 21cm（叙利亚仓鼠）\n- 不要用铁丝跑轮，容易卡脚\n- 垫材 15-20cm 厚，满足挖掘需求\n\n🍽️ **饮食：**\n- 仓鼠粮为主，每天约体重的 10-15%\n- 可以少量补充：西兰花、胡萝卜、苹果（去籽）\n- 绝对不能吃： citrus 水果、洋葱、大蒜、巧克力\n\n⚠️ 仓鼠是独居动物，合笼容易打架受伤！',
  },
  bird: {
    keywords: ['鸟', '鹦鹉', '鸟粮', '鸟笼'],
    advice: '关于鸟类护理的建议：\n\n🐦 **饲养要点：**\n- 笼子越大越好，至少能让展翅飞翔\n- 提供不同粗细的栖杆，锻炼脚部\n- 每天需要 10-12 小时的安静黑暗睡眠\n- 对空气中的特氟龙、香薰、烟雾非常敏感！\n\n🍽️ **饮食：**\n- 颗粒粮为主，搭配新鲜蔬菜水果\n- 牛油果、巧克力、咖啡对鸟有毒\n- 提供干净的饮用水，每天更换\n\n⚠️ 鸟类善于隐藏疾病，如果发现明显症状往往已经比较严重，需及时就医！',
  },
  reptile: {
    keywords: ['爬宠', '蜥蜴', '龟', '蛇', '守宫', '爬虫'],
    advice: '关于爬宠护理的建议：\n\n🦎 **环境要点：**\n- 温度梯度是关键：需要冷区和热区\n- 湿度需要根据品种精确控制\n- UVB 灯对大多数日行性爬宠必不可少\n- 定期检查加热设备，防止故障\n\n🍽️ **饮食：**\n- 因品种差异极大，请告诉我具体品种\n- 肉食性：蟋蟀、面包虫、乳鼠\n- 素食性：各种蔬菜、水果\n- 补钙很重要！定期撒钙粉\n\n⚠️ 拒食超过 2 周需要关注，可能是温度、蜕皮或疾病问题。',
  },
};

/**
 * 根据用户输入生成回复
 * @param {string} userMessage - 用户消息
 * @param {string} petId - 当前宠物 ID（可选）
 * @returns {Promise<{reply: string, isUrgent: boolean}>}
 */
async function chat(userMessage, petId) {
  await _delay(400 + Math.random() * 600);

  const msg = userMessage.toLowerCase().trim();

  // 检查紧急症状
  for (const kw of URGENT_KEYWORDS) {
    if (msg.includes(kw)) {
      return {
        reply: `🚨 **紧急提醒**\n\n你描述的症状「${kw}」可能比较严重！\n\n**请立即采取以下措施：**\n1. 保持冷静，观察宠物当前状态\n2. 记录症状出现的时间和频率\n3. **立即联系最近的宠物医院或 24 小时急诊**\n4. 在就医途中保持宠物安静\n\n📞 如果是夜间，可以拨打宠物急诊电话\n\n⚠️ 我无法进行医学诊断，以上仅为紧急提醒。请及时让专业兽医检查！`,
        isUrgent: true,
      };
    }
  }

  // 检查症状分类
  for (const [, category] of Object.entries(SYMPTOM_CATEGORIES)) {
    for (const kw of category.keywords) {
      if (msg.includes(kw)) {
        let petContext = '';
        if (petId) {
          const pet = await petService.getPetById(petId);
          if (pet) {
            const speciesInfo = SPECIES_INFO[pet.species] || SPECIES_INFO.other;
            petContext = `\n\n📌 这是针对 **${pet.name}**（${speciesInfo ? speciesInfo.name : '宠物'}，${pet.breed}）的建议。`;
          }
        }
        return { reply: category.advice + petContext, isUrgent: false };
      }
    }
  }

  // 检查通用问题
  for (const [, category] of Object.entries(GENERAL_KEYWORDS)) {
    for (const kw of category.keywords) {
      if (msg.includes(kw)) {
        if (category.responses) {
          const idx = Math.floor(Math.random() * category.responses.length);
          return { reply: category.responses[idx], isUrgent: false };
        }
        return { reply: category.advice, isUrgent: false };
      }
    }
  }

  // 检查是否有宠物数据相关的查询
  if (msg.includes('今天') && (msg.includes('任务') || msg.includes('照护') || msg.includes('要做'))) {
    if (petId) {
      const tasks = await careService.getTodayCares(petId);
      const pending = tasks.filter(t => !t.completed);
      const pet = await petService.getPetById(petId);
      const petName = pet ? pet.name : '你的宠物';
      if (pending.length === 0) {
        return { reply: `📋 ${petName} 今天的照护任务已经全部完成了！做得好~ 🎉`, isUrgent: false };
      }
      let reply = `📋 ${petName} 今天还有 **${pending.length}** 个任务未完成：\n\n`;
      pending.forEach(t => {
        const careType = { feeding: '🍽️ 喂食', water: '💧 换水', walking: '🐕 遛狗', playing: '🎾 玩耍', litter_box: '🧱 猫砂', grooming: '✨ 梳毛', bathing: '🛁 洗澡' };
        reply += `- ${careType[t.type] || t.type}（${t.scheduledTime}）\n`;
      });
      reply += '\n加油完成它们吧！💪';
      return { reply, isUrgent: false };
    }
  }

  if (msg.includes('体重') || msg.includes('多重')) {
    if (petId) {
      const pet = await petService.getPetById(petId);
      if (pet) {
        const weightHistory = await petService.getWeightHistory(petId);
        if (weightHistory.length > 0) {
          const latest = weightHistory[weightHistory.length - 1];
          const first = weightHistory[0];
          const diff = (latest.weight - first.weight).toFixed(1);
          const trend = diff > 0 ? '📈 增加' : diff < 0 ? '📉 减少' : '➡️ 稳定';
          return {
            reply: `⚖️ **${pet.name} 的体重记录：**\n\n当前体重：**${latest.weight}kg**\n记录日期：${latest.date}\n近期变化：${trend} ${Math.abs(diff)}kg\n\n${pet.species === 'cat' && pet.weight > 6 ? '⚠️ 猫咪体重偏重，建议控制饮食和增加运动量。' : pet.species === 'dog' && pet.weight > 30 ? '⚠️ 大型犬体重需关注，定期称重。' : '✅ 体重在正常范围内~'}`,
            isUrgent: false,
          };
        }
      }
    }
    return { reply: '⚖️ 关于体重，建议每周固定时间称重一次并记录。\n\n猫咪正常体重参考：\n- 短毛猫：3-5kg\n- 布偶猫：4.5-9kg\n- 英短：3.5-8kg\n\n狗狗因品种差异很大，建议咨询兽医了解理想体重范围。', isUrgent: false };
  }

  // 默认回复
  const defaults = [
    '我理解你的问题，但作为本地规则版助手，我的知识库可能覆盖不到这个话题。你可以尝试问我关于：\n\n🍽️ 喂食和饮食\n💧 饮水建议\n💊 疫苗和驱虫\n🔍 常见症状\n🛁 洗澡护理\n⚖️ 体重管理\n🐾 行为问题\n\n如果有严重的健康问题，请直接咨询兽医哦~',
    '这个问题有点超出我的能力范围了 😅 我擅长的是宠物日常护理、常见症状分析和喂食建议。\n\n你可以问我：\n- "猫咪呕吐怎么办？"\n- "狗狗不喝水怎么办？"\n- "该打什么疫苗？"\n- "今天该喂多少？"\n\n⚠️ 严重健康问题请咨询专业兽医！',
    '嗯，这个问题我需要更多信息才能回答 🤔\n\n你可以试试更具体地描述，比如：\n- 宠物的具体症状\n- 持续时间\n- 伴随的其他表现\n\n或者直接问我这些常见话题：喂食、驱虫、疫苗、洗澡、体重、行为等~',
  ];
  return { reply: defaults[Math.floor(Math.random() * defaults.length)], isUrgent: false };
}

/**
 * 生成今日个性化建议
 * @param {string} petId
 * @returns {Promise<string>}
 */
async function getDailyTip(petId) {
  await _delay(200);
  const tips = [
    '💡 猫咪每天需要 15-20 分钟的互动游戏时间，逗猫棒是最佳选择！',
    '💡 狗狗散步不只是排便，更是重要的嗅觉探索时间，让它多闻闻~',
    '💡 定期给宠物刷牙可以预防 80% 的口腔疾病！',
    '💡 夏天到了，注意给宠物提供充足的饮水和阴凉休息处。',
    '💡 宠物也需要社交！适当的社交可以帮助减少行为问题。',
    '💡 每周检查一次宠物的耳朵、眼睛和牙齿，早发现问题早处理。',
    '💡 给猫咪提供垂直空间（猫爬架）可以大大提升它的幸福感！',
    '💡 狗狗的指甲每 2-4 周需要修剪一次，听到"嗒嗒"声说明该剪了。',
    '💡 定期更换猫砂盆中的猫砂，每周彻底清洗一次猫砂盆。',
    '💡 多宠家庭建议每个宠物都有自己的食碗、水碗和休息空间。',
  ];
  if (petId) {
    const pet = await petService.getPetById(petId);
    if (pet) {
      const speciesTips = pet.species === 'cat' ? [
        `💡 ${pet.name} 是${pet.breed}，这个品种容易有心脏问题，建议每年做一次心脏超声检查。`,
        `💡 ${pet.name} 已经 ${Math.floor((Date.now() - new Date(pet.birthday).getTime()) / 31557600000)} 岁了，${Math.floor((Date.now() - new Date(pet.birthday).getTime()) / 31557600000) >= 7 ? '属于老年猫，建议每半年体检一次' : '定期体检保持健康'}！`,
      ] : [
        `💡 ${pet.name} 是${pet.breed}，每天需要至少 30 分钟的户外运动。`,
        `💡 ${pet.name} 已经 ${Math.floor((Date.now() - new Date(pet.birthday).getTime()) / 31557600000)} 岁了，${Math.floor((Date.now() - new Date(pet.birthday).getTime()) / 31557600000) >= 7 ? '属于老年犬，注意关节保健' : '保持规律的运动和饮食'}！`,
      ];
      tips.push(...speciesTips);
    }
  }
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * 获取预设问题列表（快捷提问）
 * @param {string} species - 宠物物种（可选，用于生成物种专属问题）
 * @returns {Array<{id: string, text: string, icon: string}>}
 */
function getQuickQuestions(species) {
  const base = [
    { id: 'q1', text: '今天该喂多少？', icon: '🍽️' },
    { id: 'q2', text: '多久驱虫一次？', icon: '🐛' },
    { id: 'q3', text: '疫苗多久打一次？', icon: '💉' },
    { id: 'q4', text: '该洗澡了吗？', icon: '🛁' },
    { id: 'q5', text: '能吃什么水果？', icon: '🍎' },
  ];

  const speciesSpecific = {
    cat: [
      { id: 'qc1', text: '猫咪呕吐怎么办？', icon: '🤮' },
      { id: 'qc2', text: '掉毛严重怎么办？', icon: '🐱' },
      { id: 'qc3', text: '不喝水怎么办？', icon: '💧' },
    ],
    dog: [
      { id: 'qd1', text: '狗狗不喝水怎么办？', icon: '💧' },
      { id: 'qd2', text: '乱咬东西怎么办？', icon: '🦷' },
      { id: 'qd3', text: '需要多大运动量？', icon: '🏃' },
    ],
    rabbit: [
      { id: 'qr1', text: '兔子不吃东西怎么办？', icon: '🐰' },
      { id: 'qr2', text: '兔子该喂什么？', icon: '🥬' },
      { id: 'qr3', text: '兔子拉稀怎么办？', icon: '💩' },
    ],
    hamster: [
      { id: 'qh1', text: '仓鼠需要多大笼子？', icon: '🐹' },
      { id: 'qh2', text: '仓鼠能合笼吗？', icon: '🏠' },
      { id: 'qh3', text: '仓鼠不吃东西怎么办？', icon: '🍽️' },
    ],
    bird: [
      { id: 'qb1', text: '鸟需要什么环境？', icon: '🐦' },
      { id: 'qb2', text: '鸟不能吃什么？', icon: '🚫' },
      { id: 'qb3', text: '鸟掉毛正常吗？', icon: '🪶' },
    ],
    reptile: [
      { id: 'qr1', text: '爬宠需要什么温度？', icon: '🌡️' },
      { id: 'qr2', text: '爬宠不吃东西怎么办？', icon: '🦎' },
      { id: 'qr3', text: '需要UVB灯吗？', icon: '💡' },
    ],
  };

  return [...base, ...(speciesSpecific[species] || speciesSpecific.cat)];
}

/**
 * 获取物种专属信息
 * @param {string} species
 * @returns {Object|null}
 */
function getSpeciesInfo(species) {
  return SPECIES_INFO[species] || SPECIES_INFO.other || null;
}

module.exports = { chat, getDailyTip, getQuickQuestions, getSpeciesInfo, SPECIES_INFO };
