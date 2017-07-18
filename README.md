GETTING STARTED OSX
-------------------
1. Install homebrew (https://brew.sh)
2. Ensure you have permissions to write to /usr/local/ `sudo chown -R $(whoami) /usr/local/`
3. Install nodejs: `brew install node`
4. Install n -- a command line tool for switching between node versions: `npm install -g n`
5. Switch to supported node version: `n 8.1.3`
6. Clone code: `git clone PROJECT_URL path/to/project`

Change directory to project for remaining steps
-----------------------------------------------
7. `cd path/to/project`
8. Install package dependencies: `npm install`

Deploy Full Stack to production
-------------------------------
1. npm install
2. npm run dev-deploy

Re-compile typescript on file change
------------------------------------
1. npm run watch

Re-run tests on file change
---------------------------
1. npm run test

Deploy Just Backend Stack
-------------------------
1. serverless deploy -s <dev,stage,prod>

Deploy Just LexBot
------------------
1. serverless deploy-lexbot -s <dev,stage,prod>

Setup VSCode text editor
------------------------
1. Install VSCode: (https://code.visualstudio.com)
2. Launch VSCode -- install command line tools (cmd-shift p to bring up command palette then type: shell command: install code command in PATH)
3. Install prettier plugin: `code --install-extension  esbenp.prettier-vscode`
4. Install tool for searching node_modules (this directory is otherwise configured to be hidden): `code --install-extension jasonnutter.search-node-modules`

Setup Atom text editor
----------------------
1. Install Atom: (https://atom.io)
2. Launch atom -- install command line tools (Preferences->Install shell commands)
3. Shutdown atom and install useful atom packages: `apm install atom-typescript tree-ignore linter linter-eslint prettier-atom`
4. Launch atom, configure prettier to reformat on filesave (Preferences->Packges->Search for 'prettier' and pick settings: Ensure checked: Silence Errors, Format Files on Save.  Ensure unchecked: ESLint Integration)
