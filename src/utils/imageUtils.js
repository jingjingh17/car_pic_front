/**
 * 图片处理工具类
 */

// 缩略图缓存
const thumbnailCache = new Map()

/**
 * 创建缩略图
 * @param {string} base64 - 原始base64图片
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<string>} 压缩后的base64图片
 */
export const createThumbnail = (base64, maxWidth = 200, maxHeight = 150, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 计算缩放比例
        const widthRatio = maxWidth / img.width
        const heightRatio = maxHeight / img.height
        const ratio = Math.min(widthRatio, heightRatio)
        
        // 设置canvas尺寸
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // 绘制缩放后的图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // 转换为base64
        const thumbnailBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(thumbnailBase64)
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = base64
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 获取缓存的缩略图
 * @param {string} carId - 车辆ID
 * @param {string} base64 - 原始base64图片
 * @returns {Promise<string>} 缩略图base64
 */
export const getCachedThumbnail = async (carId, base64) => {
  // 检查缓存
  if (thumbnailCache.has(carId)) {
    return thumbnailCache.get(carId)
  }
  
  try {
    // 生成缩略图
    const thumbnail = await createThumbnail(base64)
    
    // 存储到缓存
    thumbnailCache.set(carId, thumbnail)
    
    return thumbnail
  } catch (error) {
    console.error('生成缩略图失败:', error)
    return base64 // 失败时返回原图
  }
}

/**
 * 清理缓存
 */
export const clearThumbnailCache = () => {
  thumbnailCache.clear()
}

/**
 * 检查是否为有效的base64图片
 * @param {string} base64String - base64字符串
 * @returns {boolean}
 */
export const isValidBase64Image = (base64String) => {
  return base64String && base64String.startsWith('data:image/')
}

/**
 * 获取图片大小估算（KB）
 * @param {string} base64String - base64字符串
 * @returns {number} 大小（KB）
 */
export const getImageSizeKB = (base64String) => {
  if (!base64String) return 0
  
  // base64字符串大小约等于文件大小的4/3
  const stringLength = base64String.length
  const sizeInBytes = (stringLength * 3) / 4
  return Math.round(sizeInBytes / 1024)
} 