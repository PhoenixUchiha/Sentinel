const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
    SUCCESS: '\x1b[32m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
    DEBUG: '\x1b[35m',
    INFO: '\x1b[36m'
};

class Logger {
    static isProduction = process.env.NODE_ENV === 'production';

    static formatMessage(level, message, shardId) {
        const timestamp = new Date().toLocaleTimeString();
        const color = COLORS[level];
        const shardInfo = shardId !== undefined ? `${COLORS.WHITE}[SHARD ${shardId}]${COLORS.RESET} ` : '';
        return `${COLORS.DIM}[${timestamp}]${COLORS.RESET} ${shardInfo}${color}${COLORS.BRIGHT}${level.padEnd(7)}${COLORS.RESET} ${message}`;
    }

    static info(message, shardId) {
        console.log(this.formatMessage('INFO', message, shardId));
    }

    static warn(message, shardId) {
        console.warn(this.formatMessage('WARN', message, shardId));
    }

    static error(message, shardId) {
        const msg = message instanceof Error ? message.stack || message.message : message;
        console.error(this.formatMessage('ERROR', msg, shardId));
    }

    static debug(message, shardId) {
        if (this.isProduction) return;
        console.log(this.formatMessage('DEBUG', message, shardId));
    }

    static success(message, shardId) {
        console.log(this.formatMessage('SUCCESS', message, shardId));
    }

    static banner() {
        const banner = `
${COLORS.CYAN}${COLORS.BRIGHT}
███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗     
██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║     
███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║     
╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║     
███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
${COLORS.RESET}
${COLORS.DIM}Sentinel-Ready Discord Infrastructure${COLORS.RESET}
`;
        console.log(banner);
    }

    static logCommand(commandName, user, guild, latency, shardId) {
        const latencyColor = latency > 500 ? COLORS.RED : latency > 200 ? COLORS.YELLOW : COLORS.GREEN;
        this.info(`${COLORS.WHITE}${user}${COLORS.RESET} in ${COLORS.WHITE}${guild}${COLORS.RESET} executed ${COLORS.BRIGHT}${commandName}${COLORS.RESET} - ${latencyColor}${latency}ms${COLORS.RESET}`, shardId);
    }

    static logEvent(eventName, latency, shardId) {
        this.debug(`Event ${COLORS.BRIGHT}${eventName}${COLORS.RESET} - ${COLORS.CYAN}${latency}ms${COLORS.RESET}`, shardId);
    }
}

module.exports = { Logger };
