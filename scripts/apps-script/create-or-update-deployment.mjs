import { execSync } from 'child_process'
import fs from 'fs'
import { google } from 'googleapis'

const ROOT = process.cwd()
const GAC_ENV =
  process.env.GOOGLE_SERVICE_ACCOUNT ||
  (() => {
    try {
      return fs.readFileSync('./gac.json', 'utf8')
    } catch {
      return null
    }
  })()
const SCRIPT_ID = process.env.APPS_SCRIPT_ID
const DEPLOYMENT_ID = process.env.APPS_SCRIPT_DEPLOYMENT_ID || null
const GITHUB_SHA = process.env.GITHUB_SHA || 'local'

if (!GAC_ENV || !SCRIPT_ID) {
  console.error('Missing required env vars: GOOGLE_SERVICE_ACCOUNT (or ./gac.json), APPS_SCRIPT_ID')
  process.exit(1)
}

// create a new version via clasp
console.log('Creating clasp version...')
const verOut = execSync(
  `npx clasp version --rootDir scripts/apps-script/webapp --description "deploy ${GITHUB_SHA}"`,
  { encoding: 'utf8' },
)
const verMatch = verOut.match(/(\d+)/)
if (!verMatch) throw new Error('Could not parse version number from clasp output')
const versionNumber = Number(verMatch[1])
console.log('Created version:', versionNumber)

// authenticate and either create or update deployment
;(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(GAC_ENV),
      scopes: [
        'https://www.googleapis.com/auth/script.deployments',
        'https://www.googleapis.com/auth/script.projects',
      ],
    })
    const client = await auth.getClient()
    const script = google.script({ version: 'v1', auth: client })

    if (DEPLOYMENT_ID) {
      console.log('Updating deployment', DEPLOYMENT_ID, 'to version', versionNumber)
      const res = await script.projects.deployments.update({
        scriptId: SCRIPT_ID,
        deploymentId: DEPLOYMENT_ID,
        requestBody: {
          deploymentConfig: {
            versionNumber,
            manifestFileName: 'appsscript',
          },
        },
      })
      console.log('Deployment updated')
      writeWebappUrlIfPresent(res.data)
    } else {
      console.log('No DEPLOYMENT_ID provided — creating new deployment for web app')
      const res = await script.projects.deployments.create({
        scriptId: SCRIPT_ID,
        requestBody: {
          deploymentConfig: {
            versionNumber,
            manifestFileName: 'appsscript',
            entryPoints: [
              {
                entryPointType: 'WEB_APP',
                webApp: {
                  access: 'ANYONE_ANONYMOUS',
                  executeAs: 'USER_DEPLOYING',
                },
              },
            ],
          },
        },
      })
      console.log('Deployment created')
      writeWebappUrlIfPresent(res.data)
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

function writeWebappUrlIfPresent(data) {
  try {
    const entryPoints = (data.deploymentConfig && data.deploymentConfig.entryPoints) || []
    for (const ep of entryPoints) {
      if (ep.entryPointType === 'WEB_APP' && ep.webApp && ep.webApp.url) {
        const url = ep.webApp.url
        fs.writeFileSync(`${ROOT}/webapp-url.txt`, url, 'utf8')
        console.log('Wrote webapp URL to webapp-url.txt')
        // Also print deployment id
        if (data.deploymentId) console.log('deploymentId:', data.deploymentId)
        return
      }
    }
    console.warn('No webApp entry point found in deployment response')
  } catch (e) {
    console.warn('Could not extract webApp URL from deployment response')
  }
}
