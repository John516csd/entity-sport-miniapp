/**
 * 根据字符串生成一致的颜色
 * 使用简单的哈希算法确保同样的字符串总是生成相同的颜色
 */

// 预定义的暗色调渐变色调色板，确保美观且高端
const colorPalettes = [
  {
    primary: '#2D1B69',
    secondary: '#11001C',
    accent: '#A855F7',
    name: 'Dark Purple'
  },
  {
    primary: '#1A1A2E',
    secondary: '#16213E',
    accent: '#3B82F6',
    name: 'Midnight Blue'
  },
  {
    primary: '#2C1810',
    secondary: '#1A0E0A',
    accent: '#F59E0B',
    name: 'Dark Brown'
  },
  {
    primary: '#0D1421',
    secondary: '#1C2541',
    accent: '#6366F1',
    name: 'Steel Blue'
  },
  {
    primary: '#1E3A5F',
    secondary: '#2D5016',
    accent: '#10B981',
    name: 'Forest Night'
  },
  {
    primary: '#2C1810',
    secondary: '#8B0000',
    accent: '#EF4444',
    name: 'Dark Red'
  },
  {
    primary: '#0F2027',
    secondary: '#203A43',
    accent: '#06B6D4',
    name: 'Ocean Deep'
  },
  {
    primary: '#2C3E50',
    secondary: '#4A6741',
    accent: '#84CC16',
    name: 'Charcoal Green'
  },
  {
    primary: '#1A252F',
    secondary: '#2C3531',
    accent: '#14B8A6',
    name: 'Teal Dark'
  },
  {
    primary: '#36213E',
    secondary: '#554971',
    accent: '#F97316',
    name: 'Plum Dark'
  }
];

/**
 * 简单的字符串哈希函数
 * @param str 输入字符串
 * @returns 哈希值
 */
function simpleHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash);
}

/**
 * 根据会员类型名称生成颜色主题
 * @param membershipTypeName 会员类型名称
 * @returns 颜色主题对象
 */
export function generateColorTheme(membershipTypeName: string) {
  if (!membershipTypeName) {
    return colorPalettes[0]; // 默认第一个主题
  }
  
  const hash = simpleHash(membershipTypeName.toLowerCase().trim());
  const paletteIndex = hash % colorPalettes.length;
  
  return colorPalettes[paletteIndex];
}

/**
 * 生成渐变CSS字符串
 * @param theme 颜色主题
 * @returns CSS渐变字符串
 */
export function generateGradientCSS(theme: ReturnType<typeof generateColorTheme>) {
  return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
}

/**
 * 生成背景圆圈的颜色（更深的版本，适合暗色调）
 * @param theme 颜色主题
 * @returns 背景圆圈颜色
 */
export function generateCircleColors(theme: ReturnType<typeof generateColorTheme>) {
  return {
    circle1: `${theme.accent}10`, // 使用accent色，低透明度
    circle2: `${theme.primary}08`  // 使用primary色，更低透明度
  };
}