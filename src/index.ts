import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { cwd } from 'node:process'
import * as yarnLock from '@yarnpkg/lockfile'

import yaml from 'js-yaml'
import type {
  IDependenceItem,
  IParseLockRes,
  IParseRes,
  IParseResItem,
  PnpmLockResult,
} from './types/index.d.ts'
import { findShinkFiles } from './path'
import {
  getFirstLevelDependenceMap,
  getProjectInfo,
  getShrinkFileName,
  isTrueArray,
  mergeVersions,
} from './utils'

/**
 * 解析单个 lock 文件
 * @param filePath lock 文件的路径
 * @returns {IParseLockRes}
 */
function parseSingleLockFile(filePath: string) {
  const fileName = getShrinkFileName(filePath)
  const fileContent = readFileSync(filePath, 'utf8')

  const parseLockFileRes: IParseLockRes = {
    dependenceList: [],
    dependenceMap: {},
  }

  try {
    if (fileName === 'package-lock.json') {
      const packageLock = JSON.parse(fileContent)
      // package-lock.json version 2 和 3 版本都存在 packages 字段，因此用该字段解析
      const { packages } = packageLock

      for (const packageKey in packages) {
        if (packageKey && packageKey.startsWith('node_modules')) {
          const name = packageKey.replace(/node_modules\//, '')
          const version = packages[packageKey].version
          const unique = name + version

          parseLockFileRes.dependenceList.push({
            name,
            version,
            unique,
          })
        }
      }
    }
    else if (fileName === 'yarn.lock') {
      const dependencies = yarnLock.parse
        ? yarnLock.parse(fileContent)?.object
        : (yarnLock as any).default.parse(fileContent)?.object
      const tempDependenceList: IDependenceItem[] = []

      for (const dependenceKey in dependencies) {
        // 正向断言，匹配字符串中的最后一个 @ 字符，并取 @ 字符之前的内容
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
      // 由于 yarn.lock 中解析出来会有很多重复的数据，使用对象集合进行去重
      parseLockFileRes.dependenceList = JSON.parse(
        JSON.stringify(
          Array.from(
            new Map(
              tempDependenceList.map(item => [item.unique, item]),
            ).values(),
          ),
        ),
      )
    }
    else if (fileName === 'pnpm-lock.yaml') {
      const pnpmLock = yaml.load(fileContent) as PnpmLockResult
      const { packages } = pnpmLock
      const keyList = []

      for (const packageKey in packages) {
        // 匹配字符串第开头的 / 到第一个 _ 中间的内容，不包含 / 和 _
        // pnpm-lock 中会用 _ 来链接依赖和子依赖，需要去除子依赖
        const pattern = /^\/(.*?)(?:_|$)/
        const match = packageKey.match(pattern)

        if (match && match.length === 2) {
          const key = match[1]
          keyList.push(key)
        }
      }
      // 数据去重
      const uniqueKeyList = [...new Set(keyList)]

      uniqueKeyList.forEach((key) => {
        // pnpm-lock 的依赖名和版本号会用 / 来分割，需要取到最后一个 / 所在的位置，以此进行分割
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

    // 由于同一个依赖名可能会有多个版本记录，因此对同一个依赖的多个版本进行合并，即一个依赖名对应一个版本数组
    parseLockFileRes.dependenceMap = mergeVersions(
      parseLockFileRes.dependenceList,
    )

    return parseLockFileRes
  }
  catch (err) {
    console.error('[@king-fisher/lockfile-parse parseSingleLockFile] error!')
    console.error(err)
  }
}

/**
 * @description 解析所有的 lock 文件
 * @param root 根路径
 * @returns {IParseRes}
 */
async function parseLockFiles(root?: string) {
  const rootPath = root || cwd()
  const res: IParseRes = []

  const shrinkFilePathList = await findShinkFiles(rootPath)

  try {
    if (isTrueArray(shrinkFilePathList)) {
      for (const shrinkFilePath of shrinkFilePathList) {
        const projectRootPath = dirname(shrinkFilePath)
        const packageJsonFilePath = join(
          dirname(shrinkFilePath),
          'package.json',
        )
        const { projectName, dependenceNameList, devDependenceNameList }
          = await getProjectInfo(packageJsonFilePath)
        const parseRes = parseSingleLockFile(shrinkFilePath)

        const firstLevelDependenceNameList = [
          ...dependenceNameList,
          ...devDependenceNameList,
        ]
        const firstLevelDependenceMap = getFirstLevelDependenceMap(
          firstLevelDependenceNameList,
          (parseRes as IParseLockRes).dependenceMap,
        )

        if (parseRes) {
          res.push({
            projectName,
            projectRootPath,
            packageJsonFilePath,
            lockFilePath: shrinkFilePath,
            dependenceNameList,
            devDependenceNameList,
            firstLevelDependenceMap,
            ...parseRes,
          })
        }
      }
    }
    return res
  }
  catch (err) {
    console.error('[@king-fisher/lockfile-parse parseLockFiles] error!')
    console.error(err)
  }
}

export {
  parseLockFiles,
  parseSingleLockFile,
  IParseLockRes,
  IParseResItem,
  IParseRes,
  IDependenceItem,
}
