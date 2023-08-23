export type ShrinkFileType = 'package-lock.json' | 'yarn.lock' | 'pnpm-lock.yaml'
export interface IDependenceItem {
  /**
   * @param 依赖名称
   */
  name: string
  /**
   * @param 依赖版本
   */
  version: string
  /**
   * @param 依赖唯一标识，用于去重
   */
  unique?: string
}

export interface IParseLockRes {
  /**
   * @param lock 文件中的依赖数组
   */
  dependenceList: IDependenceItem[]
  /**
   * @param lock 文件中的依赖关系 Map
   */
  dependenceMap: {
    [key: string]: string[]
  }
}

export type IParseResItem = {
  /**
   * @param lock 文件路径
   */
  lockFilePath: string
  /**
   * @param package.json 文件路径
   */
  packageJsonFilePath: string
  /**
   * @param 项目名
   */
  projectName: string
  /**
   * @param dependencies 依赖名称数组
   */
  dependenceNameList: string[]
  /**
   * @param devDependencies dev依赖名称数组
   */
  devDependenceNameList: string[]
  /**
   * @param 一级依赖（dependencies & devDependencies) 版本关系 Map
   */
  firstLevelDependenceMap: {
    [key: string]: string[]
  }
} & IParseLockRes

export type IParseRes = IParseResItem[]

export interface PnpmLockResult {
  packages: Record<
    string,
    {
      resolution: {
        integrity: string
      }
      dependencies?: Record<string, string>
    }
  >
}
