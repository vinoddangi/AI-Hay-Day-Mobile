import { execSync } from 'child_process'
import fs from 'fs'
import { google } from 'googleapis'

const ROOT = process.cwd()
const GAC_ENV = process.env.GOOGLE_SERVICE_ACCOUNT
const SCRIPT_ID = process.env.APPS_SCRIPT_ID
const DEPLOYMENT_ID = process.env.APPS_SCRIPT_DEPLOYMENT_ID
const GITHUB_SHA = process.env.GITHUB_SHA || 'ci'

if (!GAC_ENV || !SCRIPT_ID || !DEPLOYMENT_ID) {
  console.error(
    'Missing required env vars: GOOGLE_SERVICE_ACCOUNT, APPS_SCRIPT_ID, APPS_SCRIPT_DEPLOYMENT_ID',
  )
  process.exit(1)
}

const credsPath = `${ROOT}/gac.json`
fs.writeFileSync(credsPath, GAC_ENV)

try {
  // create a new version via clasp
  console.log('Creating clasp version...')
  const verOut = execSync(
    `npx clasp version --rootDir scripts/apps-script/webapp --description "CI ${GITHUB_SHA}"`,
    { encoding: 'utf8' },
  )
  const verMatch = verOut.match(/(\d+)/)
  if (!verMatch) throw new Error('Could not parse version number from clasp output')
  const versionNumber = Number(verMatch[1])
  console.log('Created version:', versionNumber)

  // Use googleapis to update the deployment to point to the new version
  console.log('Authenticating service account...')
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(GAC_ENV),
    scopes: [
      'https://www.googleapis.com/auth/script.deployments',
      'https://www.googleapis.com/auth/script.projects',
    ],
  })
  const client = await auth.getClient()
  const script = google.script({ version: 'v1', auth: client })

  console.log('Updating deployment to version:', versionNumber)
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
  console.log(JSON.stringify(res.data, null, 2))

  // attempt to extract webApp URL and write to file for CI
  try {
    const entryPoints = (res.data.deploymentConfig && res.data.deploymentConfig.entryPoints) || []
    for (const ep of entryPoints) {
      if (ep.entryPointType === 'WEB_APP' && ep.webApp && ep.webApp.url) {
        const url = ep.webApp.url
        fs.writeFileSync(`${ROOT}/webapp-url.txt`, url, 'utf8')
        console.log('Wrote webapp URL to webapp-url.txt')
        break
      }
    }
  } catch (e) {
    console.warn('Could not extract webApp URL from deployment response')
  }
} catch (err) {
  console.error(err)
  process.exit(1)
}
