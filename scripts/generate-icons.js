/**
 * 生成 tabBar 图标到 assets/icons/ 目录
 * 在微信开发者工具的「终端」中运行：node scripts/generate-icons.js
 * 或直接使用下方已编码的 base64 图标（写入文件）
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 简易 SVG 图标模板（微信 tabBar icon 要求 81x81 以上）
const icons = {
  // 首页 - 房子
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <path d="M40.5 10L8 36h8v30h20V50h9v16h20V36h8L40.5 10z" fill="none" stroke="#888" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
  'home-active': `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <path d="M40.5 10L8 36h8v30h20V50h9v16h20V36h8L40.5 10z" fill="#FF9F5A" stroke="#FF9F5A" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
  // 照护 - 爱心
  care: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <path d="M40.5 65C25 52 15 43 15 32c0-9 7-16 15-16 5 0 9 3 10.5 7 1.5-4 5.5-7 10.5-7 8 0 15 7 15 16C66 43 56 52 40.5 65z" fill="none" stroke="#888" stroke-width="3.5"/>
  </svg>`,
  'care-active': `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <path d="M40.5 65C25 52 15 43 15 32c0-9 7-16 15-16 5 0 9 3 10.5 7 1.5-4 5.5-7 10.5-7 8 0 15 7 15 16C66 43 56 52 40.5 65z" fill="#FF9F5A" stroke="#FF9F5A" stroke-width="2"/>
  </svg>`,
  // 宠物 - 猫爪
  pet: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <circle cx="28" cy="20" r="6" fill="none" stroke="#888" stroke-width="3"/>
    <circle cx="44" cy="14" r="6" fill="none" stroke="#888" stroke-width="3"/>
    <circle cx="58" cy="22" r="6" fill="none" stroke="#888" stroke-width="3"/>
    <path d="M20 38c0 0 5 8 20 8s20-8 20-8c0 0-5 18-20 18S20 38 20 38z" fill="none" stroke="#888" stroke-width="3.5"/>
  </svg>`,
  'pet-active': `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <circle cx="28" cy="20" r="6" fill="#FF9F5A"/>
    <circle cx="44" cy="14" r="6" fill="#FF9F5A"/>
    <circle cx="58" cy="22" r="6" fill="#FF9F5A"/>
    <path d="M20 38c0 0 5 8 20 8s20-8 20-8c0 0-5 18-20 18S20 38 20 38z" fill="#FF9F5A"/>
  </svg>`,
  // 我的 - 人像
  profile: `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <circle cx="40.5" cy="26" r="12" fill="none" stroke="#888" stroke-width="3.5"/>
    <path d="M15 66c0-12 11-20 25.5-20S66 54 66 66" fill="none" stroke="#888" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  'profile-active': `<svg xmlns="http://www.w3.org/2000/svg" width="81" height="81" viewBox="0 0 81 81">
    <circle cx="40.5" cy="26" r="12" fill="#FF9F5A"/>
    <path d="M15 66c0-12 11-20 25.5-20S66 54 66 66" fill="#FF9F5A" stroke="#FF9F5A" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

console.log('正在生成 tabBar 图标...\n');

// 微信小程序不支持 SVG 直接用于 tabBar icon，需要转为 PNG
// 这里写入 SVG 文件，实际使用时需转换为 PNG
// 也可以用 Canvas 在小程序内动态绘制
// 最简方案：写一个占位说明 + 改用自定义 tabBar
Object.entries(icons).forEach(([name, svg]) => {
  const filePath = path.join(iconsDir, `${name}.svg`);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`  ✓ ${name}.svg`);
});

// 同时生成一个 README 说明
const readme = `# TabBar 图标说明

微信小程序 tabBar 要求 PNG 格式图标（81×81px 以上）。

## 生成方式

### 方式 1：在线转换
将 .svg 文件上传到 https://convertio.co/svg-png/ 转为 PNG

### 方式 2：使用自定义 tabBar（推荐）
项目已配置自定义 tabBar，无需 PNG 图标。

### 方式 3：使用 emoji 作为 tabBar 图标
在自定义 tabBar 中直接使用 emoji 字符。
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme, 'utf-8');
console.log('\n  ✓ README.md');
console.log('\n完成！建议使用自定义 tabBar 方案。');
