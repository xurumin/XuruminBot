import chalk from "chalk"

type LogLevel = "info" | "warn" | "error";
function levelLabel(level: LogLevel) {
  let bgColor = chalk.bgGray;

  if(level === "warn") {
    bgColor = chalk.bgYellowBright;
  } else if(level === "error") {
    bgColor = chalk.bgRedBright;
  }

  return bgColor(chalk.black(`[${level.toUpperCase()}]`));
}

export function info(message: string) {
  console.log(levelLabel("info"), message);
}

export function warn(message: string) {
  console.warn(levelLabel("warn"), chalk.yellowBright(message));
}

export function error(message: string) {
  console.error(chalk.redBright(`[ERROR] ${message}`));
}
