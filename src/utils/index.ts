import { basename, extname } from 'node:path'
import { readFileSync } from 'node:fs'
import type { IDependenceItem, ShrinkFileType } from '../types'

export function isTrueArray(arr: unknown) {
  return arr && Array.isArray(arr) && arr.length > 0
}

/**
 * @description 获取 shrink file 文件名
 * @param {string} filePath shrink file 路径
 * @returns {ShrinkFileType} 文件名
 */
export function getShrinkFileName(filePath: string): ShrinkFileType {
  const extName = extname(filePath)
  const fileName = basename(filePath, extName) + extName

  return fileName as ShrinkFileType
}

/**
 * @description 根据 shrink file 路径获取同级 package.json 文件中的项目名
 * @param {string} shrinkFilePath shrink file 路径
 */
export async function getProjectInfo(packageJsonFilePath: string) {
  const fileContent = await readFileSync(packageJsonFilePath, 'utf-8')

  const fileContentToJson = JSON.parse(fileContent)

  if (fileContentToJson) {
    return {
      projectName: fileContentToJson.name || '',
      dependenceNameList: fileContentToJson.dependencies
        ? Object.keys(fileContentToJson.dependencies)
        : [],
      devDependenceNameList: fileContentToJson.devDependencies
        ? Object.keys(fileContentToJson.devDependencies)
        : [],
    }
  }
  else {
    return {
      projectName: '',
      dependenceNameList: [],
      devDependenceNameList: [],
    }
  }
}

export function mergeVersions(originData: IDependenceItem[]) {
  const result: Record<string, string[]> = {}

  for (const item of originData) {
    const { name, version } = item

    if (result[name])
      result[name].push(version)
    else result[name] = [version]
  }

  return result
}
