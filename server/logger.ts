import winston from 'winston'

const formatMessage = (message: string): string =>
  `${new Date().toISOString()} ${message}`

export const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
})

export const logVerbose = (message: string): winston.Logger =>
  logger.log('verbose', formatMessage(message))

export const logInfo = (message: string): winston.Logger =>
  logger.log('info', formatMessage(message))

export const logError = (message: string): winston.Logger =>
  logger.log('error', formatMessage(message))
