import winston from 'winston'

export const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({ level: process.env.LOG_LEVEL || 'info' })
  ]
})

export const logVerbose = (message: string): winston.Logger =>
  logger.log('verbose', message)

export const logInfo = (message: string): winston.Logger =>
  logger.log('info', message)

export const logError = (message: string): winston.Logger =>
  logger.log('error', message)
