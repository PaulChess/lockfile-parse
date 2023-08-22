import { isAbsolute } from 'node:path'
import { cwd, exit } from 'node:process'
import { glob } from 'glob'
import { isTrueArray } from './utils/index'
import { errorLog, successLog, warningLog } from './utils/logger'

/**
 * @description 获取匹配的文件绝对路径列表
 * @param pattern 匹配模式
 * @param infoPrefix 提示信息前缀
 * @returns 匹配文件的绝对路径列表
 */
export async function getMatchedFiles(
  pattern: string[] | string,
  infoPrefix: string,
) {
  const absoluteFilePathList = []

  const files = await glob(pattern, {
    ignore: '**/node_modules/**',
  })

  if (isTrueArray(files)) {
    warningLog('=========================')
    warningLog(`${infoPrefix} List:`)
    for (const file of files) {
      const absolutePath = isAbsolute(file) ? file : `${cwd()}/${file}`
      absoluteFilePathList.push(absolutePath)
      successLog(`${infoPrefix} path: ${absolutePath}`)
    }
    return absoluteFilePathList
  }
  else {
    errorLog(`未找到 ${infoPrefix}`)
    // 状态码 0：正常退出，1：非正常退出
    exit(0)
  }
}

/**
 * @description 获取 shrink file 路径。shrink file: package-lock.json, yarn.lock, pnpm-lock.yaml
 * @returns 获取匹配的 shrink file 绝对路径列表
 */
export async function findShinkFiles(prefix = '') {
  const sep = prefix ? '/' : ''
  const pattern = [
    `${prefix}${sep}**/package-lock.json`,
    `${prefix}${sep}**/yarn.lock`,
    `${prefix}${sep}**/pnpm-lock.yaml`,
  ]
  const shrinkFilePathList = await getMatchedFiles(pattern, 'shrinkFiles')

  return shrinkFilePathList
}
