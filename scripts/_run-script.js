require('module-alias/register');

const { execSync } = require('child_process');

/**
 *  this is just a helper script to run scripts using yarn script <script>
 **/

const script = process.argv[2];
const params = process.argv.slice(3);

try {
  execSync(`node ./scripts/${script} ${params.join(' ')}`, { stdio: [0, 1, 2] });
}
catch {
  process.exit(1);
}

