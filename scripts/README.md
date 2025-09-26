# RedSky Deployment Scripts

## Development Setup
Run `\scripts\dev-setup.ps1` to:
- Install dependencies
- Configure environment variables
- Prepare databases

## Staging Deployment
Run `\scripts\staging-deploy.ps1` to:
- Build release artifacts
- Configure staging environment

## Production Deployment
1. Set environment variables:
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_APP_NAME`
2. Run `\scripts\prod-deploy.ps1`

## Common Functions
- `common.ps1` contains shared functions used by all scripts
