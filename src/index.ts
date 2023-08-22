/**
 * @description 获取 shrink file 文件名
 * @param {string} filePath shrink file 路径
 * @returns {ShrinkFileType} 文件名
 */

import { readFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { cwd } from 'node:process'
import yarnLock from '@yarnpkg/lockfile'
import yaml from 'js-yaml'
import type { IDependenceItem, IParseLockRes, IParseRes, PnpmLockResult, ShrinkFileType } from './types'
import { findShinkFiles } from './path'
import { isTrueArray } from './utils'

function getShrinkFileName(filePath: string): ShrinkFileType {
  const extName = extname(filePath)
  const fileName = basename(filePath, extName) + extName

  return fileName as ShrinkFileType
}

export function parseLockFile(filePath: string) {
  const fileName = getShrinkFileName(filePath)
  const fileContent = readFileSync(filePath, 'utf8')

  const parseLockFileRes: IParseLockRes = {
    dependenceList: [],
    dependenceMap: {},
  }

  try {
    if (fileName === 'package-lock.json') {
      const packageLock = JSON.parse(fileContent)
      const { dependencies } = packageLock

      for (const packageKey in dependencies) {
        const name = packageKey
        const version = dependencies[packageKey].version
        const unique = name + version

        parseLockFileRes.dependenceList.push({
          name,
          version,
          unique,
        })
      }
    }
    else if (fileName === 'yarn.lock') {
      const dependencies = yarnLock.parse(fileContent)?.object
      const tempDependenceList: IDependenceItem[] = []

      for (const dependenceKey in dependencies) {
        const regex = /.*(?=@)/
        const match = dependenceKey.match(regex)

        if (match?.length) {
          const name = match[0]
          const version = dependencies[dependenceKey].version
          // 生成一个唯一 key，用于去重
          const unique = name + version

          tempDependenceList.push({
            name,
            version,
            unique,
          })
        }
      }
      // 使用对象集合进行去重
      parseLockFileRes.dependenceList = JSON.parse(JSON.stringify(
        Array.from(
          new Map(
            tempDependenceList.map(item => [item.unique, item]),
          ).values(),
        ),
      ))
    }
    else if (fileName === 'pnpm-lock.yaml') {
      const pnpmLock = yaml.load(fileContent) as PnpmLockResult
      const { packages } = pnpmLock
      const keyList = []

      for (const packageKey in packages) {
        const pattern = /^\/(.*?)(?:_|$)/
        const match = packageKey.match(pattern)

        if (match && match.length === 2) {
          const key = match[1]
          keyList.push(key)
        }
      }
      const uniqueKeyList = [...new Set(keyList)]

      uniqueKeyList.forEach((key) => {
        const lastSlashIndex = key.lastIndexOf('/')

        if (lastSlashIndex !== -1) {
          const name = key.substring(0, lastSlashIndex)
          const version = key.substring(lastSlashIndex + 1)
          parseLockFileRes.dependenceList.push({
            name,
            version,
            unique: key,
          })
        }
      })
    }

    parseLockFileRes.dependenceMap = mergeVersions(parseLockFileRes.dependenceList)

    return parseLockFileRes
  }
  catch (err) {
    console.error(err)
  }
}

function mergeVersions(originData: IDependenceItem[]) {
  const result: Record<string, string[]> = {}

  for (const item of originData) {
    const { name, version } = item

    if (result[name])
      result[name].push(version)

    else
      result[name] = [version]
  }

  return result
}

/**
 * @description 根据 shrink file 路径获取同级 package.json 文件中的项目名
 * @param {string} shrinkFilePath shrink file 路径
 */
async function getProjectInfo(packageJsonFilePath: string) {
  const fileContent = await readFileSync(packageJsonFilePath, 'utf-8')

  const fileContentToJson = JSON.parse(fileContent)

  if (fileContentToJson) {
    return {
      projectName: fileContentToJson.name || '',
      dependenceNameList: fileContentToJson.dependencies ? Object.keys(fileContentToJson.dependencies) : [],
      devDependenceNameList: fileContentToJson.devDependencies ? Object.keys(fileContentToJson.devDependencies) : [],
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

// const res1 = parseLockFile('/Users/paulchess/Desktop/Home/@paulchess/lockfile-parse/locks/package-lock.json')
// const res2 = parseLockFile('/Users/paulchess/Desktop/Home/@paulchess/lockfile-parse/locks/yarn.lock')
// const res3 = parseLockFile('/Users/paulchess/Desktop/Home/@paulchess/lockfile-parse/locks/pnpm-lock.yaml')

async function parseAllLockFile(root?: string) {
  const rootPath = root || cwd()

  const shrinkFilePathList = await findShinkFiles(rootPath)

  const res: IParseRes = []

  if (isTrueArray(shrinkFilePathList)) {
    for (const shrinkFilePath of shrinkFilePathList) {
      const packageJsonFilePath = join(dirname(shrinkFilePath), 'package.json')
      const projectInfo = await getProjectInfo(packageJsonFilePath)
      const parseRes = parseLockFile(shrinkFilePath)

      if (parseRes) {
        res.push({
          ...parseRes,
          packageJsonFilePath,
          lockFilePath: shrinkFilePath,
          devDependenceNameList: projectInfo.devDependenceNameList,
          dependenceNameList: projectInfo.dependenceNameList,
          projectName: projectInfo.projectName,
        })
      }
    }
  }
  return res
}

await parseAllLockFile('/Users/paulchess/Desktop/Home/@paulchess/lockfile-parse/locks')
