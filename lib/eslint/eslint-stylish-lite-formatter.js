const chalk = require('chalk'),
      stripAnsi = require('strip-ansi'),
      table = require('text-table');


module.exports = function(results) {

  let output = '\n',
      errorCount = 0,
      warningCount = 0;

  results.forEach(result => {
    const messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;

    output += `${chalk.underline(result.filePath)}\n`;

    output += `${table(
      messages.map(message => {
        let messageType;

        if (message.fatal || message.severity === 2) {
          messageType = chalk.red('error');
        }
        else {
          messageType = chalk.yellow('warning');
        }

        return [
          '',
          message.line || 0,
          message.column || 0,
          messageType,
          message.message.replace(/([^ ])\.$/u, '$1'),
          chalk.dim(message.ruleId || ''),
        ];
      }),
      {
        align: ['', 'r', 'l'],
        stringLength(str) {
          return stripAnsi(str).length;
        },
      },
    ).split('\n').map(el => el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`))).join('\n')}\n\n`;
  });

  const total = errorCount + warningCount;

  return total > 0 ? output : '';
};
