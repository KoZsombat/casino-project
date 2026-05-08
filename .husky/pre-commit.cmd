@echo off
REM Windows-friendly pre-commit hook
npx lint-staged
if errorlevel 1 exit /b %errorlevel%

REM Run full repository linting (frontend + backend) using root config
npx eslint . --ext .js,.jsx,.ts,.tsx --config .\eslint.config.js || exit /b 0
