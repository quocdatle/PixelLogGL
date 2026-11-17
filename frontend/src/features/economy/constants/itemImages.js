// Tự động load toàn bộ hình ảnh trong assets/items bằng Vite import.meta.glob
const itemImages = import.meta.glob('/src/assets/items/*.png', { eager: true, import: 'default' });
const itemImagesRelative = import.meta.glob('../../../assets/items/*.png', { eager: true, import: 'default' });

/**
 * Trả về URL của ảnh vật phẩm từ assets/items/
 * @param {string|object} itemOrKey - Tên file ảnh (vd: "wooden_sword.png" hoặc "wooden_sword") hoặc object item
 * @returns {string|null} URL ảnh đã được Vite xử lý, hoặc null nếu không tìm thấy
 */
export function getItemImageUrl(itemOrKey) {
  if (!itemOrKey) return null;

  let imageKey = typeof itemOrKey === 'string' ? itemOrKey : (itemOrKey.image || itemOrKey.imageUrl);
  if (!imageKey && typeof itemOrKey === 'object' && itemOrKey.name) {
    // Thử đoán image key từ tên vật phẩm nếu thiếu trường image
    imageKey = itemOrKey.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  if (!imageKey) return null;
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://') || imageKey.startsWith('data:')) {
    return imageKey;
  }

  let baseName = imageKey.replace(/\.png$/, '').toLowerCase();

  // Alias nếu dùng tên khác
  if (baseName === 'karambit_case_hardened') {
    const key = `/src/assets/items/karambit_case_hardened.png`;
    const fallback = `/src/assets/items/karambit_blue_gem.png`;
    if (itemImages[key]) return itemImages[key];
    if (itemImages[fallback]) return itemImages[fallback];
  }

  if (baseName === 'mistsplitter_reforged' || baseName === 'weapon_mistsplitter_reforged_3d') {
    const key1 = `/src/assets/items/mistsplitter_reforged.png`;
    const key2 = `/src/assets/items/weapon_mistsplitter_reforged_3d.png`;
    const key3 = `../../../assets/items/mistsplitter_reforged.png`;
    const key4 = `../../../assets/items/weapon_mistsplitter_reforged_3d.png`;
    if (itemImages[key1]) return itemImages[key1];
    if (itemImages[key2]) return itemImages[key2];
    if (itemImagesRelative[key3]) return itemImagesRelative[key3];
    if (itemImagesRelative[key4]) return itemImagesRelative[key4];
  }

  const key1 = `/src/assets/items/${baseName}.png`;
  if (itemImages[key1]) return itemImages[key1];

  const key2 = `../../../assets/items/${baseName}.png`;
  if (itemImagesRelative[key2]) return itemImagesRelative[key2];

  // Tìm kiếm mờ theo đuôi file
  for (const [path, url] of Object.entries(itemImages)) {
    if (path.toLowerCase().endsWith(`/${baseName}.png`)) return url;
  }
  for (const [path, url] of Object.entries(itemImagesRelative)) {
    if (path.toLowerCase().endsWith(`/${baseName}.png`)) return url;
  }

  return null;
}

export default getItemImageUrl;
