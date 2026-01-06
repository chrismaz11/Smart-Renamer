const log = (message, color) => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  }
  console.log(`${colors[color] || colors.white}${message}${colors.reset}`)
}

const logger = {
  info: (message) => log(`⚪ ${message}`, 'white'),
  error: (message) => log(`🔴 ${message}`, 'red'),
  success: (message) => log(`🟢 ${message}`, 'green'),
  warn: (message) => log(`🟡 ${message}`, 'yellow'),
  divider: () => console.log('--------------------------------------------------')
}

module.exports = logger
