export type ShrinkFileType = 'package-lock.json' | 'yarn.lock' | 'pnpm-lock.yaml'
export interface IDependenceItem {
  name: string
  version: string
  unique?: string
}

export interface IParseLockRes {
  dependenceList: IDependenceItem[]
  dependenceMap: {
    [key: string]: string[]
  }
}

export type IParseRes = {
  lockFilePath: string
  packageJsonFilePath: string
  projectName: string
  dependenceNameList: string[]
  devDependenceNameList: string[]
  dependenceList: IDependenceItem[]
  dependenceMap: {
    [key: string]: string[]
  }
}[]

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
