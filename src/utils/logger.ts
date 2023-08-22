import colors from 'picocolors'

export function successLog(message: string) {
  console.log(colors.green(message))
}

export function errorLog(message: string) {
  console.log(colors.red(message))
}

export function warningLog(message: string) {
  console.log(colors.yellow(message))
}
